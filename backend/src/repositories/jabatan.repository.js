import pool from "../config/db.js";

const mapJabatanRow = (row) => ({
  id: Number(row.id_jabatan),
  name: row.jabatan_pengguna ?? "",
  coefficientPerYear:
    row.kredit_koefisien_per_tahun === null
      ? null
      : Number(row.kredit_koefisien_per_tahun),
  promotionCreditTarget:
    row.target_angka_kredit_naik_jabatan === null
      ? null
      : Number(row.target_angka_kredit_naik_jabatan),
  employeeCount: Number(row.employee_count ?? 0),
});

const jabatanSelect = `
  SELECT
    jabatan.id_jabatan,
    jabatan.jabatan_pengguna,
    jabatan.kredit_koefisien_per_tahun,
    jabatan.target_angka_kredit_naik_jabatan,
    COUNT(pengguna.id_pengguna) AS employee_count
  FROM jabatan
  LEFT JOIN pengguna
    ON pengguna.id_jabatan = jabatan.id_jabatan
`;

export const findAllJabatan = async () => {
  const result = await pool.query(`
    ${jabatanSelect}
    GROUP BY
      jabatan.id_jabatan,
      jabatan.jabatan_pengguna,
      jabatan.kredit_koefisien_per_tahun,
      jabatan.target_angka_kredit_naik_jabatan
    ORDER BY jabatan.jabatan_pengguna ASC, jabatan.id_jabatan ASC
  `);

  return result.rows.map(mapJabatanRow);
};

export const findJabatanByNormalizedName = async (name, excludeId = null) => {
  const result = await pool.query(
    `
      SELECT id_jabatan
      FROM jabatan
      WHERE lower(trim(jabatan_pengguna)) = lower(trim($1))
        AND ($2::integer IS NULL OR id_jabatan <> $2::integer)
      LIMIT 1
    `,
    [name, excludeId],
  );

  return result.rows[0] ?? null;
};

export const createJabatan = async ({
  name,
  coefficientPerYear,
  promotionCreditTarget,
}) => {
  const result = await pool.query(
    `
      INSERT INTO jabatan (
        jabatan_pengguna,
        kredit_koefisien_per_tahun,
        target_angka_kredit_naik_jabatan
      )
      VALUES ($1, $2, $3)
      RETURNING id_jabatan
    `,
    [name, coefficientPerYear, promotionCreditTarget],
  );

  return findJabatanById(result.rows[0].id_jabatan);
};

export const findJabatanById = async (id) => {
  const result = await pool.query(
    `
      ${jabatanSelect}
      WHERE jabatan.id_jabatan = $1
      GROUP BY
        jabatan.id_jabatan,
        jabatan.jabatan_pengguna,
        jabatan.kredit_koefisien_per_tahun,
        jabatan.target_angka_kredit_naik_jabatan
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ? mapJabatanRow(result.rows[0]) : null;
};

export const updateJabatan = async (
  id,
  { name, coefficientPerYear, promotionCreditTarget },
) => {
  const result = await pool.query(
    `
      UPDATE jabatan
      SET
        jabatan_pengguna = $2,
        kredit_koefisien_per_tahun = $3,
        target_angka_kredit_naik_jabatan = $4
      WHERE id_jabatan = $1
      RETURNING id_jabatan
    `,
    [id, name, coefficientPerYear, promotionCreditTarget],
  );

  if (!result.rows[0]) return null;
  return findJabatanById(result.rows[0].id_jabatan);
};
