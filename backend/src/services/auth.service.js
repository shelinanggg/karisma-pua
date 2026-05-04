import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByNip,
  findUserPasswordById,
  findUserProfileById,
  updateUserPasswordHash,
} from "../repositories/user.repository.js";
import { saveRefreshToken, findRefreshToken, deleteRefreshToken } from "../repositories/token.repository.js";

const generateTokens = async (pengguna, rememberMe) => {
  const payload = {
    id_pengguna: pengguna.id_pengguna,
    role: pengguna.roles_name || pengguna.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? "7d" : "8h",
  });

  // Calculate expiration date for DB
  const expiresInMs = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + expiresInMs);

  await saveRefreshToken(pengguna.id_pengguna, refreshToken, expiresAt);

  return { accessToken, refreshToken, expiresInMs };
};

export const loginService = async ({ nip, password, rememberMe }) => {
  const pengguna = await findUserByNip(nip);

  if (!pengguna) {
    throw new Error("Pengguna tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(password, pengguna.password_hash);

  if (!isMatch) {
    throw new Error("Password salah");
  }

  const { accessToken, refreshToken, expiresInMs } = await generateTokens(pengguna, rememberMe);

  return {
    message: "Login berhasil",
    accessToken,
    refreshToken,
    expiresInMs,
    role: pengguna.roles_name
  };
};

export const refreshService = async (oldRefreshToken, rememberMe) => {
  if (!oldRefreshToken) throw new Error("Akses ditolak. Token tidak ditemukan.");

  // Verify DB record
  const tokenRecord = await findRefreshToken(oldRefreshToken);
  if (!tokenRecord) {
    throw new Error("Sesi tidak valid / sudah kedaluwarsa.");
  }

  // Delete old token (Rotation)
  await deleteRefreshToken(oldRefreshToken);

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Sesi kedaluwarsa, silakan login kembali.");
  }

  // Reuse decoded payload to reconstruct pengguna object
  const pengguna = { id_pengguna: decoded.id_pengguna, role: decoded.role };

  const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresInMs } = await generateTokens(pengguna, rememberMe);
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresInMs };
};

export const logoutService = async (refreshToken) => {
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }
};

export const getCurrentUserService = async (idPengguna) => {
  const pengguna = await findUserProfileById(idPengguna);

  if (!pengguna) {
    throw new Error("Pengguna tidak ditemukan");
  }

  return pengguna;
};

export const changePasswordService = async (idPengguna, payload) => {
  const { currentPassword, newPassword, confirmPassword } = payload;

  if (!currentPassword || !newPassword || !confirmPassword) {
    const error = new Error("Semua kolom wajib diisi.");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error("Password baru dan konfirmasi tidak cocok.");
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error("Password baru minimal 8 karakter.");
    error.statusCode = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error("Password baru harus berbeda dari password saat ini.");
    error.statusCode = 400;
    throw error;
  }

  const pengguna = await findUserPasswordById(idPengguna);

  if (!pengguna) {
    const error = new Error("Pengguna tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, pengguna.password_hash);

  if (!isCurrentPasswordValid) {
    const error = new Error("Password saat ini salah.");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPasswordHash(idPengguna, passwordHash);

  return { message: "Password berhasil diubah." };
};
