import express from "express";
import {
  getAdditionalAssignment,
  getAdditionalAssignments,
  getApprovalRealisasiByEmployee,
  getApprovalRealisasiEmployees,
  getButirAssignmentsByEmployee,
  getMyDashboard,
  getMyButirAssignments,
  getMyAdditionalAssignments,
  getMyRealisasi,
  getPenugasanEmployees,
  getPimpinanKegiatanDashboard,
  patchApproveRealisasi,
  patchMyButirTarget,
  patchAdditionalAssignment,
  patchButirAssignment,
  postAdditionalAssignment,
  postButirAssignment,
  postMyRealisasi,
  removeButirAssignment,
} from "../controllers/penugasan.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/pimpinan/kegiatan", authorizeRoles("pimpinan"), getPimpinanKegiatanDashboard);
router.get("/pegawai", authorizeRoles("admin"), getPenugasanEmployees);
router.post("/butir", authorizeRoles("admin"), postButirAssignment);
router.get("/dashboard/saya", authorizeRoles("pegawai"), getMyDashboard);
router.get("/butir/saya", authorizeRoles("pegawai"), getMyButirAssignments);
router.patch("/butir/saya/:id/target", authorizeRoles("pegawai"), patchMyButirTarget);
router.get("/butir/pegawai/:pegawaiId", authorizeRoles("admin", "pimpinan"), getButirAssignmentsByEmployee);
router.patch("/butir/:id", authorizeRoles("admin"), patchButirAssignment);
router.delete("/butir/:id", authorizeRoles("admin"), removeButirAssignment);
router.get("/realisasi/saya", authorizeRoles("pegawai"), getMyRealisasi);
router.post("/realisasi/saya", authorizeRoles("pegawai"), postMyRealisasi);
router.get("/approval-skp/pegawai", authorizeRoles("pimpinan"), getApprovalRealisasiEmployees);
router.get("/approval-skp/pegawai/:pegawaiId/realisasi", authorizeRoles("pimpinan"), getApprovalRealisasiByEmployee);
router.patch("/approval-skp/realisasi/approve", authorizeRoles("pimpinan"), patchApproveRealisasi);
router.get("/tambahan/saya", authorizeRoles("pegawai"), getMyAdditionalAssignments);
router.get("/tambahan", authorizeRoles("admin"), getAdditionalAssignments);
router.get("/tambahan/:id", authorizeRoles("admin"), getAdditionalAssignment);
router.post("/tambahan", authorizeRoles("admin"), postAdditionalAssignment);
router.patch("/tambahan/:id", authorizeRoles("admin"), patchAdditionalAssignment);

export default router;
