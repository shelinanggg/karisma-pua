import {
  createPeriodeSkp,
  deletePeriodeSkp,
  findAllPeriodeSkp,
  updatePeriodeSkp,
} from "../repositories/periodeSkp.repository.js";

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const validatePayload = (payload) => {
  const tahun = Number(payload.tahun);
  const { tanggalMulai, tanggalSelesai } = payload;

  if (!Number.isInteger(tahun) || String(tahun).length !== 4) {
    return "Tahun harus berisi 4 digit.";
  }

  if (!isValidDate(tanggalMulai) || !isValidDate(tanggalSelesai)) {
    return "Tanggal mulai dan tanggal selesai wajib diisi.";
  }

  if (tanggalMulai > tanggalSelesai) {
    return "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
  }

  return null;
};

export const getPeriodeSkpList = async (_req, res) => {
  try {
    const data = await findAllPeriodeSkp();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data periode SKP." });
  }
};

export const postPeriodeSkp = async (req, res) => {
  try {
    const validationError = validatePayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const data = await createPeriodeSkp({
      tahun: Number(req.body.tahun),
      tanggalMulai: req.body.tanggalMulai,
      tanggalSelesai: req.body.tanggalSelesai,
    });

    res.status(201).json({ message: "Periode SKP berhasil ditambahkan.", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan periode SKP." });
  }
};

export const patchPeriodeSkp = async (req, res) => {
  try {
    const validationError = validatePayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const data = await updatePeriodeSkp(req.params.id, {
      tahun: Number(req.body.tahun),
      tanggalMulai: req.body.tanggalMulai,
      tanggalSelesai: req.body.tanggalSelesai,
    });

    if (!data) {
      return res.status(404).json({ message: "Periode SKP tidak ditemukan." });
    }

    res.status(200).json({ message: "Periode SKP berhasil diperbarui.", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui periode SKP." });
  }
};

export const removePeriodeSkp = async (req, res) => {
  try {
    const deleted = await deletePeriodeSkp(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Periode SKP tidak ditemukan." });
    }

    res.status(200).json({ message: "Periode SKP berhasil dihapus." });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ message: "Periode SKP masih dipakai dan tidak dapat dihapus." });
    }

    res.status(500).json({ message: "Gagal menghapus periode SKP." });
  }
};
