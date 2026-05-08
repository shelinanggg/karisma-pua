import pool from "../config/db.js";

const formatDateColumn = (column) => `to_char(${column}, 'YYYY-MM-DD')`;
const additionalAssignmentRelationTables = [
  "penugasan_tambahan_pengguna",
  "pengguna_penugasan_tambahan",
];
let additionalAssignmentRelationTable = null;

const getAdditionalAssignmentRelationTable = async (queryable = pool) => {
  if (additionalAssignmentRelationTable) return additionalAssignmentRelationTable;

  const result = await queryable.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
    `,
    [additionalAssignmentRelationTables],
  );

  const existingTables = new Set(result.rows.map((row) => row.table_name));
  additionalAssignmentRelationTable = additionalAssignmentRelationTables.find((tableName) =>
    existingTables.has(tableName),
  );

  if (!additionalAssignmentRelationTable) {
    throw new Error("Tabel relasi penugasan tambahan tidak ditemukan.");
  }

  return additionalAssignmentRelationTable;
};

const mapEmployeeRow = (row) => ({
  id: String(row.id_pengguna),
  nip: row.nip ?? "",
  nama: row.nama ?? "",
  role: row.role ? row.role.charAt(0).toUpperCase() + row.role.slice(1) : "-",
  fungsional: row.fungsional ?? "-",
  pangkat: row.pangkat ?? "-",
  golongan: row.golongan ?? "-",
  assignmentCount: Number(row.assignment_count ?? 0),
});

const mapButirAssignmentRow = (row) => ({
  id: String(row.id_pengguna_kegiatan),
  idPengguna: String(row.id_pengguna),
  idButirKegiatan: String(row.id_butir_kegiatan),
  idPeriodeSkp: String(row.id_periode_skp),
  namaKegiatan: row.nama_kegiatan ?? "",
  uraian: row.uraian ?? "",
  deskripsi: row.deskripsi ?? "",
  targetKetercapaian: row.target_ketercapaian ?? "",
  status: row.status,
});

const mapMyButirAssignmentRow = (row) => ({
  ...mapButirAssignmentRow(row),
  tahun: Number(row.tahun),
  tanggalMulai: row.tanggal_mulai ?? "",
  tanggalSelesai: row.tanggal_selesai ?? "",
  realisasiTotal: Number(row.realisasi_total ?? 0),
  realisasiCount: Number(row.realisasi_count ?? 0),
});

const mapRealisasiRow = (row) => ({
  id: String(row.id_realisasi_kegiatan),
  idPenggunaKegiatan: String(row.id_pengguna_kegiatan),
  namaKegiatan: row.nama_kegiatan ?? "",
  tanggalRealisasi: row.tanggal_realisasi ?? "",
  realisasiTarget: row.realisasi_target ?? "",
  keterangan: row.keterangan ?? "",
});

const mapTambahanRow = (row) => {
  const assignedEmployees = Array.isArray(row.assigned_employees)
    ? row.assigned_employees.filter((employee) => employee?.id)
    : [];

  return {
    id: String(row.id_penugasan_tambahan),
    namaKegiatan: row.nama_kegiatan ?? "",
    deskripsiKegiatan: row.deskripsi ?? "",
    status: row.status ?? "aktif",
    tanggalMulai: row.tanggal_mulai ?? "",
    tanggalSelesai: row.tanggal_selesai ?? "",
    suratTugas: row.surat_tugas ?? "",
    assignedEmployees: assignedEmployees.map((employee) => ({
      id: String(employee.id),
      nama: employee.nama ?? "",
      nip: employee.nip ?? "",
    })),
  };
};

export const findAssignableEmployees = async ({ idPeriodeSkp = null } = {}) => {
  const result = await pool.query(
    `
    SELECT
      pengguna.id_pengguna,
      pengguna.nip,
      pengguna.nama,
      roles.name AS role,
      pengguna.fungsional,
      pangkat.nama_pangkat AS pangkat,
      golongan.nama_golongan AS golongan,
      COUNT(pengguna_kegiatan.id_pengguna_kegiatan) AS assignment_count
    FROM pengguna
    LEFT JOIN roles ON roles.role_id = pengguna.role_id
    LEFT JOIN pangkat ON pangkat.id_pangkat = pengguna.id_pangkat
    LEFT JOIN golongan ON golongan.id_golongan = pengguna.id_golongan
    LEFT JOIN pengguna_kegiatan
      ON pengguna_kegiatan.id_pengguna = pengguna.id_pengguna
      AND ($1::integer IS NULL OR pengguna_kegiatan.id_periode_skp = $1::integer)
    WHERE pengguna.status_aktif IS DISTINCT FROM FALSE
    GROUP BY
      pengguna.id_pengguna,
      pengguna.nip,
      pengguna.nama,
      roles.name,
      pengguna.fungsional,
      pangkat.nama_pangkat,
      golongan.nama_golongan
    ORDER BY pengguna.nama ASC, pengguna.id_pengguna ASC
  `,
    [idPeriodeSkp],
  );

  return result.rows.map(mapEmployeeRow);
};

export const createButirAssignment = async ({
  idPengguna,
  idButirKegiatan,
  idPeriodeSkp,
  uraian,
  deskripsi,
  targetKetercapaian,
}) => {
  const result = await pool.query(
    `
      INSERT INTO pengguna_kegiatan (
        id_pengguna,
        id_butir_kegiatan,
        id_periode_skp,
        uraian,
        deskripsi,
        target_ketercapaian,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'aktif')
      RETURNING
        id_pengguna_kegiatan,
        id_pengguna,
        id_butir_kegiatan,
        id_periode_skp,
        uraian,
        deskripsi,
        target_ketercapaian,
        status
    `,
    [idPengguna, idButirKegiatan, idPeriodeSkp, uraian, deskripsi, targetKetercapaian],
  );

  return mapButirAssignmentRow(result.rows[0]);
};

const butirAssignmentSelect = `
  SELECT
    pengguna_kegiatan.id_pengguna_kegiatan,
    pengguna_kegiatan.id_pengguna,
    pengguna_kegiatan.id_butir_kegiatan,
    pengguna_kegiatan.id_periode_skp,
    butir_kegiatan.nama_kegiatan,
    pengguna_kegiatan.uraian,
    pengguna_kegiatan.deskripsi,
    pengguna_kegiatan.target_ketercapaian,
    pengguna_kegiatan.status
  FROM pengguna_kegiatan
  INNER JOIN butir_kegiatan
    ON butir_kegiatan.id_butir_kegiatan = pengguna_kegiatan.id_butir_kegiatan
`;

export const findButirAssignmentsByEmployee = async (idPengguna) => {
  const result = await pool.query(
    `
      ${butirAssignmentSelect}
      WHERE pengguna_kegiatan.id_pengguna = $1
      ORDER BY pengguna_kegiatan.created_at DESC, pengguna_kegiatan.id_pengguna_kegiatan DESC
    `,
    [idPengguna],
  );

  return result.rows.map(mapButirAssignmentRow);
};

export const findCurrentYearButirAssignmentsByEmployee = async (idPengguna) => {
  const result = await pool.query(
    `
      SELECT
        pengguna_kegiatan.id_pengguna_kegiatan,
        pengguna_kegiatan.id_pengguna,
        pengguna_kegiatan.id_butir_kegiatan,
        pengguna_kegiatan.id_periode_skp,
        butir_kegiatan.nama_kegiatan,
        pengguna_kegiatan.uraian,
        pengguna_kegiatan.deskripsi,
        pengguna_kegiatan.target_ketercapaian,
        pengguna_kegiatan.status,
        periode_skp.tahun,
        ${formatDateColumn("periode_skp.tanggal_mulai")} AS tanggal_mulai,
        ${formatDateColumn("periode_skp.tanggal_selesai")} AS tanggal_selesai,
        COALESCE(
          SUM(
            CASE
              WHEN realisasi_kegiatan.realisasi_target ~ '^[0-9]+([.][0-9]+)?$'
                THEN realisasi_kegiatan.realisasi_target::numeric
              ELSE 0
            END
          ),
          0
        ) AS realisasi_total,
        COUNT(realisasi_kegiatan.id_realisasi_kegiatan) AS realisasi_count
      FROM pengguna_kegiatan
      INNER JOIN butir_kegiatan
        ON butir_kegiatan.id_butir_kegiatan = pengguna_kegiatan.id_butir_kegiatan
      INNER JOIN periode_skp
        ON periode_skp.id_periode_skp = pengguna_kegiatan.id_periode_skp
      LEFT JOIN realisasi_kegiatan
        ON realisasi_kegiatan.id_pengguna_kegiatan = pengguna_kegiatan.id_pengguna_kegiatan
      WHERE pengguna_kegiatan.id_pengguna = $1
        AND periode_skp.tahun = EXTRACT(YEAR FROM CURRENT_DATE)::integer
      GROUP BY
        pengguna_kegiatan.id_pengguna_kegiatan,
        butir_kegiatan.nama_kegiatan,
        periode_skp.tahun,
        periode_skp.tanggal_mulai,
        periode_skp.tanggal_selesai
      ORDER BY pengguna_kegiatan.created_at DESC, pengguna_kegiatan.id_pengguna_kegiatan DESC
    `,
    [idPengguna],
  );

  return result.rows.map(mapMyButirAssignmentRow);
};

export const findButirAssignmentById = async (id) => {
  const result = await pool.query(
    `
      ${butirAssignmentSelect}
      WHERE pengguna_kegiatan.id_pengguna_kegiatan = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ? mapButirAssignmentRow(result.rows[0]) : null;
};

