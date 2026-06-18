import {
  createJabatan,
  findAllJabatan,
  findJabatanByNormalizedName,
  updateJabatan,
} from "../repositories/jabatan.repository.js";

const parseOptionalNonNegativeNumber = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : NaN;
};

const normalizePayload = (body) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  coefficientPerYear: parseOptionalNonNegativeNumber(body.coefficientPerYear),
  promotionCreditTarget: parseOptionalNonNegativeNumber(body.promotionCreditTarget),
});

const validatePayload = (payload) => {
  if (!payload.name) return "Nama jabatan wajib diisi.";
  if (Number.isNaN(payload.coefficientPerYear)) {
    return "Koefisien per tahun harus berupa angka 0 atau lebih.";
  }
  if (Number.isNaN(payload.promotionCreditTarget)) {
    return "Target angka kredit harus berupa angka 0 atau lebih.";
  }
  return null;
};

export const getJabatanList = async (_req, res) => {
  try {
    const data = await findAllJabatan();
    res.status(200).json({ data });
  } catch {
    res.status(500).json({ message: "Gagal mengambil data jabatan." });
  }
};

export const postJabatan = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await findJabatanByNormalizedName(payload.name);
    if (existing) {
      return res.status(409).json({ message: "Nama jabatan sudah ada." });
    }

    const data = await createJabatan(payload);
    res.status(201).json({ message: "Jabatan berhasil ditambahkan.", data });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Nama jabatan sudah ada." });
    }
    res.status(500).json({ message: "Gagal menambahkan jabatan." });
  }
};

export const patchJabatan = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Jabatan tidak valid." });
    }

    const payload = normalizePayload(req.body);
    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await findJabatanByNormalizedName(payload.name, id);
    if (existing) {
      return res.status(409).json({ message: "Nama jabatan sudah ada." });
    }

    const data = await updateJabatan(id, payload);
    if (!data) {
      return res.status(404).json({ message: "Jabatan tidak ditemukan." });
    }

    res.status(200).json({ message: "Jabatan berhasil diperbarui.", data });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Nama jabatan sudah ada." });
    }
    res.status(500).json({ message: "Gagal memperbarui jabatan." });
  }
};
