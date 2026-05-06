import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
};

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  const userRole = String(req.user.role || "").toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    return res.status(403).json({ message: "Anda tidak memiliki akses untuk fitur ini." });
  }

  next();
};
