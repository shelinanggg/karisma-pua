import express from "express";
import {
  getButirKegiatanList,
  patchButirKegiatan,
  postButirKegiatan,
  removeButirKegiatan,
} from "../controllers/butirKegiatan.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getButirKegiatanList);
router.post("/", authenticate, postButirKegiatan);
router.patch("/:id", authenticate, patchButirKegiatan);
router.delete("/:id", authenticate, removeButirKegiatan);

export default router;
