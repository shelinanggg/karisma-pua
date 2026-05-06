import express from "express";
import {
  getPeriodeSkpList,
  patchPeriodeSkp,
  postPeriodeSkp,
  removePeriodeSkp,
} from "../controllers/periodeSkp.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/", getPeriodeSkpList);
router.post("/", postPeriodeSkp);
router.patch("/:id", patchPeriodeSkp);
router.delete("/:id", removePeriodeSkp);

export default router;