export const updateButirAssignment = async ({ id, uraian, deskripsi, targetKetercapaian }) => {
  const result = await pool.query(
    `
      UPDATE pengguna_kegiatan
      SET
        uraian = $2,
        deskripsi = $3,
        target_ketercapaian = COALESCE($4, target_ketercapaian),
        updated_at = current_timestamp
      WHERE id_pengguna_kegiatan = $1
      RETURNING id_pengguna_kegiatan
    `,
    [id, uraian, deskripsi, targetKetercapaian],
  );

  if (!result.rows[0]) return null;
  return findButirAssignmentById(id);
};

export const updateOwnButirTarget = async ({
  id,
  idPengguna,
  targetKetercapaian,
  uraian,
  deskripsi,
}) => {
  const result = await pool.query(
    `
      UPDATE pengguna_kegiatan
      SET
        target_ketercapaian = $3,
        uraian = $4,
        deskripsi = $5,
        updated_at = current_timestamp
      WHERE id_pengguna_kegiatan = $1
        AND id_pengguna = $2
      RETURNING id_pengguna_kegiatan
    `,
    [id, idPengguna, targetKetercapaian, uraian, deskripsi],
  );

  if (!result.rows[0]) return null;

  const assignments = await findCurrentYearButirAssignmentsByEmployee(idPengguna);
  return assignments.find((assignment) => assignment.id === String(id)) ?? null;
};

