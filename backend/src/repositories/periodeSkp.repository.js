import pool from "../config/db.js";

const mapPeriodeRow = (row) => ({
  id: row.id_periode_skp,
  tahun: row.tahun,
  tanggalMulai: row.tanggal_mulai,
  tanggalSelesai: row.tanggal_selesai,
});

export const findAllPeriodeSkp = async () => {
  const result = await pool.query(`
    SELECT
      id_periode_skp,
      tahun,
      tanggal_mulai::text AS tanggal_mulai,
      tanggal_selesai::text AS tanggal_selesai
    FROM periode_skp
    ORDER BY tahun DESC, tanggal_mulai DESC, id_periode_skp DESC
  `);

  return result.rows.map(mapPeriodeRow);
};

export const createPeriodeSkp = async ({ tahun, tanggalMulai, tanggalSelesai }) => {
  const result = await pool.query(
    `
      INSERT INTO periode_skp (tahun, tanggal_mulai, tanggal_selesai)
      VALUES ($1, $2, $3)
      RETURNING
        id_periode_skp,
        tahun,
        tanggal_mulai::text AS tanggal_mulai,
        tanggal_selesai::text AS tanggal_selesai
    `,
    [tahun, tanggalMulai, tanggalSelesai],
  );

  return mapPeriodeRow(result.rows[0]);
};

export const updatePeriodeSkp = async (id, { tahun, tanggalMulai, tanggalSelesai }) => {
  const result = await pool.query(
    `
      UPDATE periode_skp
      SET
        tahun = $2,
        tanggal_mulai = $3,
        tanggal_selesai = $4,
        updated_at = current_timestamp
      WHERE id_periode_skp = $1
      RETURNING
        id_periode_skp,
        tahun,
        tanggal_mulai::text AS tanggal_mulai,
        tanggal_selesai::text AS tanggal_selesai
    `,
    [id, tahun, tanggalMulai, tanggalSelesai],
  );

  return result.rows[0] ? mapPeriodeRow(result.rows[0]) : null;
};

export const deletePeriodeSkp = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM periode_skp
      WHERE id_periode_skp = $1
      RETURNING id_periode_skp
    `,
    [id],
  );

  return result.rowCount > 0;
};
