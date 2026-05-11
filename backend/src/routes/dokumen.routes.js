import express from "express";
import { downloadDocument, viewDocument } from "../controllers/dokumen.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/:id/lihat", viewDocument);
router.get("/:id/download", downloadDocument);

export default router;
