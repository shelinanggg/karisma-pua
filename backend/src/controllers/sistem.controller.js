import { spawn } from "child_process";
import { env } from "../config/env.js";
import { findUserProfileById } from "../repositories/user.repository.js";
import { createBackupLog, findAuditLogs, findBackupLogs } from "../repositories/sistem.repository.js";

const requiredInteger = (value, fallback) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const nullableText = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const getActor = async (req) => {
  const idPengguna = req.user?.id_pengguna ?? null;
  if (!idPengguna) return { idPengguna: null, userName: null };

  try {
    const profile = await findUserProfileById(idPengguna);
    return { idPengguna, userName: profile?.nama ?? null };
  } catch {
    return { idPengguna, userName: null };
  }
};

const runCommand = (command, args, { input = null } = {}) =>
  new Promise((resolve, reject) => {
    let settled = false;
    let stdinError = null;
    const child = spawn(command, args, {
      env: { ...process.env, PGPASSWORD: env.DB_PASSWORD || "" },
      windowsHide: true,
    });

    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      const stdoutBuffer = Buffer.concat(stdout);
      const stderrText = Buffer.concat(stderr).toString("utf8").trim();

      if (code !== 0) {
        const error = new Error(
          stderrText || stdinError?.message || `Command exited with code ${code}`,
        );
        error.code = code;
        reject(error);
        return;
      }

      resolve({ stdout: stdoutBuffer, stderr: stderrText });
    });

    if (input !== null) {
      child.stdin.on("error", (error) => {
        stdinError = error;
      });
      child.stdin.end(input);
    }
  });

const getPgArgs = () => [
  "--host",
  env.DB_HOST,
  "--port",
  String(env.DB_PORT),
  "--username",
  env.DB_USER,
  "--dbname",
  env.DB_NAME,
];

const createSqlFileName = () => {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
  return `karisma-pua-backup-${stamp}.sql`;
};

const formatErrorMessage = (error) => String(error?.message || "Terjadi kesalahan.").slice(0, 500);

const formatRestoreError = (error) => {
  const detail = formatErrorMessage(error);

  if (/must be owner of (table|sequence|view|materialized view)/i.test(detail)) {
    return {
      status: 409,
      message: "Restore ditolak karena ownership database tidak konsisten.",
      detail: `${detail} Jalankan scripts/fix-database-ownership.sql satu kali menggunakan user postgres, lalu ulangi restore.`,
    };
  }

  return {
    status: 500,
    message: "Gagal restore database.",
    detail,
  };
};

const writeBackupLogSafely = async (payload) => {
  try {
    return await createBackupLog(payload);
  } catch (error) {
    console.error("Gagal menulis backup log:", formatErrorMessage(error));
    return null;
  }
};

const decodeFileNameHeader = (value) => {
  const encoded = nullableText(value);
  if (!encoded) return "";

  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
};

const getRestorePayload = (req) => {
  if (Buffer.isBuffer(req.body)) {
    return {
      fileName: decodeFileNameHeader(req.headers["x-backup-filename"]) || "restore.sql",
      sqlBuffer: req.body,
    };
  }

  const sqlContent = String(req.body?.sqlContent ?? "");
  return {
    fileName: nullableText(req.body?.fileName) || "restore.sql",
    sqlBuffer: Buffer.from(sqlContent, "utf8"),
  };
};

export const getAuditLogs = async (req, res) => {
  try {
    const page = requiredInteger(req.query.page, 1);
    const pageSize = Math.min(requiredInteger(req.query.pageSize, 10), 100);
    const data = await findAuditLogs({
      search: nullableText(req.query.search),
      type: nullableText(req.query.type),
      status: nullableText(req.query.status),
      dateFrom: nullableText(req.query.dateFrom),
      dateTo: nullableText(req.query.dateTo),
      page,
      pageSize,
    });

    res.status(200).json({ data });
  } catch {
    res.status(500).json({ message: "Gagal mengambil audit log." });
  }
};

export const getBackupLogs = async (req, res) => {
  try {
    const page = requiredInteger(req.query.page, 1);
    const pageSize = Math.min(requiredInteger(req.query.pageSize, 10), 100);
    const data = await findBackupLogs({ page, pageSize });
    res.status(200).json({ data });
  } catch {
    res.status(500).json({ message: "Gagal mengambil riwayat backup." });
  }
};

export const createBackup = async (req, res) => {
  const actor = await getActor(req);
  const fileName = createSqlFileName();

  try {
    const { stdout } = await runCommand(env.PG_DUMP_PATH, [
      ...getPgArgs(),
      "--format",
      "p",
      "--clean",
      "--if-exists",
      "--no-owner",
      "--no-privileges",
    ]);

    await writeBackupLogSafely({
      ...actor,
      action: "backup",
      fileName,
      fileSize: stdout.length,
      status: "Berhasil",
    });

    res.setHeader("Content-Type", "application/sql; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(stdout);
  } catch (error) {
    await writeBackupLogSafely({
      ...actor,
      action: "backup",
      fileName,
      fileSize: 0,
      status: "Gagal",
      errorMessage: formatErrorMessage(error),
    });
    res.status(500).json({ message: "Gagal membuat backup database.", detail: formatErrorMessage(error) });
  }
};

export const restoreBackup = async (req, res) => {
  const actor = await getActor(req);
  const { fileName, sqlBuffer } = getRestorePayload(req);
  const sqlPreview = sqlBuffer.subarray(0, Math.min(sqlBuffer.length, 1024 * 1024)).toString("utf8");
  const trimmedSql = sqlPreview.trim();
  const fileSize = sqlBuffer.length;

  if (!trimmedSql || !/\b(CREATE|INSERT|ALTER|DROP|COPY|SELECT|SET)\b/i.test(trimmedSql)) {
    await writeBackupLogSafely({
      ...actor,
      action: "restore",
      fileName,
      fileSize,
      status: "Gagal",
      errorMessage: "File SQL kosong atau tidak valid.",
    });
    return res.status(400).json({ message: "File SQL kosong atau tidak valid." });
  }

  try {
    await runCommand(
      env.PSQL_PATH,
      [
        ...getPgArgs(),
        "--no-psqlrc",
        "--single-transaction",
        "--set",
        "ON_ERROR_STOP=on",
      ],
      { input: sqlBuffer },
    );

    const data = await writeBackupLogSafely({
      ...actor,
      action: "restore",
      fileName,
      fileSize,
      status: "Berhasil",
    });

    res.status(200).json({ message: "Restore database berhasil.", data });
  } catch (error) {
    const restoreError = formatRestoreError(error);

    await writeBackupLogSafely({
      ...actor,
      action: "restore",
      fileName,
      fileSize,
      status: "Gagal",
      errorMessage: restoreError.detail,
    });
    res.status(restoreError.status).json({
      message: restoreError.message,
      detail: restoreError.detail,
    });
  }
};
