import pool from "../config/db.js";

export const findUserByNip = async (nip) => {
  const result = await pool.query(
    `SELECT 
      users.user_id,
      users.name,
      users.password_hash,
      users.nip,
      roles.name
    FROM users
    JOIN roles ON roles.role_id = users.role_id
    WHERE users.nip = $1`, [nip]);
  return result.rows[0];
};