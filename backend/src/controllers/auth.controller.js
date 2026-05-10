import {
  changePasswordService,
  getCurrentUserService,
  loginService,
  logoutService,
  refreshService,
} from "../services/auth.service.js";
import { createAuditLog } from "../repositories/sistem.repository.js";

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "";
};

const writeLoginAudit = async (req, { result = null, error = null } = {}) => {
  try {
    const auditUser = error?.auditUser ?? {};
    const status = result ? "Berhasil" : "Gagal";
    const userName = result?.nama ?? auditUser.nama ?? (auditUser.nip ? `NIP ${auditUser.nip}` : "Tidak Dikenal");

    await createAuditLog({
      idPengguna: result?.idPengguna ?? auditUser.id_pengguna ?? null,
      userName,
      userRole: result?.role ?? auditUser.role ?? null,
      activityType: "Login",
      action: "login",
      resource: "auth",
      description: status === "Berhasil" ? "Pengguna berhasil login." : `Login gagal: ${error?.message || "Autentikasi gagal"}.`,
      status,
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"] || "",
      metadata: { nip: req.body?.nip ?? auditUser.nip ?? null },
    });
  } catch {
    // Audit logging should not change the auth response.
  }
};

const setRefreshTokenCookie = (res, refreshToken, expiresInMs) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: expiresInMs,
  });
};

export const login = async (req, res, next) => {
  try {
    const { nip, password, rememberMe } = req.body;
    const result = await loginService({ nip, password, rememberMe });
    await writeLoginAudit(req, { result });
    
    setRefreshTokenCookie(res, result.refreshToken, result.expiresInMs);

    // Send everything except refreshToken
    res.status(200).json({
      message: result.message,
      accessToken: result.accessToken,
      role: result.role,
    });
  } catch (err) {
    await writeLoginAudit(req, { error: err });
    res.status(400).json({
      message: err.message,
    });
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { rememberMe } = req.body; // Can be passed to keep the same behavior
    
    const result = await refreshService(refreshToken, rememberMe);
    
    setRefreshTokenCookie(res, result.refreshToken, result.expiresInMs);

    res.status(200).json({
      accessToken: result.accessToken,
    });
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    await logoutService(refreshToken);
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout berhasil" });
  } catch (err) {
    res.status(500).json({ message: "Gagal logout" });
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const data = await getCurrentUserService(req.user.id_pengguna);

    res.status(200).json({
      message: "Profil pengguna berhasil diambil",
      data,
    });
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const result = await changePasswordService(req.user.id_pengguna, req.body);

    res.status(200).json({
      message: result.message,
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      message: err.message,
    });
  }
};
