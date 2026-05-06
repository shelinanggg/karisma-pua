import pool from "../config/db.js";

const mapPeriodeRow = (row) => ({
  id: row.id_periode_skp,
  tahun: row.tahun,
  tanggalMulai: row.tanggal_mulai,
  tanggalSelesai: row.tanggal_selesai,
  assignmentCount: Number(row.assignment_count ?? 0),
});

export const findAllPeriodeSkp = async () => {
  const result = await pool.query(`
    SELECT
      periode_skp.id_periode_skp,
      periode_skp.tahun,
      periode_skp.tanggal_mulai::text AS tanggal_mulai,
      periode_skp.tanggal_selesai::text AS tanggal_selesai,
      COUNT(pengguna_kegiatan.id_pengguna_kegiatan) AS assignment_count
    FROM periode_skp
    LEFT JOIN pengguna_kegiatan
      ON pengguna_kegiatan.id_periode_skp = periode_skp.id_periode_skp
    GROUP BY
      periode_skp.id_periode_skp,
      periode_skp.tahun,
      periode_skp.tanggal_mulai,
      periode_skp.tanggal_selesai
    ORDER BY periode_skp.tahun DESC, periode_skp.tanggal_mulai DESC, periode_skp.id_periode_skp DESC
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

export const findPeriodeSkpByYear = async (tahun, excludeId = null) => {
  const result = await pool.query(
    `
      SELECT id_periode_skp, tahun
      FROM periode_skp
      WHERE tahun = $1
        AND ($2::integer IS NULL OR id_periode_skp <> $2::integer)
      LIMIT 1
    `,
    [tahun, excludeId],
  );

  return result.rows[0] ?? null;
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
