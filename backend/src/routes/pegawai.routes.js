import express from "express";
import {
  getPegawaiEarlyWarnings,
  getPegawaiList,
  getPegawaiReferences,
  patchPegawai,
  postPegawai,
  removePegawai,
} from "../controllers/pegawai.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/", getPegawaiList);
router.get("/references", getPegawaiReferences);
router.get("/early-warning", getPegawaiEarlyWarnings);
router.post("/", postPegawai);
router.patch("/:id", patchPegawai);
router.delete("/:id", removePegawai);

export default router;
