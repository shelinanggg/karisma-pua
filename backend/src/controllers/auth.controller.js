import {
  changePasswordService,
  getCurrentUserService,
  loginService,
  logoutService,
  refreshService,
} from "../services/auth.service.js";

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
    
    setRefreshTokenCookie(res, result.refreshToken, result.expiresInMs);

    // Send everything except refreshToken
    res.status(200).json({
      message: result.message,
      accessToken: result.accessToken,
      role: result.role,
    });
  } catch (err) {
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
