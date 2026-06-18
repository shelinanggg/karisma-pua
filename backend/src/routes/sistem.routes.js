import express from "express";
import { createBackup, getAuditLogs, getBackupLogs, restoreBackup } from "../controllers/sistem.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/audit-logs", getAuditLogs);
router.get("/backups", getBackupLogs);
router.post("/backups", createBackup);
router.post(
  "/restore",
  express.raw({ type: ["application/sql", "text/plain"], limit: "100mb" }),
  restoreBackup,
);

export default router;
