import express from "express";
import {
  getPegawaiEarlyWarnings,
  getPegawaiList,
  getPegawaiReferences,
  patchPromotionJabatan,
  patchPegawai,
  postPegawai,
  removePegawai,
} from "../controllers/pegawai.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/early-warning", authorizeRoles("admin", "pimpinan"), getPegawaiEarlyWarnings);
router.get("/", authorizeRoles("admin", "pimpinan"), getPegawaiList);
router.get("/references", authorizeRoles("admin", "pimpinan"), getPegawaiReferences);
router.patch("/:id/promotion-jabatan", authorizeRoles("admin", "pimpinan"), patchPromotionJabatan);
router.post("/", authorizeRoles("admin"), postPegawai);
router.patch("/:id", authorizeRoles("admin"), patchPegawai);
router.delete("/:id", authorizeRoles("admin"), removePegawai);

export default router;
