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