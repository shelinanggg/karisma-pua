import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import butirKegiatanRoutes from "./routes/butirKegiatan.routes.js";
import pegawaiRoutes from "./routes/pegawai.routes.js";
import penugasanRoutes from "./routes/penugasan.routes.js";
import periodeSkpRoutes from "./routes/periodeSkp.routes.js";
import sistemRoutes from "./routes/sistem.routes.js";
import { env } from "./config/env.js";
import { auditCrudActivity } from "./middlewares/audit.middleware.js";

const app = express();

const configuredOrigins = (env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
];

const allowedOrigins = new Set([...defaultDevOrigins, ...configuredOrigins]);
const isPrivateLanOrigin = (origin) =>
  /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    if (process.env.NODE_ENV !== "production" && isPrivateLanOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(auditCrudActivity);

app.use("/api/auth", authRoutes);
app.use("/api/butir-kegiatan", butirKegiatanRoutes);
app.use("/api/pegawai", pegawaiRoutes);
app.use("/api/penugasan", penugasanRoutes);
app.use("/api/periode-skp", periodeSkpRoutes);
app.use("/api/sistem", sistemRoutes);

export default app;