export const deleteButirAssignment = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM pengguna_kegiatan
      WHERE id_pengguna_kegiatan = $1
      RETURNING id_pengguna_kegiatan
    `,
    [id],
  );

  return Boolean(result.rows[0]);
};

export const findMyRealisasiKegiatan = async (idPengguna) => {
  const result = await pool.query(
    `
      SELECT
        realisasi_kegiatan.id_realisasi_kegiatan,
        realisasi_kegiatan.id_pengguna_kegiatan,
        butir_kegiatan.nama_kegiatan,
        ${formatDateColumn("realisasi_kegiatan.tanggal_realisasi")} AS tanggal_realisasi,
        realisasi_kegiatan.realisasi_target,
        realisasi_kegiatan.keterangan
      FROM realisasi_kegiatan
      INNER JOIN pengguna_kegiatan
        ON pengguna_kegiatan.id_pengguna_kegiatan = realisasi_kegiatan.id_pengguna_kegiatan
      INNER JOIN butir_kegiatan
        ON butir_kegiatan.id_butir_kegiatan = pengguna_kegiatan.id_butir_kegiatan
      INNER JOIN periode_skp
        ON periode_skp.id_periode_skp = pengguna_kegiatan.id_periode_skp
      WHERE pengguna_kegiatan.id_pengguna = $1
        AND periode_skp.tahun = EXTRACT(YEAR FROM CURRENT_DATE)::integer
      ORDER BY realisasi_kegiatan.tanggal_realisasi DESC, realisasi_kegiatan.id_realisasi_kegiatan DESC
    `,
    [idPengguna],
  );

  return result.rows.map(mapRealisasiRow);
};

export const createMyRealisasiKegiatan = async ({
  idPengguna,
  idPenggunaKegiatan,
  tanggalRealisasi,
  realisasiTarget,
  keterangan,
}) => {
  const result = await pool.query(
    `
      INSERT INTO realisasi_kegiatan (
        id_pengguna_kegiatan,
        tanggal_realisasi,
        realisasi_target,
        keterangan
      )
      SELECT $2, $3, $4, $5
      FROM pengguna_kegiatan
      INNER JOIN periode_skp
        ON periode_skp.id_periode_skp = pengguna_kegiatan.id_periode_skp
      WHERE pengguna_kegiatan.id_pengguna_kegiatan = $2
        AND pengguna_kegiatan.id_pengguna = $1
        AND periode_skp.tahun = EXTRACT(YEAR FROM CURRENT_DATE)::integer
        AND pengguna_kegiatan.target_ketercapaian IS NOT NULL
        AND btrim(pengguna_kegiatan.target_ketercapaian) <> ''
      RETURNING id_realisasi_kegiatan
    `,
    [idPengguna, idPenggunaKegiatan, tanggalRealisasi, realisasiTarget, keterangan],
  );

  if (!result.rows[0]) return null;

  const items = await findMyRealisasiKegiatan(idPengguna);
  return items.find((item) => item.id === String(result.rows[0].id_realisasi_kegiatan)) ?? null;
};

export const findAdditionalAssignments = async () => {
  const relationTable = await getAdditionalAssignmentRelationTable();
  const result = await pool.query(`
    SELECT
      penugasan_tambahan.id_penugasan_tambahan,
      penugasan_tambahan.nama_kegiatan,
      penugasan_tambahan.deskripsi,
      penugasan_tambahan.status,
      ${formatDateColumn("penugasan_tambahan.tanggal_mulai")} AS tanggal_mulai,
      ${formatDateColumn("penugasan_tambahan.tanggal_selesai")} AS tanggal_selesai,
      penugasan_tambahan.surat_tugas,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pengguna.id_pengguna,
            'nama', pengguna.nama,
            'nip', pengguna.nip
          )
          ORDER BY pengguna.nama ASC
        ) FILTER (WHERE pengguna.id_pengguna IS NOT NULL),
        '[]'::json
      ) AS assigned_employees
    FROM penugasan_tambahan
    LEFT JOIN ${relationTable}
      ON ${relationTable}.id_penugasan_tambahan = penugasan_tambahan.id_penugasan_tambahan
    LEFT JOIN pengguna
      ON pengguna.id_pengguna = ${relationTable}.id_pengguna
    GROUP BY penugasan_tambahan.id_penugasan_tambahan
    ORDER BY penugasan_tambahan.created_at DESC, penugasan_tambahan.id_penugasan_tambahan DESC
  `);

  return result.rows.map(mapTambahanRow);
};

export const findAdditionalAssignmentsByEmployee = async (idPengguna) => {
  const relationTable = await getAdditionalAssignmentRelationTable();
  const result = await pool.query(
    `
      SELECT
        penugasan_tambahan.id_penugasan_tambahan,
        penugasan_tambahan.nama_kegiatan,
        penugasan_tambahan.deskripsi,
        penugasan_tambahan.status,
        ${formatDateColumn("penugasan_tambahan.tanggal_mulai")} AS tanggal_mulai,
        ${formatDateColumn("penugasan_tambahan.tanggal_selesai")} AS tanggal_selesai,
        penugasan_tambahan.surat_tugas,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pengguna.id_pengguna,
              'nama', pengguna.nama,
              'nip', pengguna.nip
            )
            ORDER BY pengguna.nama ASC
          ) FILTER (WHERE pengguna.id_pengguna IS NOT NULL),
          '[]'::json
        ) AS assigned_employees
      FROM penugasan_tambahan
      LEFT JOIN ${relationTable}
        ON ${relationTable}.id_penugasan_tambahan = penugasan_tambahan.id_penugasan_tambahan
      LEFT JOIN pengguna
        ON pengguna.id_pengguna = ${relationTable}.id_pengguna
      WHERE penugasan_tambahan.id_pengguna = $1
        OR EXISTS (
          SELECT 1
          FROM ${relationTable} ppt
          WHERE ppt.id_penugasan_tambahan = penugasan_tambahan.id_penugasan_tambahan
            AND ppt.id_pengguna = $1
        )
      GROUP BY penugasan_tambahan.id_penugasan_tambahan
      ORDER BY penugasan_tambahan.created_at DESC, penugasan_tambahan.id_penugasan_tambahan DESC
    `,
    [idPengguna],
  );

  return result.rows.map(mapTambahanRow);
};

export const findAdditionalAssignmentById = async (id) => {
  const relationTable = await getAdditionalAssignmentRelationTable();
  const result = await pool.query(
    `
      SELECT
        penugasan_tambahan.id_penugasan_tambahan,
        penugasan_tambahan.nama_kegiatan,
        penugasan_tambahan.deskripsi,
        penugasan_tambahan.status,
        ${formatDateColumn("penugasan_tambahan.tanggal_mulai")} AS tanggal_mulai,
        ${formatDateColumn("penugasan_tambahan.tanggal_selesai")} AS tanggal_selesai,
        penugasan_tambahan.surat_tugas,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pengguna.id_pengguna,
              'nama', pengguna.nama,
              'nip', pengguna.nip
            )
            ORDER BY pengguna.nama ASC
          ) FILTER (WHERE pengguna.id_pengguna IS NOT NULL),
          '[]'::json
        ) AS assigned_employees
      FROM penugasan_tambahan
      LEFT JOIN ${relationTable}
        ON ${relationTable}.id_penugasan_tambahan = penugasan_tambahan.id_penugasan_tambahan
      LEFT JOIN pengguna
        ON pengguna.id_pengguna = ${relationTable}.id_pengguna
      WHERE penugasan_tambahan.id_penugasan_tambahan = $1
      GROUP BY penugasan_tambahan.id_penugasan_tambahan
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ? mapTambahanRow(result.rows[0]) : null;
};

