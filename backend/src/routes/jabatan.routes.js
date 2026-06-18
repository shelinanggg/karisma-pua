import express from "express";
import {
  getJabatanList,
  patchJabatan,
  postJabatan,
} from "../controllers/jabatan.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/", getJabatanList);
router.post("/", postJabatan);
router.patch("/:id", patchJabatan);

export default router;
