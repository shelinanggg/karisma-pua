import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { env } from "../config/env.js";

const workspaceRoot = process.cwd();
const localRoot = path.resolve(workspaceRoot, env.STORAGE_LOCAL_ROOT);

const assertRelativeStorageKey = (storageKey) => {
  const normalized = String(storageKey ?? "").replaceAll("\\", "/");

  if (!normalized || path.isAbsolute(normalized) || /^[A-Za-z]:[\\/]/.test(normalized) || normalized.split("/").includes("..")) {
    throw new Error("Storage key tidak valid.");
  }

  return normalized;
};

const resolveLocalPath = (storageKey) => {
  const normalized = assertRelativeStorageKey(storageKey);
  const targetPath = path.resolve(localRoot, normalized);

  if (!targetPath.startsWith(`${localRoot}${path.sep}`) && targetPath !== localRoot) {
    throw new Error("Storage key keluar dari root storage.");
  }

  return targetPath;
};

export const storage = {
  driver: env.STORAGE_DRIVER,

  async saveBuffer(storageKey, buffer) {
    if (env.STORAGE_DRIVER !== "local") {
      throw new Error("Storage driver belum didukung.");
    }

    const targetPath = resolveLocalPath(storageKey);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, buffer);
  },

  createReadStream(storageKey) {
    if (env.STORAGE_DRIVER !== "local") {
      throw new Error("Storage driver belum didukung.");
    }

    return createReadStream(resolveLocalPath(storageKey));
  },

  async delete(storageKey) {
    if (env.STORAGE_DRIVER !== "local") {
      throw new Error("Storage driver belum didukung.");
    }

    try {
      await fs.unlink(resolveLocalPath(storageKey));
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
  },
};
