import { loginService, refreshService, logoutService } from "../services/auth.service.js";

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