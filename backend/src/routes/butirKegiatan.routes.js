import express from "express";
import {
  getButirKegiatanList,
  patchButirKegiatan,
  postButirKegiatan,
  removeButirKegiatan,
} from "../controllers/butirKegiatan.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/", getButirKegiatanList);
router.post("/", postButirKegiatan);
router.patch("/:id", patchButirKegiatan);
router.delete("/:id", removeButirKegiatan);

export default router;
