import pool from "../config/db.js";

const formatDateColumn = (column) => `to_char(${column}, 'YYYY-MM-DD')`;

const mapPegawaiRow = (row) => ({
  id: row.id_pengguna,
  nip: row.nip ?? "",
  nama: row.nama ?? "",
  tempat_lahir: row.tempat_lahir ?? "",
  tanggal_lahir: row.tanggal_lahir ?? "",
  role_id: row.role_id ? String(row.role_id) : "",
  fungsional: row.fungsional ?? "",
  tmt_golongan: row.tmt_golongan ?? "",
  pendidikan: row.pendidikan ?? "",
  kualifikasi: row.kualifikasi ?? "",
  tmt_kgb: row.tmt_kgb ?? "",
  tmt_jabatan: row.tmt_jabatan ?? "",
  tmt_pensiun: row.tmt_pensiun ?? "",
  jabatan_id: row.id_jabatan ? String(row.id_jabatan) : "",
  pangkat_id: row.id_pangkat ? String(row.id_pangkat) : "",
  golongan_id: row.id_golongan ? String(row.id_golongan) : "",
  penempatan_id: row.id_penempatan ? String(row.id_penempatan) : "",
  sertifikasi_id: row.id_sertifikasi ? String(row.id_sertifikasi) : "",
});

const pegawaiSelect = `
  SELECT
    id_pengguna,
    nip,
    nama,
    tempat_lahir,
    ${formatDateColumn("tanggal_lahir")} AS tanggal_lahir,
    role_id,
    fungsional,
    ${formatDateColumn("tmt_golongan")} AS tmt_golongan,
    pendidikan,
    kualifikasi,
    ${formatDateColumn("tmt_kgb")} AS tmt_kgb,
    ${formatDateColumn("tmt_jabatan")} AS tmt_jabatan,
    ${formatDateColumn("tmt_pensiun")} AS tmt_pensiun,
    id_jabatan,
    id_pangkat,
    id_golongan,
    id_penempatan,
    id_sertifikasi
  FROM pengguna
`;

export const findAllPegawai = async () => {
  const result = await pool.query(`
    ${pegawaiSelect}
    ORDER BY nama ASC, id_pengguna ASC
  `);

  return result.rows.map(mapPegawaiRow);
};

export const findPegawaiById = async (id) => {
  const result = await pool.query(
    `
      ${pegawaiSelect}
      WHERE id_pengguna = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ? mapPegawaiRow(result.rows[0]) : null;
};

export const findPegawaiByNip = async (nip, excludeId = null) => {
  const result = await pool.query(
    `
      SELECT id_pengguna
      FROM pengguna
      WHERE nip IS NOT NULL
        AND trim(nip) <> ''
        AND lower(trim(nip)) = lower(trim($1))
        AND ($2::integer IS NULL OR id_pengguna <> $2::integer)
      LIMIT 1
    `,
    [nip, excludeId],
  );

  return result.rows[0] ?? null;
};

export const createPegawai = async (payload) => {
  const result = await pool.query(
    `
      INSERT INTO pengguna (
        nip,
        nama,
        password_hash,
        tempat_lahir,
        tanggal_lahir,
        role_id,
        fungsional,
        tmt_golongan,
        pendidikan,
        kualifikasi,
        tmt_kgb,
        tmt_jabatan,
        tmt_pensiun,
        id_jabatan,
        id_pangkat,
        id_golongan,
        id_penempatan,
        id_sertifikasi
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING id_pengguna
    `,
    [
      payload.nip,
      payload.nama,
      payload.password_hash,
      payload.tempat_lahir,
      payload.tanggal_lahir,
      payload.role_id,
      payload.fungsional,
      payload.tmt_golongan,
      payload.pendidikan,
      payload.kualifikasi,
      payload.tmt_kgb,
      payload.tmt_jabatan,
      payload.tmt_pensiun,
      payload.id_jabatan,
      payload.id_pangkat,
      payload.id_golongan,
      payload.id_penempatan,
      payload.id_sertifikasi,
    ],
  );

  return findPegawaiById(result.rows[0].id_pengguna);
};

export const updatePegawai = async (id, payload) => {
  const result = await pool.query(
    `
      UPDATE pengguna
      SET
        nip = $2,
        nama = $3,
        tempat_lahir = $4,
        tanggal_lahir = $5,
        role_id = $6,
        fungsional = $7,
        tmt_golongan = $8,
        pendidikan = $9,
        kualifikasi = $10,
        tmt_kgb = $11,
        tmt_jabatan = $12,
        tmt_pensiun = $13,
        id_jabatan = $14,
        id_pangkat = $15,
        id_golongan = $16,
        id_penempatan = $17,
        id_sertifikasi = $18
      WHERE id_pengguna = $1
      RETURNING id_pengguna
    `,
    [
      id,
      payload.nip,
      payload.nama,
      payload.tempat_lahir,
      payload.tanggal_lahir,
      payload.role_id,
      payload.fungsional,
      payload.tmt_golongan,
      payload.pendidikan,
      payload.kualifikasi,
      payload.tmt_kgb,
      payload.tmt_jabatan,
      payload.tmt_pensiun,
      payload.id_jabatan,
      payload.id_pangkat,
      payload.id_golongan,
      payload.id_penempatan,
      payload.id_sertifikasi,
    ],
  );

  if (!result.rows[0]) return null;
  return findPegawaiById(result.rows[0].id_pengguna);
};

export const deletePegawai = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM pengguna
      WHERE id_pengguna = $1
      RETURNING id_pengguna
    `,
    [id],
  );

  return result.rowCount > 0;
};

export const findPegawaiReferences = async () => {
  const [roles, jabatan, pangkat, golongan, penempatan, sertifikasi] = await Promise.all([
    pool.query("SELECT role_id AS id, name AS label FROM roles ORDER BY role_id ASC"),
    pool.query("SELECT id_jabatan AS id, jabatan_pengguna AS label FROM jabatan ORDER BY jabatan_pengguna ASC"),
    pool.query("SELECT id_pangkat AS id, nama_pangkat AS label FROM pangkat ORDER BY nama_pangkat ASC"),
    pool.query("SELECT id_golongan AS id, nama_golongan AS label FROM golongan ORDER BY nama_golongan ASC"),
    pool.query("SELECT id_penempatan AS id, nama_penempatan AS label FROM penempatan ORDER BY nama_penempatan ASC"),
    pool.query("SELECT id_sertifikasi AS id, nama_sertifikasi AS label FROM sertifikasi ORDER BY nama_sertifikasi ASC"),
  ]);

  const mapReference = (row) => ({
    id: String(row.id),
    label: row.label ? row.label.charAt(0).toUpperCase() + row.label.slice(1) : "",
  });

  return {
    roles: roles.rows.map(mapReference),
    jabatan: jabatan.rows.map(mapReference),
    pangkat: pangkat.rows.map(mapReference),
    golongan: golongan.rows.map(mapReference),
    penempatan: penempatan.rows.map(mapReference),
    sertifikasi: sertifikasi.rows.map(mapReference),
  };
};
