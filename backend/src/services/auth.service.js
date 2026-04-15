import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByNip } from "../repositories/user.repository.js";
import { saveRefreshToken, findRefreshToken, deleteRefreshToken } from "../repositories/token.repository.js";

const generateTokens = async (user, rememberMe) => {
  const payload = {
    user_id: user.user_id,
    role: user.roles_name || user.role,
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

  await saveRefreshToken(user.user_id, refreshToken, expiresAt);

  return { accessToken, refreshToken, expiresInMs };
};

export const loginService = async ({ nip, password, rememberMe }) => {
  const user = await findUserByNip(nip);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error("Password salah");
  }

  const { accessToken, refreshToken, expiresInMs } = await generateTokens(user, rememberMe);

  return {
    message: "Login berhasil",
    accessToken,
    refreshToken,
    expiresInMs,
    role: user.roles_name
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

  // Find user to get current info
  // decoded will have user_id and role. We can just reuse decoded, or fetch from DB.
  // Reusing decoded payload:
  const user = { user_id: decoded.user_id, role: decoded.role };

  const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresInMs } = await generateTokens(user, rememberMe);
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresInMs };
};

export const logoutService = async (refreshToken) => {
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }
};