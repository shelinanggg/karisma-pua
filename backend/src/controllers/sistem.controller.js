import { spawn } from "child_process";
import { existsSync, readdirSync } from "fs";
import path from "path";
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

const findWindowsPgTool = (toolName) => {
  const roots = [process.env.ProgramFiles, process.env["ProgramFiles(x86)"]]
    .filter(Boolean)
    .map((root) => path.join(root, "PostgreSQL"));

  for (const root of roots) {
    if (!existsSync(root)) continue;

    const versions = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => Number(b) - Number(a));

    for (const version of versions) {
      const candidates = [
        path.join(root, version, "bin", `${toolName}.exe`),
        path.join(root, version, "pgAdmin 4", "runtime", `${toolName}.exe`),
      ];

      const found = candidates.find((candidate) => existsSync(candidate));
      if (found) return found;
    }
  }

  return "";
};

const resolvePgTool = (configuredPath, defaultCommand) => {
  if (configuredPath && configuredPath !== defaultCommand) return configuredPath;
  if (process.platform === "win32") return findWindowsPgTool(defaultCommand) || defaultCommand;
  return configuredPath || defaultCommand;
};

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
    const { stdout } = await runCommand(resolvePgTool(env.PG_DUMP_PATH, "pg_dump"), [
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
    await runCommand(resolvePgTool(env.PSQL_PATH, "psql"), [...getPgArgs(), "--set", "ON_ERROR_STOP=on"], { input: sqlContent });

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
