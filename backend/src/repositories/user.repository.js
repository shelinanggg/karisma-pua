import pool from "../config/db.js";

export const findUserByNip = async (nip) => {
  const result = await pool.query(
    `SELECT 
      pengguna.id_pengguna,
      pengguna.nama,
      pengguna.password_hash,
      pengguna.nip,
      roles.name AS roles_name
    FROM pengguna
    JOIN roles ON roles.role_id = pengguna.role_id
    WHERE pengguna.nip = $1`, [nip]);
  return result.rows[0];
};

export const findUserProfileById = async (idPengguna) => {
  const result = await pool.query(
    `SELECT
      pengguna.id_pengguna,
      pengguna.nip,
      pengguna.nama,
      pengguna.tempat_lahir,
      pengguna.tanggal_lahir,
      pengguna.fungsional,
      pengguna.tmt_golongan,
      pengguna.pendidikan,
      pengguna.kualifikasi,
      pengguna.tmt_kgb,
      pengguna.status_aktif,
      pengguna.tmt_jabatan,
      pengguna.tmt_pensiun,
      pengguna.created_at,
      roles.name AS role,
      jabatan.jabatan_pengguna AS jabatan,
      pangkat.nama_pangkat AS pangkat,
      golongan.nama_golongan AS golongan,
      penempatan.nama_penempatan AS penempatan,
      sertifikasi.nama_sertifikasi AS sertifikasi
    FROM pengguna
    JOIN roles ON roles.role_id = pengguna.role_id
    LEFT JOIN jabatan ON jabatan.id_jabatan = pengguna.id_jabatan
    LEFT JOIN pangkat ON pangkat.id_pangkat = pengguna.id_pangkat
    LEFT JOIN golongan ON golongan.id_golongan = pengguna.id_golongan
    LEFT JOIN penempatan ON penempatan.id_penempatan = pengguna.id_penempatan
    LEFT JOIN sertifikasi ON sertifikasi.id_sertifikasi = pengguna.id_sertifikasi
    WHERE pengguna.id_pengguna = $1`,
    [idPengguna]
  );

  return result.rows[0];
};

export const findUserPasswordById = async (idPengguna) => {
  const result = await pool.query(
    `SELECT id_pengguna, password_hash FROM pengguna WHERE id_pengguna = $1`,
    [idPengguna]
  );

  return result.rows[0];
};

export const updateUserPasswordHash = async (idPengguna, passwordHash) => {
  const result = await pool.query(
    `UPDATE pengguna
     SET password_hash = $2
     WHERE id_pengguna = $1
     RETURNING id_pengguna`,
    [idPengguna, passwordHash]
  );

  return result.rows[0];
};
