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
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/pegawai", authenticate, getPenugasanEmployees);
router.post("/butir", authenticate, postButirAssignment);
router.get("/butir/pegawai/:pegawaiId", authenticate, getButirAssignmentsByEmployee);
router.patch("/butir/:id", authenticate, patchButirAssignment);
router.delete("/butir/:id", authenticate, removeButirAssignment);
router.get("/tambahan", authenticate, getAdditionalAssignments);
router.get("/tambahan/:id", authenticate, getAdditionalAssignment);
router.post("/tambahan", authenticate, postAdditionalAssignment);
router.patch("/tambahan/:id", authenticate, patchAdditionalAssignment);

export default router;
