import express from "express";
import {
  getPeriodeSkpList,
  patchPeriodeSkp,
  postPeriodeSkp,
  removePeriodeSkp,
} from "../controllers/periodeSkp.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getPeriodeSkpList);
router.post("/", authorizeRoles("admin"), postPeriodeSkp);
router.patch("/:id", authorizeRoles("admin"), patchPeriodeSkp);
router.delete("/:id", authorizeRoles("admin"), removePeriodeSkp);

export default router;
