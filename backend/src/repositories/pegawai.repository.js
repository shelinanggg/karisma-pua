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
  target_ketercapaian: row.target_ketercapaian ?? "",
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
    target_ketercapaian,
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
        target_ketercapaian,
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
        $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
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
      payload.target_ketercapaian,
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
        target_ketercapaian = $11,
        tmt_kgb = $12,
        tmt_jabatan = $13,
        tmt_pensiun = $14,
        id_jabatan = $15,
        id_pangkat = $16,
        id_golongan = $17,
        id_penempatan = $18,
        id_sertifikasi = $19
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
      payload.target_ketercapaian,
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

const mapEarlyWarningRow = (row, dateField) => ({
  id: String(row.id_pengguna),
  name: row.nama ?? "",
  nip: row.nip ?? "",
  [dateField]: row.warning_date ?? "",
  daysLeft: Number(row.days_left ?? 0),
});

const mapPromotionWarningRow = (row) => ({
  id: String(row.id_pengguna),
  name: row.nama ?? "",
  nip: row.nip ?? "",
  currentScore: Number(row.current_score ?? 0),
  requiredScore: Number(row.required_score ?? 0),
  remainingScore: Number(row.remaining_score ?? 0),
  currentJabatanId: String(row.current_jabatan_id ?? ""),
  currentJabatan: row.current_jabatan ?? "",
  coefficientPerYear: Number(row.coefficient_per_year ?? 0),
  eligibleJabatan: Array.isArray(row.eligible_jabatan)
    ? row.eligible_jabatan.map((item) => ({
        id: String(item.id ?? ""),
        name: item.name ?? "",
        coefficientPerYear: item.coefficientPerYear === null ? null : Number(item.coefficientPerYear),
        targetScore: item.targetScore === null ? null : Number(item.targetScore),
      }))
    : [],
});

export const findPegawaiEarlyWarnings = async () => {
  const [promotionResult, kgbResult, pensionResult] = await Promise.all([
    pool.query(`
      WITH jabatan_dengan_target AS (
        SELECT
          data_jabatan.*,
          COALESCE(
            data_jabatan.target_angka_kredit_naik_jabatan,
            (
              SELECT MIN(jabatan_setara.target_angka_kredit_naik_jabatan)
              FROM jabatan jabatan_setara
              WHERE data_jabatan.kredit_koefisien_per_tahun IS NOT NULL
                AND jabatan_setara.kredit_koefisien_per_tahun = data_jabatan.kredit_koefisien_per_tahun
                AND jabatan_setara.target_angka_kredit_naik_jabatan IS NOT NULL
            )
          ) AS target_efektif
        FROM jabatan data_jabatan
      )
      SELECT
        pengguna.id_pengguna,
        pengguna.nama,
        pengguna.nip,
        pengguna.angka_kredit_saat_ini AS current_score,
        jabatan.target_efektif AS required_score,
        jabatan.target_efektif - pengguna.angka_kredit_saat_ini AS remaining_score,
        jabatan.id_jabatan AS current_jabatan_id,
        jabatan.jabatan_pengguna AS current_jabatan,
        jabatan.kredit_koefisien_per_tahun AS coefficient_per_year,
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', kandidat.id_jabatan,
                'name', kandidat.jabatan_pengguna,
                'coefficientPerYear', kandidat.kredit_koefisien_per_tahun,
                'targetScore', kandidat.target_efektif
              )
              ORDER BY
                kandidat.target_efektif NULLS LAST,
                kandidat.kredit_koefisien_per_tahun NULLS LAST,
                kandidat.jabatan_pengguna
            )
            FROM jabatan_dengan_target kandidat
            WHERE kandidat.id_jabatan <> jabatan.id_jabatan
              AND (
                kandidat.target_efektif > jabatan.target_efektif
                OR kandidat.target_efektif = jabatan.target_efektif
                OR (
                  kandidat.kredit_koefisien_per_tahun IS NOT NULL
                  AND kandidat.kredit_koefisien_per_tahun = jabatan.kredit_koefisien_per_tahun
                )
              )
          ),
          '[]'::jsonb
        ) AS eligible_jabatan
      FROM pengguna
      INNER JOIN jabatan_dengan_target jabatan
        ON jabatan.id_jabatan = pengguna.id_jabatan
      LEFT JOIN roles
        ON roles.role_id = pengguna.role_id
      WHERE pengguna.status_aktif IS DISTINCT FROM FALSE
        AND LOWER(COALESCE(roles.name, '')) = 'pegawai'
        AND pengguna.angka_kredit_saat_ini IS NOT NULL
        AND jabatan.target_efektif IS NOT NULL
        AND jabatan.target_efektif > 0
        AND jabatan.target_efektif - pengguna.angka_kredit_saat_ini <= 20
      ORDER BY remaining_score ASC, pengguna.nama ASC, pengguna.id_pengguna ASC
    `),
    pool.query(`
      SELECT
        id_pengguna,
        nama,
        nip,
        ${formatDateColumn("tmt_kgb")} AS warning_date,
        (tmt_kgb::date - current_date) AS days_left
      FROM pengguna
      WHERE status_aktif IS DISTINCT FROM FALSE
        AND tmt_kgb IS NOT NULL
        AND tmt_kgb::date BETWEEN current_date AND current_date + INTERVAL '90 days'
      ORDER BY tmt_kgb ASC, nama ASC, id_pengguna ASC
    `),
    pool.query(`
      SELECT
        id_pengguna,
        nama,
        nip,
        ${formatDateColumn("tmt_pensiun")} AS warning_date,
        (tmt_pensiun::date - current_date) AS days_left
      FROM pengguna
      WHERE status_aktif IS DISTINCT FROM FALSE
        AND tmt_pensiun IS NOT NULL
        AND tmt_pensiun::date BETWEEN current_date AND current_date + INTERVAL '5 years'
      ORDER BY tmt_pensiun ASC, nama ASC, id_pengguna ASC
    `),
  ]);

  return {
    jabatan: promotionResult.rows.map(mapPromotionWarningRow),
    kgb: kgbResult.rows.map((row) => mapEarlyWarningRow(row, "tmtKgb")),
    pensiun: pensionResult.rows.map((row) => mapEarlyWarningRow(row, "tmtPension")),
  };
};

