import express from "express";
import {
  getAdditionalAssignment,
  getAdditionalAssignments,
  getButirAssignmentsByEmployee,
  getMyAdditionalAssignments,
  getPenugasanEmployees,
  patchAdditionalAssignment,
  patchButirAssignment,
  postAdditionalAssignment,
  postButirAssignment,
  removeButirAssignment,
} from "../controllers/penugasan.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/pegawai", authorizeRoles("admin"), getPenugasanEmployees);
router.post("/butir", authorizeRoles("admin"), postButirAssignment);
router.get("/butir/pegawai/:pegawaiId", authorizeRoles("admin"), getButirAssignmentsByEmployee);
router.patch("/butir/:id", authorizeRoles("admin"), patchButirAssignment);
router.delete("/butir/:id", authorizeRoles("admin"), removeButirAssignment);
router.get("/tambahan/saya", authorizeRoles("pegawai"), getMyAdditionalAssignments);
router.get("/tambahan", authorizeRoles("admin"), getAdditionalAssignments);
router.get("/tambahan/:id", authorizeRoles("admin"), getAdditionalAssignment);
router.post("/tambahan", authorizeRoles("admin"), postAdditionalAssignment);
router.patch("/tambahan/:id", authorizeRoles("admin"), patchAdditionalAssignment);

export default router;
