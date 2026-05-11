import multer from "multer";
import { env } from "../config/env.js";

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.STORAGE_MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});