export const processPromotionJabatan = async ({ idPengguna, idJabatan }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const eligibilityResult = await client.query(
      `
        WITH jabatan_dengan_target AS (
          SELECT
            data_jabatan.*,
            COALESCE(
              data_jabatan.target_angka_kredit_naik_jabatan,
              (
                SELECT MIN(jabatan_setara.target_angka_kredit_naik_jabatan)
                FROM jabatan jabatan_setara
                WHERE data_jabatan.kredit_koefisien_per_tahun IS NOT NULL
                  AND jabatan_setara.kredit_koefisien_per_tahun = data_jabatan.kredit_koefisien_per_tahun
                  AND jabatan_setara.target_angka_kredit_naik_jabatan IS NOT NULL
              )
            ) AS target_efektif
          FROM jabatan data_jabatan
        )
        SELECT
          pengguna.id_pengguna,
          pengguna.angka_kredit_saat_ini,
          jabatan.id_jabatan AS current_jabatan_id,
          jabatan.target_efektif AS current_target,
          jabatan.kredit_koefisien_per_tahun AS current_coefficient,
          kandidat.id_jabatan AS target_jabatan_id
        FROM pengguna
        INNER JOIN jabatan_dengan_target jabatan
          ON jabatan.id_jabatan = pengguna.id_jabatan
        INNER JOIN jabatan_dengan_target kandidat
          ON kandidat.id_jabatan = $2
        LEFT JOIN roles
          ON roles.role_id = pengguna.role_id
        WHERE pengguna.id_pengguna = $1
          AND pengguna.status_aktif IS DISTINCT FROM FALSE
          AND LOWER(COALESCE(roles.name, '')) = 'pegawai'
          AND pengguna.angka_kredit_saat_ini IS NOT NULL
          AND jabatan.target_efektif IS NOT NULL
          AND pengguna.angka_kredit_saat_ini >= jabatan.target_efektif
          AND kandidat.id_jabatan <> jabatan.id_jabatan
          AND (
            kandidat.target_efektif > jabatan.target_efektif
            OR kandidat.target_efektif = jabatan.target_efektif
            OR (
              kandidat.kredit_koefisien_per_tahun IS NOT NULL
              AND kandidat.kredit_koefisien_per_tahun = jabatan.kredit_koefisien_per_tahun
            )
          )
        FOR UPDATE OF pengguna
      `,
      [idPengguna, idJabatan],
    );

    if (!eligibilityResult.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE pengguna
        SET
          id_jabatan = $2,
          tmt_jabatan = CURRENT_DATE
        WHERE id_pengguna = $1
      `,
      [idPengguna, idJabatan],
    );

    await client.query(
      `
        INSERT INTO riwayat_jabatan (
          id_pengguna,
          id_jabatan,
          tmt_jabatan
        )
        VALUES ($1, $2, CURRENT_DATE)
      `,
      [idPengguna, idJabatan],
    );

    await client.query("COMMIT");
    return findPegawaiById(idPengguna);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
