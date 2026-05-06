import {
  createAdditionalAssignment,
  createButirAssignment,
  deleteButirAssignment,
  findAdditionalAssignmentById,
  findAdditionalAssignments,
  findAssignableEmployees,
  findButirAssignmentsByEmployee,
  updateAdditionalAssignment,
  updateButirAssignment,
} from "../repositories/penugasan.repository.js";

const nullableText = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const requiredInteger = (value) => {
  const text = nullableText(value);
  if (!text) return null;

  const parsed = Number(text);
  return Number.isInteger(parsed) ? parsed : NaN;
};

const uniqueIntegerList = (value) => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => requiredInteger(item))
        .filter((item) => Number.isInteger(item)),
    ),
  );
};

export const getPenugasanEmployees = async (req, res) => {
  try {
    const idPeriodeSkp = requiredInteger(req.query.idPeriodeSkp);

    if (Number.isNaN(idPeriodeSkp)) {
      return res.status(400).json({ message: "Periode SKP tidak valid." });
    }

    const data = await findAssignableEmployees({ idPeriodeSkp });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data pegawai untuk penugasan." });
  }
};

export const postButirAssignment = async (req, res) => {
  try {
    const payload = {
      idPengguna: requiredInteger(req.body.idPengguna),
      idButirKegiatan: requiredInteger(req.body.idButirKegiatan),
      idPeriodeSkp: requiredInteger(req.body.idPeriodeSkp),
      uraian: nullableText(req.body.uraian),
      deskripsi: nullableText(req.body.deskripsi),
      targetKetercapaian: nullableText(req.body.targetKetercapaian),
    };

    if (!payload.idPengguna) {
      return res.status(400).json({ message: "Pegawai wajib dipilih." });
    }

    if (!payload.idButirKegiatan) {
      return res.status(400).json({ message: "Butir kegiatan wajib dipilih." });
    }

    if (!payload.idPeriodeSkp) {
      return res.status(400).json({ message: "Periode SKP wajib dipilih." });
    }

    if ([payload.idPengguna, payload.idButirKegiatan, payload.idPeriodeSkp].some(Number.isNaN)) {
      return res.status(400).json({ message: "Data penugasan butir tidak valid." });
    }

    const data = await createButirAssignment(payload);
    res.status(201).json({ message: "Penugasan butir berhasil disimpan.", data });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "Pegawai, butir kegiatan, atau periode SKP tidak valid." });
    }

    res.status(500).json({ message: "Gagal menyimpan penugasan butir." });
  }
};

export const getButirAssignmentsByEmployee = async (req, res) => {
  try {
    const idPengguna = requiredInteger(req.params.pegawaiId);

    if (!idPengguna || Number.isNaN(idPengguna)) {
      return res.status(400).json({ message: "ID pegawai tidak valid." });
    }

    const data = await findButirAssignmentsByEmployee(idPengguna);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data penugasan butir." });
  }
};

export const patchButirAssignment = async (req, res) => {
  try {
    const id = requiredInteger(req.params.id);
    const uraian = nullableText(req.body.uraian);
    const deskripsi = nullableText(req.body.deskripsi);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID penugasan butir tidak valid." });
    }

    const data = await updateButirAssignment({ id, uraian, deskripsi });

    if (!data) {
      return res.status(404).json({ message: "Penugasan butir tidak ditemukan." });
    }

    res.status(200).json({ message: "Penugasan butir berhasil diperbarui.", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui penugasan butir." });
  }
};

export const removeButirAssignment = async (req, res) => {
  try {
    const id = requiredInteger(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID penugasan butir tidak valid." });
    }

    const deleted = await deleteButirAssignment(id);

    if (!deleted) {
      return res.status(404).json({ message: "Penugasan butir tidak ditemukan." });
    }

    res.status(200).json({ message: "Penugasan butir berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus penugasan butir." });
  }
};

export const getAdditionalAssignments = async (_req, res) => {
  try {
    const data = await findAdditionalAssignments();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data penugasan tambahan." });
  }
};

export const getAdditionalAssignment = async (req, res) => {
  try {
    const id = requiredInteger(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID penugasan tambahan tidak valid." });
    }

    const data = await findAdditionalAssignmentById(id);
    if (!data) {
      return res.status(404).json({ message: "Penugasan tambahan tidak ditemukan." });
    }

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil detail penugasan tambahan." });
  }
};

export const postAdditionalAssignment = async (req, res) => {
  try {
    const assignedEmployeeIds = uniqueIntegerList(req.body.assignedEmployeeIds);
    const namaKegiatan = nullableText(req.body.namaKegiatan);
    const deskripsi = nullableText(req.body.deskripsiKegiatan);
    const tanggalMulai = nullableText(req.body.tanggalMulai);
    const tanggalSelesai = nullableText(req.body.tanggalSelesai);

    if (assignedEmployeeIds.length === 0) {
      return res.status(400).json({ message: "Minimal satu pegawai wajib dipilih." });
    }

    if (!namaKegiatan) {
      return res.status(400).json({ message: "Nama kegiatan wajib diisi." });
    }

    if (!tanggalMulai || !tanggalSelesai) {
      return res.status(400).json({ message: "Tanggal penugasan wajib diisi." });
    }

    const data = await createAdditionalAssignment({
      assignedEmployeeIds,
      namaKegiatan,
      deskripsi,
      tanggalMulai,
      tanggalSelesai,
    });

    res.status(201).json({ message: "Penugasan tambahan berhasil disimpan.", data });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "Pegawai penugasan tambahan tidak valid." });
    }

    res.status(500).json({ message: "Gagal menyimpan penugasan tambahan." });
  }
};

export const patchAdditionalAssignment = async (req, res) => {
  try {
    const id = requiredInteger(req.params.id);
    const assignedEmployeeIds = uniqueIntegerList(req.body.assignedEmployeeIds);
    const namaKegiatan = nullableText(req.body.namaKegiatan);
    const deskripsi = nullableText(req.body.deskripsiKegiatan);
    const tanggalMulai = nullableText(req.body.tanggalMulai);
    const tanggalSelesai = nullableText(req.body.tanggalSelesai);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID penugasan tambahan tidak valid." });
    }

    if (assignedEmployeeIds.length === 0) {
      return res.status(400).json({ message: "Minimal satu pegawai wajib dipilih." });
    }

    if (!namaKegiatan) {
      return res.status(400).json({ message: "Nama kegiatan wajib diisi." });
    }

    if (!tanggalMulai || !tanggalSelesai) {
      return res.status(400).json({ message: "Tanggal penugasan wajib diisi." });
    }

    const data = await updateAdditionalAssignment({
      id,
      assignedEmployeeIds,
      namaKegiatan,
      deskripsi,
      tanggalMulai,
      tanggalSelesai,
    });

    if (!data) {
      return res.status(404).json({ message: "Penugasan tambahan tidak ditemukan." });
    }

    res.status(200).json({ message: "Penugasan tambahan berhasil diperbarui.", data });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "Pegawai penugasan tambahan tidak valid." });
    }

    res.status(500).json({ message: "Gagal memperbarui penugasan tambahan." });
  }
};
