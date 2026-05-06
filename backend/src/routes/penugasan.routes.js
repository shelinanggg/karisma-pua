import express from "express";
import {
  getAdditionalAssignment,
  getAdditionalAssignments,
  getButirAssignmentsByEmployee,
  getPenugasanEmployees,
  patchAdditionalAssignment,
  patchButirAssignment,
  postAdditionalAssignment,
  postButirAssignment,
  removeButirAssignment,
} from "../controllers/penugasan.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/pegawai", getPenugasanEmployees);
router.post("/butir", postButirAssignment);
router.get("/butir/pegawai/:pegawaiId", getButirAssignmentsByEmployee);
router.patch("/butir/:id", patchButirAssignment);
router.delete("/butir/:id", removeButirAssignment);
router.get("/tambahan", getAdditionalAssignments);
router.get("/tambahan/:id", getAdditionalAssignment);
router.post("/tambahan", postAdditionalAssignment);
router.patch("/tambahan/:id", patchAdditionalAssignment);

export default router;
