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
    const child = spawn(command, args, {
      env: { ...process.env, PGPASSWORD: env.DB_PASSWORD || "" },
      windowsHide: true,
    });

    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const stdoutBuffer = Buffer.concat(stdout);
      const stderrText = Buffer.concat(stderr).toString("utf8").trim();

      if (code !== 0) {
        const error = new Error(stderrText || `Command exited with code ${code}`);
        error.code = code;
        reject(error);
        return;
      }

      resolve({ stdout: stdoutBuffer, stderr: stderrText });
    });

    if (input !== null) {
      child.stdin.write(input);
      child.stdin.end();
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

    await createBackupLog({
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
    await createBackupLog({
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
  const fileName = nullableText(req.body.fileName) || "restore.sql";
  const sqlContent = String(req.body.sqlContent ?? "");
  const trimmedSql = sqlContent.trim();

  if (!trimmedSql || !/\b(CREATE|INSERT|ALTER|DROP|COPY|SELECT|SET)\b/i.test(trimmedSql)) {
    await createBackupLog({
      ...actor,
      action: "restore",
      fileName,
      fileSize: Buffer.byteLength(sqlContent, "utf8"),
      status: "Gagal",
      errorMessage: "File SQL kosong atau tidak valid.",
    });
    return res.status(400).json({ message: "File SQL kosong atau tidak valid." });
  }

  try {
    await runCommand(env.PSQL_PATH, [...getPgArgs(), "--set", "ON_ERROR_STOP=on"], { input: sqlContent });

    const data = await createBackupLog({
      ...actor,
      action: "restore",
      fileName,
      fileSize: Buffer.byteLength(sqlContent, "utf8"),
      status: "Berhasil",
    });

    res.status(200).json({ message: "Restore database berhasil.", data });
  } catch (error) {
    await createBackupLog({
      ...actor,
      action: "restore",
      fileName,
      fileSize: Buffer.byteLength(sqlContent, "utf8"),
      status: "Gagal",
      errorMessage: formatErrorMessage(error),
    });
    res.status(500).json({ message: "Gagal restore database.", detail: formatErrorMessage(error) });
  }
};
