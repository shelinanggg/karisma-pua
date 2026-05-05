import express from "express";
import {
  getPeriodeSkpList,
  patchPeriodeSkp,
  postPeriodeSkp,
  removePeriodeSkp,
} from "../controllers/periodeSkp.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getPeriodeSkpList);
router.post("/", authenticate, postPeriodeSkp);
router.patch("/:id", authenticate, patchPeriodeSkp);
router.delete("/:id", authenticate, removePeriodeSkp);

export default router;
