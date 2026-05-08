import {
  createAdditionalAssignment,
  createButirAssignment,
  createMyRealisasiKegiatan,
  deleteButirAssignment,
  findAdditionalAssignmentById,
  findAdditionalAssignmentsByEmployee,
  findAdditionalAssignments,
  findAssignableEmployees,
  findButirAssignmentsByEmployee,
  findCurrentYearButirAssignmentsByEmployee,
  findMyRealisasiKegiatan,
  updateAdditionalAssignment,
  updateButirAssignment,
  updateOwnButirTarget,
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

const positiveNumberText = (value) => {
  const text = nullableText(value);
  if (!text) return null;

  const normalized = text.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : NaN;
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

export const getMyButirAssignments = async (req, res) => {
  try {
    const idPengguna = requiredInteger(req.user?.id_pengguna);

    if (!idPengguna || Number.isNaN(idPengguna)) {
      return res.status(400).json({ message: "ID pegawai tidak valid." });
    }

    const data = await findCurrentYearButirAssignmentsByEmployee(idPengguna);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data kinerja pegawai." });
  }
};

export const patchButirAssignment = async (req, res) => {
  try {
    const id = requiredInteger(req.params.id);
    const uraian = nullableText(req.body.uraian);
    const deskripsi = nullableText(req.body.deskripsi);
    const targetKetercapaian = nullableText(req.body.targetKetercapaian);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "ID penugasan butir tidak valid." });
    }

    const data = await updateButirAssignment({ id, uraian, deskripsi, targetKetercapaian });

    if (!data) {
      return res.status(404).json({ message: "Penugasan butir tidak ditemukan." });
    }

    res.status(200).json({ message: "Penugasan butir berhasil diperbarui.", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui penugasan butir." });
  }
};

export const patchMyButirTarget = async (req, res) => {
  try {
    const id = requiredInteger(req.params.id);
    const idPengguna = requiredInteger(req.user?.id_pengguna);
    const targetKetercapaian = positiveNumberText(req.body.targetKetercapaian);
    const uraian = nullableText(req.body.uraian);
    const deskripsi = nullableText(req.body.deskripsi);

    if (!id || Number.isNaN(id) || !idPengguna || Number.isNaN(idPengguna)) {
      return res.status(400).json({ message: "ID penugasan butir tidak valid." });
    }

    if (!targetKetercapaian || Number.isNaN(targetKetercapaian)) {
      return res.status(400).json({ message: "Target kinerja wajib berupa angka lebih dari 0." });
    }

    const data = await updateOwnButirTarget({
      id,
      idPengguna,
      targetKetercapaian,
      uraian,
      deskripsi,
    });

    if (!data) {
      return res.status(404).json({ message: "Penugasan butir tidak ditemukan untuk akun ini." });
    }

    res.status(200).json({ message: "Target kinerja berhasil disimpan.", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal menyimpan target kinerja." });
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

export const getMyRealisasi = async (req, res) => {
  try {
    const idPengguna = requiredInteger(req.user?.id_pengguna);

    if (!idPengguna || Number.isNaN(idPengguna)) {
      return res.status(400).json({ message: "ID pegawai tidak valid." });
    }

    const data = await findMyRealisasiKegiatan(idPengguna);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil riwayat realisasi kegiatan." });
  }
};

export const postMyRealisasi = async (req, res) => {
  try {
    const idPengguna = requiredInteger(req.user?.id_pengguna);
    const idPenggunaKegiatan = requiredInteger(req.body.idPenggunaKegiatan);
    const tanggalRealisasi = nullableText(req.body.tanggalRealisasi);
    const realisasiTarget = positiveNumberText(req.body.realisasiTarget);
    const keterangan = nullableText(req.body.keterangan);

    if (!idPengguna || Number.isNaN(idPengguna) || !idPenggunaKegiatan || Number.isNaN(idPenggunaKegiatan)) {
      return res.status(400).json({ message: "Penugasan kegiatan tidak valid." });
    }

    if (!tanggalRealisasi) {
      return res.status(400).json({ message: "Tanggal realisasi wajib diisi." });
    }

    if (!realisasiTarget || Number.isNaN(realisasiTarget)) {
      return res.status(400).json({ message: "Jumlah realisasi wajib berupa angka lebih dari 0." });
    }

    if (!keterangan) {
      return res.status(400).json({ message: "Keterangan realisasi wajib diisi." });
    }

    const data = await createMyRealisasiKegiatan({
      idPengguna,
      idPenggunaKegiatan,
      tanggalRealisasi,
      realisasiTarget,
      keterangan,
    });

    if (!data) {
      return res.status(404).json({
        message: "Penugasan tidak ditemukan, bukan periode tahun ini, atau target belum ditetapkan.",
      });
    }

    res.status(201).json({ message: "Realisasi kegiatan berhasil disimpan.", data });
  } catch (err) {
    if (err.code === "23502" || err.code === "23503") {
      return res.status(400).json({ message: "Data realisasi kegiatan tidak valid." });
    }

    res.status(500).json({ message: "Gagal menyimpan realisasi kegiatan." });
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

export const getMyAdditionalAssignments = async (req, res) => {
  try {
    const idPengguna = requiredInteger(req.user?.id_pengguna);

    if (!idPengguna || Number.isNaN(idPengguna)) {
      return res.status(400).json({ message: "ID pegawai tidak valid." });
    }

    const data = await findAdditionalAssignmentsByEmployee(idPengguna);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data penugasan tambahan pegawai." });
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
