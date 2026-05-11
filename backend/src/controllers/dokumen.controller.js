import { findDocumentMetadataById, userCanAccessDocument } from "../repositories/dokumen.repository.js";
import { storage } from "../services/storage.service.js";

const contentDisposition = ({ filename, download }) => {
  const fallback = String(filename ?? "dokumen").replace(/["\\]/g, "");
  const disposition = download ? "attachment" : "inline";
  return `${disposition}; filename="${fallback}"`;
};

const streamDocument = async (req, res, { download = false } = {}) => {
  const idDokumen = Number(req.params.id);

  if (!Number.isInteger(idDokumen)) {
    return res.status(400).json({ message: "ID dokumen tidak valid." });
  }

  const canAccess = await userCanAccessDocument({
    idDokumen,
    idPengguna: req.user?.id_pengguna,
    role: req.user?.role,
  });

  if (!canAccess) {
    return res.status(403).json({ message: "Anda tidak memiliki akses ke dokumen ini." });
  }

  const document = await findDocumentMetadataById(idDokumen);

  if (!document) {
    return res.status(404).json({ message: "Dokumen tidak ditemukan." });
  }

  res.setHeader("Content-Type", document.mime_type);
  res.setHeader("Content-Length", String(document.file_size));
  res.setHeader(
    "Content-Disposition",
    contentDisposition({ filename: document.original_filename, download }),
  );

  const stream = storage.createReadStream(document.storage_key);
  stream.on("error", () => {
    if (!res.headersSent) {
      res.status(404).json({ message: "File dokumen tidak ditemukan di storage." });
    } else {
      res.destroy();
    }
  });
  stream.pipe(res);
};

export const viewDocument = async (req, res) => {
  try {
    await streamDocument(req, res);
  } catch {
    res.status(500).json({ message: "Gagal membuka dokumen." });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    await streamDocument(req, res, { download: true });
  } catch {
    res.status(500).json({ message: "Gagal mengunduh dokumen." });
  }
};
