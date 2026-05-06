import express from "express";
import {
  getPegawaiList,
  getPegawaiReferences,
  patchPegawai,
  postPegawai,
  removePegawai,
} from "../controllers/pegawai.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getPegawaiList);
router.get("/references", authenticate, getPegawaiReferences);
router.post("/", authenticate, postPegawai);
router.patch("/:id", authenticate, patchPegawai);
router.delete("/:id", authenticate, removePegawai);

export default router;
