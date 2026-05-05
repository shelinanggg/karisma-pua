import {
  createButirKegiatan,
  deleteButirKegiatan,
  findAllButirKegiatan,
  findButirKegiatanByNormalizedName,
  updateButirKegiatan,
} from "../repositories/butirKegiatan.repository.js";

const validateName = (name) => {
  if (!name || !name.trim()) {
    return "Nama butir kegiatan wajib diisi.";
  }

  return null;
};

export const getButirKegiatanList = async (_req, res) => {
  try {
    const data = await findAllButirKegiatan();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data butir kegiatan." });
  }
};

export const postButirKegiatan = async (req, res) => {
  try {
    const validationError = validateName(req.body.name);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const name = req.body.name.trim();
    const existing = await findButirKegiatanByNormalizedName(name);
    if (existing) {
      return res.status(409).json({ message: "Nama butir kegiatan sudah ada." });
    }

    const data = await createButirKegiatan({ name });
    res.status(201).json({ message: "Butir kegiatan berhasil ditambahkan.", data });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Nama butir kegiatan sudah ada." });
    }

    res.status(500).json({ message: "Gagal menambahkan butir kegiatan." });
  }
};

export const patchButirKegiatan = async (req, res) => {
  try {
    const validationError = validateName(req.body.name);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const name = req.body.name.trim();
    const existing = await findButirKegiatanByNormalizedName(name, req.params.id);
    if (existing) {
      return res.status(409).json({ message: "Nama butir kegiatan sudah ada." });
    }

    const data = await updateButirKegiatan(req.params.id, { name });
    if (!data) {
      return res.status(404).json({ message: "Butir kegiatan tidak ditemukan." });
    }

    res.status(200).json({ message: "Butir kegiatan berhasil diperbarui.", data });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Nama butir kegiatan sudah ada." });
    }

    res.status(500).json({ message: "Gagal memperbarui butir kegiatan." });
  }
};

export const removeButirKegiatan = async (req, res) => {
  try {
    const deleted = await deleteButirKegiatan(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Butir kegiatan tidak ditemukan." });
    }

    res.status(200).json({ message: "Butir kegiatan berhasil dihapus." });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ message: "Butir kegiatan masih dipakai dan tidak dapat dihapus." });
    }

    res.status(500).json({ message: "Gagal menghapus butir kegiatan." });
  }
};
