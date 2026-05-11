import {
  approveRealisasiKegiatan,
  createAdditionalAssignment,
  createButirAssignment,
  createMyRealisasiKegiatan,
  deleteButirAssignment,
  findAdditionalAssignmentById,
  findAdditionalAssignmentsByEmployee,
  findAdditionalAssignments,
  findApprovalRealisasiByEmployee,
  findApprovalRealisasiEmployees,
  findAssignableEmployees,
  findButirAssignmentsByEmployee,
  findCurrentYearButirAssignmentsByEmployee,
  findMainDashboardSummary,
  findMyDashboardSummary,
  findMyRealisasiKegiatan,
  findPimpinanKegiatanDashboard,
  updateAdditionalAssignment,
  updateButirAssignment,
  updateOwnButirTarget,
} from "../repositories/penugasan.repository.js";
import { findDocumentMetadataById } from "../repositories/dokumen.repository.js";
import { deleteStoredDocument, saveUploadedDocument } from "../services/dokumen.service.js";

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
  const values = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];

  return Array.from(
    new Set(
      values
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

export const getPimpinanKegiatanDashboard = async (req, res) => {
  try {
    const tahun = requiredInteger(req.query.tahun);
    const bulan = requiredInteger(req.query.bulan);

    if (Number.isNaN(tahun)) {
      return res.status(400).json({ message: "Tahun kegiatan tidak valid." });
    }

    if (Number.isNaN(bulan) || (bulan !== null && (bulan < 1 || bulan > 12))) {
      return res.status(400).json({ message: "Bulan kegiatan tidak valid." });
    }

    const effectiveTahun = bulan && !tahun ? new Date().getFullYear() : tahun;
    const data = await findPimpinanKegiatanDashboard({ tahun: effectiveTahun, bulan });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data kegiatan pimpinan." });
  }
};

export const getMainDashboard = async (req, res) => {
  try {
    const idPeriodeSkp = requiredInteger(req.query.idPeriodeSkp);

    if (Number.isNaN(idPeriodeSkp)) {
      return res.status(400).json({ message: "Periode SKP tidak valid." });
    }

    const data = await findMainDashboardSummary({ idPeriodeSkp });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data dashboard utama." });
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

const requiredIntegerList = (value) => {
  const values = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];

  return Array.from(
    new Set(
      values
        .map((item) => requiredInteger(item))
        .filter((item) => Number.isInteger(item)),
    ),
  );
};

export const getMyDashboard = async (req, res) => {
  try {
    const idPengguna = requiredInteger(req.user?.id_pengguna);
    const idPeriodeSkp = requiredInteger(req.query.idPeriodeSkp);
    const tahun = requiredInteger(req.query.tahun);

    if (!idPengguna || Number.isNaN(idPengguna)) {
      return res.status(400).json({ message: "ID pegawai tidak valid." });
    }

    if (Number.isNaN(idPeriodeSkp)) {
      return res.status(400).json({ message: "Periode SKP tidak valid." });
    }

    if (Number.isNaN(tahun)) {
      return res.status(400).json({ message: "Tahun dashboard tidak valid." });
    }

    const data = await findMyDashboardSummary(idPengguna, { idPeriodeSkp, tahun });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data dashboard pegawai." });
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

export const getApprovalRealisasiEmployees = async (req, res) => {
  try {
    const idPeriodeSkp = requiredInteger(req.query.idPeriodeSkp);
    const tahun = requiredInteger(req.query.tahun);

    if (Number.isNaN(idPeriodeSkp)) {
      return res.status(400).json({ message: "Periode SKP tidak valid." });
    }

    if (Number.isNaN(tahun)) {
      return res.status(400).json({ message: "Tahun pengajuan tidak valid." });
    }

    const data = await findApprovalRealisasiEmployees({ idPeriodeSkp, tahun });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data pengajuan realisasi SKP." });
  }
};

export const getApprovalRealisasiByEmployee = async (req, res) => {
  try {
    const idPengguna = requiredInteger(req.params.pegawaiId);
    const idPeriodeSkp = requiredInteger(req.query.idPeriodeSkp);
    const tahun = requiredInteger(req.query.tahun);

    if (!idPengguna || Number.isNaN(idPengguna)) {
      return res.status(400).json({ message: "ID pegawai tidak valid." });
    }

    if (Number.isNaN(idPeriodeSkp)) {
      return res.status(400).json({ message: "Periode SKP tidak valid." });
    }

    if (Number.isNaN(tahun)) {
      return res.status(400).json({ message: "Tahun pengajuan tidak valid." });
    }

    const data = await findApprovalRealisasiByEmployee(idPengguna, { idPeriodeSkp, tahun });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil detail pengajuan realisasi SKP." });
  }
};

export const patchApproveRealisasi = async (req, res) => {
  try {
    const ids = requiredIntegerList(req.body.realisasiIds);

    if (ids.length === 0) {
      return res.status(400).json({ message: "Minimal satu realisasi wajib dipilih." });
    }

    const data = await approveRealisasiKegiatan(ids);
    res.status(200).json({ message: "Realisasi kegiatan berhasil disetujui.", data });
  } catch (err) {
    res.status(500).json({ message: "Gagal menyetujui realisasi kegiatan." });
  }
};

export const postMyRealisasi = async (req, res) => {
  let savedDocument = null;

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

    savedDocument = await saveUploadedDocument({
      file: req.file,
      kategori: "realisasi-kinerja",
      uploadedBy: idPengguna,
    });

    const data = await createMyRealisasiKegiatan({
      idPengguna,
      idPenggunaKegiatan,
      tanggalRealisasi,
      realisasiTarget,
      keterangan,
      idDokumen: savedDocument?.id_dokumen ?? null,
    });

    if (!data) {
      await deleteStoredDocument(savedDocument);
      return res.status(404).json({
        message: "Penugasan tidak ditemukan, bukan periode tahun ini, atau target belum ditetapkan.",
      });
    }

    res.status(201).json({ message: "Realisasi kegiatan berhasil disimpan.", data });
  } catch (err) {
    await deleteStoredDocument(savedDocument);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

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
  let savedDocument = null;

  try {
    const uploadedBy = requiredInteger(req.user?.id_pengguna);
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

    savedDocument = await saveUploadedDocument({
      file: req.file,
      kategori: "surat-tugas",
      uploadedBy,
    });

    const data = await createAdditionalAssignment({
      assignedEmployeeIds,
      namaKegiatan,
      deskripsi,
      tanggalMulai,
      tanggalSelesai,
      idSuratTugasDokumen: savedDocument?.id_dokumen ?? null,
    });

    res.status(201).json({ message: "Penugasan tambahan berhasil disimpan.", data });
  } catch (err) {
    await deleteStoredDocument(savedDocument);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err.code === "23503") {
      return res.status(400).json({ message: "Pegawai penugasan tambahan tidak valid." });
    }

    res.status(500).json({ message: "Gagal menyimpan penugasan tambahan." });
  }
};

export const patchAdditionalAssignment = async (req, res) => {
  let savedDocument = null;
  let previousDocument = null;

  try {
    const uploadedBy = requiredInteger(req.user?.id_pengguna);
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

    if (req.file) {
      const currentAssignment = await findAdditionalAssignmentById(id);
      if (!currentAssignment) {
        return res.status(404).json({ message: "Penugasan tambahan tidak ditemukan." });
      }

      const previousDocumentId = currentAssignment.dokumenSuratTugas?.id;
      previousDocument = previousDocumentId ? await findDocumentMetadataById(previousDocumentId) : null;
    }

    savedDocument = await saveUploadedDocument({
      file: req.file,
      kategori: "surat-tugas",
      uploadedBy,
    });

    const data = await updateAdditionalAssignment({
      id,
      assignedEmployeeIds,
      namaKegiatan,
      deskripsi,
      tanggalMulai,
      tanggalSelesai,
      idSuratTugasDokumen: savedDocument?.id_dokumen ?? null,
    });

    if (!data) {
      await deleteStoredDocument(savedDocument);
      return res.status(404).json({ message: "Penugasan tambahan tidak ditemukan." });
    }

    if (savedDocument && previousDocument) {
      try {
        await deleteStoredDocument(previousDocument);
      } catch {
        // Dokumen lama tetap tidak dipakai; kegagalan cleanup tidak membatalkan update utama.
      }
    }

    res.status(200).json({ message: "Penugasan tambahan berhasil diperbarui.", data });
  } catch (err) {
    await deleteStoredDocument(savedDocument);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err.code === "23503") {
      return res.status(400).json({ message: "Pegawai penugasan tambahan tidak valid." });
    }

    res.status(500).json({ message: "Gagal memperbarui penugasan tambahan." });
  }
};
