import express from "express";
import rateLimit from "express-rate-limit";
import { login, refresh, logout } from "../controllers/auth.controller.js";

const router = express.Router();

const loginLimiter = rateLimit({
  // windowMs: 15 * 60 * 1000, // 15 minutes
  // max: 11, // Limit each IP to 11 login requests per `window` (here, per 15 minutes)
  // message: {
  //   message: "Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit"
  // },
  // standardHeaders: true, 
  // legacyHeaders: false, 
});

router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;