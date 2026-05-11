import crypto from "crypto";
import path from "path";
import { createDocumentMetadata, softDeleteDocumentMetadata } from "../repositories/dokumen.repository.js";
import { storage } from "./storage.service.js";

const extensionByMimeType = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const allowedMimeTypes = new Set(Object.keys(extensionByMimeType));

const sanitizeFilename = (filename) =>
  String(filename ?? "dokumen")
    .replace(/[\\/]/g, "-")
    .replace(/[^\w\s().-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180) || "dokumen";

const buildStorageKey = ({ kategori, originalFilename, mimeType }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = path.extname(originalFilename).toLowerCase();
  const safeExt = ext && ext.length <= 10 ? ext : extensionByMimeType[mimeType] ?? ".bin";

  return `${kategori}/${year}/${month}/${crypto.randomUUID()}${safeExt}`;
};

export const saveUploadedDocument = async ({ file, kategori, uploadedBy }, queryable) => {
  if (!file) return null;

  if (!allowedMimeTypes.has(file.mimetype)) {
    const err = new Error("Format dokumen tidak didukung.");
    err.statusCode = 400;
    throw err;
  }

  const originalFilename = sanitizeFilename(file.originalname);
  const storageKey = buildStorageKey({ kategori, originalFilename, mimeType: file.mimetype });
  const checksumSha256 = crypto.createHash("sha256").update(file.buffer).digest("hex");

  await storage.saveBuffer(storageKey, file.buffer);

  try {
    return await createDocumentMetadata(
      {
        storageKey,
        originalFilename,
        mimeType: file.mimetype,
        fileSize: file.size,
        checksumSha256,
        kategori,
        uploadedBy,
      },
      queryable,
    );
  } catch (err) {
    await storage.delete(storageKey);
    throw err;
  }
};

export const deleteStoredDocument = async (document, queryable) => {
  if (!document) return;
  await softDeleteDocumentMetadata(document.id_dokumen, queryable);
  await storage.delete(document.storage_key);
};
