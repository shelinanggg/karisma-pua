import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import butirKegiatanRoutes from "./routes/butirKegiatan.routes.js";
import pegawaiRoutes from "./routes/pegawai.routes.js";
import penugasanRoutes from "./routes/penugasan.routes.js";
import periodeSkpRoutes from "./routes/periodeSkp.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/butir-kegiatan", butirKegiatanRoutes);
app.use("/api/pegawai", pegawaiRoutes);
app.use("/api/penugasan", penugasanRoutes);
app.use("/api/periode-skp", periodeSkpRoutes);

export default app;
