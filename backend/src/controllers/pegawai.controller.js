import bcrypt from "bcrypt";
import {
  createPegawai,
  deletePegawai,
  findAllPegawai,
  findPegawaiByNip,
  findPegawaiReferences,
  updatePegawai,
} from "../repositories/pegawai.repository.js";

const DEFAULT_PASSWORD = "password123";

const nullableText = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const nullableDate = (value) => nullableText(value);

const nullableInteger = (value) => {
  const text = nullableText(value);
  if (!text) return null;

  const parsed = Number(text);
  return Number.isInteger(parsed) ? parsed : NaN;
};

const normalizePayload = (body, passwordHash = null) => {
  const payload = {
    nip: nullableText(body.nip),
    nama: nullableText(body.nama),
    tempat_lahir: nullableText(body.tempat_lahir),
    tanggal_lahir: nullableDate(body.tanggal_lahir),
    role_id: nullableInteger(body.role_id),
    fungsional: nullableText(body.fungsional),
    tmt_golongan: nullableDate(body.tmt_golongan),
    pendidikan: nullableText(body.pendidikan),
    kualifikasi: nullableText(body.kualifikasi),
    tmt_kgb: nullableDate(body.tmt_kgb),
    tmt_jabatan: nullableDate(body.tmt_jabatan),
    tmt_pensiun: nullableDate(body.tmt_pensiun),
    id_jabatan: nullableInteger(body.jabatan_id),
    id_pangkat: nullableInteger(body.pangkat_id),
    id_golongan: nullableInteger(body.golongan_id),
    id_penempatan: nullableInteger(body.penempatan_id),
    id_sertifikasi: nullableInteger(body.sertifikasi_id),
  };

  if (passwordHash) {
    payload.password_hash = passwordHash;
  }

  return payload;
};

const validatePayload = (payload) => {
  if (!payload.nama) return "Nama pegawai wajib diisi.";
  if (!payload.role_id) return "Role wajib diisi.";

  const integerFields = [
    "role_id",
    "id_jabatan",
    "id_pangkat",
    "id_golongan",
    "id_penempatan",
    "id_sertifikasi",
  ];

  if (integerFields.some((field) => Number.isNaN(payload[field]))) {
    return "Data referensi pegawai tidak valid.";
  }

  return null;
};

export const getPegawaiList = async (_req, res) => {
  try {
    const data = await findAllPegawai();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data pegawai." });
  }
};

export const getPegawaiReferences = async (_req, res) => {
  try {
    const data = await findPegawaiReferences();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data referensi pegawai." });
  }
};

export const postPegawai = async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const payload = normalizePayload(req.body, passwordHash);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (payload.nip) {
      const existing = await findPegawaiByNip(payload.nip);
      if (existing) {
        return res.status(409).json({ message: "NIP pegawai sudah digunakan." });
      }
    }

    const data = await createPegawai(payload);
    res.status(201).json({ message: "Pegawai berhasil ditambahkan.", data });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "NIP pegawai sudah digunakan." });
    }

    if (err.code === "23503") {
      return res.status(400).json({ message: "Data referensi pegawai tidak valid." });
    }

    res.status(500).json({ message: "Gagal menambahkan pegawai." });
  }
};

export const patchPegawai = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (payload.nip) {
      const existing = await findPegawaiByNip(payload.nip, req.params.id);
      if (existing) {
        return res.status(409).json({ message: "NIP pegawai sudah digunakan." });
      }
    }

    const data = await updatePegawai(req.params.id, payload);
    if (!data) {
      return res.status(404).json({ message: "Pegawai tidak ditemukan." });
    }

    res.status(200).json({ message: "Pegawai berhasil diperbarui.", data });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "NIP pegawai sudah digunakan." });
    }

    if (err.code === "23503") {
      return res.status(400).json({ message: "Data referensi pegawai tidak valid." });
    }

    res.status(500).json({ message: "Gagal memperbarui pegawai." });
  }
};

export const removePegawai = async (req, res) => {
  try {
    const deleted = await deletePegawai(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Pegawai tidak ditemukan." });
    }

    res.status(200).json({ message: "Pegawai berhasil dihapus." });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ message: "Pegawai masih dipakai pada data lain dan tidak dapat dihapus." });
    }

    res.status(500).json({ message: "Gagal menghapus pegawai." });
  }
};
