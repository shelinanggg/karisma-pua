import pool from "../config/db.js";

export const saveRefreshToken = async (idPengguna, token, expiresAt) => {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (id_pengguna, token, expires_at) 
     VALUES ($1, $2, $3) RETURNING *`,
    [idPengguna, token, expiresAt]
  );
  return result.rows[0];
};

export const findRefreshToken = async (token) => {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens WHERE token = $1`,
    [token]
  );
  return result.rows[0];
};

export const deleteRefreshToken = async (token) => {
  await pool.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
};
