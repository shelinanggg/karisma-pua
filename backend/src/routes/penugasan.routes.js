import express from "express";
import {
  getAdditionalAssignment,
  getAdditionalAssignments,
  getApprovalRealisasiByEmployee,
  getApprovalRealisasiEmployees,
  getButirAssignmentsByEmployee,
  getMainDashboard,
  getMyDashboard,
  getMyButirAssignments,
  getMyAdditionalAssignments,
  getMyRealisasi,
  getPendingApprovalKegiatan,
  getPenugasanEmployees,
  getPimpinanKinerjaByEmployee,
  getPimpinanKegiatanDashboard,
  patchApproveKegiatan,
  patchApproveRealisasi,
  patchMyButirTarget,
  patchAdditionalAssignment,
  patchButirAssignment,
  postAdditionalAssignment,
  postButirAssignment,
  postMyRealisasi,
  removeButirAssignment,
  submitMyKegiatanApproval,
} from "../controllers/penugasan.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/dashboard/utama", authorizeRoles("admin", "pimpinan"), getMainDashboard);
router.get("/pimpinan/kegiatan", authorizeRoles("admin", "pimpinan"), getPimpinanKegiatanDashboard);
router.get("/pimpinan/pegawai", authorizeRoles("pimpinan"), getPenugasanEmployees);
router.get("/pimpinan/kinerja/pegawai/:pegawaiId", authorizeRoles("pimpinan"), getPimpinanKinerjaByEmployee);
router.post("/pimpinan/butir", authorizeRoles("pimpinan"), postButirAssignment);
router.get("/pimpinan/butir/pegawai/:pegawaiId", authorizeRoles("pimpinan"), getButirAssignmentsByEmployee);
router.patch("/pimpinan/butir/:id", authorizeRoles("pimpinan"), patchButirAssignment);
router.get("/pimpinan/tambahan", authorizeRoles("pimpinan"), getAdditionalAssignments);
router.get("/pimpinan/tambahan/:id", authorizeRoles("pimpinan"), getAdditionalAssignment);
router.post("/pimpinan/tambahan", authorizeRoles("pimpinan"), postAdditionalAssignment);
router.patch("/pimpinan/tambahan/:id", authorizeRoles("pimpinan"), patchAdditionalAssignment);
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
router.post("/kegiatan/:id/submit", authorizeRoles("pegawai"), submitMyKegiatanApproval);
router.get("/kegiatan/pending", authorizeRoles("pimpinan"), getPendingApprovalKegiatan);
router.patch("/kegiatan/:id/approve", authorizeRoles("pimpinan"), patchApproveKegiatan);
router.get("/approval-skp/pegawai", authorizeRoles("pimpinan"), getApprovalRealisasiEmployees);
router.get("/approval-skp/pegawai/:pegawaiId/realisasi", authorizeRoles("pimpinan"), getApprovalRealisasiByEmployee);
router.patch("/approval-skp/realisasi/approve", authorizeRoles("pimpinan"), patchApproveRealisasi);
router.get("/tambahan/saya", authorizeRoles("pegawai"), getMyAdditionalAssignments);
router.get("/tambahan", authorizeRoles("admin"), getAdditionalAssignments);
router.get("/tambahan/:id", authorizeRoles("admin"), getAdditionalAssignment);
router.post("/tambahan", authorizeRoles("admin"), postAdditionalAssignment);
router.patch("/tambahan/:id", authorizeRoles("admin"), patchAdditionalAssignment);

export default router;
