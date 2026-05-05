import pool from "../config/db.js";

const mapButirRow = (row) => ({
  id: row.id_butir_kegiatan,
  name: row.nama_kegiatan,
});

export const findAllButirKegiatan = async () => {
  const result = await pool.query(`
    SELECT id_butir_kegiatan, nama_kegiatan
    FROM butir_kegiatan
    ORDER BY nama_kegiatan ASC
  `);

  return result.rows.map(mapButirRow);
};

export const findButirKegiatanByNormalizedName = async (name, excludeId = null) => {
  const result = await pool.query(
    `
      SELECT id_butir_kegiatan, nama_kegiatan
      FROM butir_kegiatan
      WHERE lower(trim(nama_kegiatan)) = lower(trim($1))
        AND ($2::integer IS NULL OR id_butir_kegiatan <> $2::integer)
      LIMIT 1
    `,
    [name, excludeId],
  );

  return result.rows[0] ? mapButirRow(result.rows[0]) : null;
};

export const createButirKegiatan = async ({ name }) => {
  const result = await pool.query(
    `
      INSERT INTO butir_kegiatan (nama_kegiatan)
      VALUES ($1)
      RETURNING id_butir_kegiatan, nama_kegiatan
    `,
    [name],
  );

  return mapButirRow(result.rows[0]);
};

export const updateButirKegiatan = async (id, { name }) => {
  const result = await pool.query(
    `
      UPDATE butir_kegiatan
      SET nama_kegiatan = $2, updated_at = current_timestamp
      WHERE id_butir_kegiatan = $1
      RETURNING id_butir_kegiatan, nama_kegiatan
    `,
    [id, name],
  );

  return result.rows[0] ? mapButirRow(result.rows[0]) : null;
};

export const deleteButirKegiatan = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM butir_kegiatan
      WHERE id_butir_kegiatan = $1
      RETURNING id_butir_kegiatan
    `,
    [id],
  );

  return result.rowCount > 0;
};