export const createAdditionalAssignment = async ({
  assignedEmployeeIds,
  namaKegiatan,
  deskripsi,
  tanggalMulai,
  tanggalSelesai,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const relationTable = await getAdditionalAssignmentRelationTable(client);

    const result = await client.query(
      `
        INSERT INTO penugasan_tambahan (
          id_pengguna,
          nama_kegiatan,
          status,
          deskripsi,
          tanggal_mulai,
          tanggal_selesai,
          surat_tugas
        )
        VALUES ($1, $2, 'aktif', $3, $4, $5, NULL)
        RETURNING id_penugasan_tambahan
      `,
      [assignedEmployeeIds[0], namaKegiatan, deskripsi, tanggalMulai, tanggalSelesai],
    );

    const idPenugasanTambahan = result.rows[0].id_penugasan_tambahan;

    for (const idPengguna of assignedEmployeeIds) {
      await client.query(
        `
          INSERT INTO ${relationTable} (id_penugasan_tambahan, id_pengguna)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `,
        [idPenugasanTambahan, idPengguna],
      );
    }

    await client.query("COMMIT");
    const assignments = await findAdditionalAssignments();
    return assignments.find((assignment) => assignment.id === String(idPenugasanTambahan));
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const updateAdditionalAssignment = async ({
  id,
  assignedEmployeeIds,
  namaKegiatan,
  deskripsi,
  tanggalMulai,
  tanggalSelesai,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const relationTable = await getAdditionalAssignmentRelationTable(client);

    const result = await client.query(
      `
        UPDATE penugasan_tambahan
        SET
          id_pengguna = $2,
          nama_kegiatan = $3,
          deskripsi = $4,
          tanggal_mulai = $5,
          tanggal_selesai = $6,
          updated_at = current_timestamp
        WHERE id_penugasan_tambahan = $1
        RETURNING id_penugasan_tambahan
      `,
      [id, assignedEmployeeIds[0], namaKegiatan, deskripsi, tanggalMulai, tanggalSelesai],
    );

    if (!result.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        DELETE FROM ${relationTable}
        WHERE id_penugasan_tambahan = $1
      `,
      [id],
    );

    for (const idPengguna of assignedEmployeeIds) {
      await client.query(
        `
          INSERT INTO ${relationTable} (id_penugasan_tambahan, id_pengguna)
          VALUES ($1, $2)
        `,
        [id, idPengguna],
      );
    }

    await client.query("COMMIT");
    return findAdditionalAssignmentById(id);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
