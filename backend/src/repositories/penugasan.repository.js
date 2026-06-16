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
  statusPengajuan: row.status_pengajuan ?? "diajukan",
  approvalStatus:
    row.status_pengajuan === "diterima" || row.status_pengajuan === "diubah"
      ? "approved"
      : "pending",
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
  status: row.status ?? "diajukan",
});

const mapApprovalEmployeeRow = (row) => ({
  id: String(row.id_pengguna),
  nip: row.nip ?? "",
  nama: row.nama ?? "",
  fungsional: row.fungsional ?? "-",
  pangkat: row.pangkat ?? "-",
  golongan: row.golongan ?? "-",
  pendingCount: Number(row.pending_count ?? 0),
  pendingRealisasiTotal: Number(row.pending_realisasi_total ?? 0),
  lastTanggalRealisasi: row.last_tanggal_realisasi ?? "",
});

const mapApprovalRealisasiRow = (row) => ({
  id: String(row.id_realisasi_kegiatan),
  idPenggunaKegiatan: String(row.id_pengguna_kegiatan),
  namaKegiatan: row.nama_kegiatan ?? "",
  uraian: row.uraian ?? "",
  deskripsi: row.deskripsi ?? "",
  tanggalRealisasi: row.tanggal_realisasi ?? "",
  realisasiTarget: row.realisasi_target ?? "",
  keterangan: row.keterangan ?? "",
  targetKetercapaian: row.target_ketercapaian ?? "",
  status: row.status ?? "diajukan",
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

const mapPimpinanKegiatanRow = (row) => {
  const targetTotal = Number(row.target_total ?? 0);
  const approvedTotal = Number(row.approved_total ?? 0);
  const assignedEmployees = Array.isArray(row.assigned_employees)
    ? row.assigned_employees.filter((employee) => employee?.id)
    : [];

  return {
    id: String(row.id_butir_kegiatan),
    name: row.nama_kegiatan ?? "",
    objectives: row.objectives ?? "",
    tanggalMulai: row.tanggal_mulai ?? "",
    deadline: row.tanggal_selesai ?? "",
    progress: targetTotal > 0 ? Math.min(100, Math.round((approvedTotal / targetTotal) * 100)) : 0,
    approvedTotal,
    targetTotal,
    assignedTeam: assignedEmployees.map((employee) => {
      const employeeTarget = Number(employee.targetTotal ?? 0);
      const employeeApproved = Number(employee.approvedTotal ?? 0);

      return {
        id: String(employee.id),
        nama: employee.nama ?? "",
        nip: employee.nip ?? "",
        targetTotal: employeeTarget,
        approvedTotal: employeeApproved,
        progress: employeeTarget > 0 ? Math.min(100, Math.round((employeeApproved / employeeTarget) * 100)) : 0,
      };
    }),
    documents: [],
  };
};

const formatDashboardDelta = (current, previous) => {
  const delta = Number(current ?? 0) - Number(previous ?? 0);
  return {
    change: `${delta >= 0 ? "+" : ""}${delta} dari bulan lalu`,
    trend: delta >= 0 ? "up" : "down",
  };
};

const getInitials = (name) => {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "-";
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
};

const mapDashboardKegiatanRow = (row) => {
  const tujuanSKP = Math.round(Number(row.target_total ?? 0) * 100) / 100;
  const skpSelesai = Math.round(Number(row.approved_total ?? 0) * 100) / 100;
  const pegawai = Array.isArray(row.pegawai) ? row.pegawai.filter((item) => item?.nama) : [];

  return {
    id: Number(row.id_butir_kegiatan),
    namaKegiatan: row.nama_kegiatan ?? "",
    unitKerja: row.unit_kerja ?? "-",
    tujuanSKP,
    skpSelesai,
    jumlahPegawai: Number(row.jumlah_pegawai ?? 0),
    pegawai: pegawai.map((item) => ({
      nama: item.nama ?? "",
      inisial: getInitials(item.nama),
      skpSelesai: Math.round(Number(item.skpSelesai ?? 0) * 100) / 100,
      skpTarget: Math.round(Number(item.skpTarget ?? 0) * 100) / 100,
    })),
  };
};

const mapDashboardProfileRow = (row) => ({
  tmtKgb: row.tmt_kgb ?? "",
  tmtPensiun: row.tmt_pensiun ?? "",
  targetKetercapaian: row.target_ketercapaian ?? "",
});

const toNumeric = (value) => {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
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
        status,
        status_pengajuan
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'aktif', 'diajukan')
      RETURNING
        id_pengguna_kegiatan,
        id_pengguna,
        id_butir_kegiatan,
        id_periode_skp,
        uraian,
        deskripsi,
        target_ketercapaian,
        status,
        status_pengajuan
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
    pengguna_kegiatan.status,
    pengguna_kegiatan.status_pengajuan
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

export const findPimpinanKegiatanDashboard = async ({ tahun = null, bulan = null } = {}) => {
  const [yearsResult, kegiatanResult] = await Promise.all([
    pool.query(`
      SELECT DISTINCT periode_skp.tahun
      FROM pengguna_kegiatan
      INNER JOIN periode_skp
        ON periode_skp.id_periode_skp = pengguna_kegiatan.id_periode_skp
      WHERE pengguna_kegiatan.status <> 'batal'
      ORDER BY periode_skp.tahun DESC
    `),
    pool.query(
      `
        WITH assignment_metrics AS (
          SELECT
            pengguna_kegiatan.id_pengguna_kegiatan,
            butir_kegiatan.id_butir_kegiatan,
            butir_kegiatan.nama_kegiatan,
            pengguna.id_pengguna,
            pengguna.nama,
            pengguna.nip,
            pengguna_kegiatan.uraian,
            pengguna_kegiatan.deskripsi,
            ${formatDateColumn("MIN(periode_skp.tanggal_mulai)")} AS tanggal_mulai,
            ${formatDateColumn("MAX(periode_skp.tanggal_selesai)")} AS tanggal_selesai,
            CASE
              WHEN pengguna_kegiatan.target_ketercapaian ~ '^[0-9]+([.][0-9]+)?$'
                THEN pengguna_kegiatan.target_ketercapaian::numeric
              ELSE 0
            END AS target_total,
            COALESCE(realisasi.approved_total, 0) AS approved_total
          FROM pengguna_kegiatan
          INNER JOIN butir_kegiatan
            ON butir_kegiatan.id_butir_kegiatan = pengguna_kegiatan.id_butir_kegiatan
          INNER JOIN pengguna
            ON pengguna.id_pengguna = pengguna_kegiatan.id_pengguna
          INNER JOIN periode_skp
            ON periode_skp.id_periode_skp = pengguna_kegiatan.id_periode_skp
          LEFT JOIN LATERAL (
            SELECT
              SUM(
                CASE
                  WHEN realisasi_kegiatan.realisasi_target ~ '^[0-9]+([.][0-9]+)?$'
                    THEN realisasi_kegiatan.realisasi_target::numeric
                  ELSE 0
                END
              ) AS approved_total
            FROM realisasi_kegiatan
            WHERE realisasi_kegiatan.id_pengguna_kegiatan = pengguna_kegiatan.id_pengguna_kegiatan
              AND realisasi_kegiatan.status = 'disetujui'
              AND ($2::integer IS NULL OR EXTRACT(YEAR FROM realisasi_kegiatan.tanggal_realisasi)::integer = $2::integer)
              AND ($3::integer IS NULL OR EXTRACT(MONTH FROM realisasi_kegiatan.tanggal_realisasi)::integer = $3::integer)
          ) realisasi ON TRUE
          WHERE pengguna_kegiatan.status <> 'batal'
            AND pengguna.status_aktif IS DISTINCT FROM FALSE
            AND ($1::integer IS NULL OR periode_skp.tahun = $1::integer)
          GROUP BY
            pengguna_kegiatan.id_pengguna_kegiatan,
            butir_kegiatan.id_butir_kegiatan,
            pengguna.id_pengguna,
            realisasi.approved_total
        ),
        employee_metrics AS (
          SELECT
            id_butir_kegiatan,
            nama_kegiatan,
            id_pengguna,
            nama,
            nip,
            MIN(tanggal_mulai) AS tanggal_mulai,
            MAX(tanggal_selesai) AS tanggal_selesai,
            SUM(target_total) AS target_total,
            SUM(approved_total) AS approved_total,
            string_agg(DISTINCT NULLIF(uraian, ''), ' | ') AS uraian,
            string_agg(DISTINCT NULLIF(deskripsi, ''), ' | ') AS deskripsi
          FROM assignment_metrics
          GROUP BY
            id_butir_kegiatan,
            nama_kegiatan,
            id_pengguna,
            nama,
            nip
        )
        SELECT
          id_butir_kegiatan,
          nama_kegiatan,
          MIN(tanggal_mulai) AS tanggal_mulai,
          MAX(tanggal_selesai) AS tanggal_selesai,
          SUM(target_total) AS target_total,
          SUM(approved_total) AS approved_total,
          COALESCE(
            string_agg(DISTINCT NULLIF(uraian, ''), ' | '),
            string_agg(DISTINCT NULLIF(deskripsi, ''), ' | '),
            ''
          ) AS objectives,
          json_agg(
            json_build_object(
              'id', id_pengguna,
              'nama', nama,
              'nip', nip,
              'targetTotal', target_total,
              'approvedTotal', approved_total
            )
            ORDER BY nama ASC, id_pengguna ASC
          ) AS assigned_employees
        FROM employee_metrics
        GROUP BY
          id_butir_kegiatan,
          nama_kegiatan
        ORDER BY nama_kegiatan ASC, id_butir_kegiatan ASC
      `,
      [tahun, tahun, bulan],
    ),
  ]);

  return {
    years: yearsResult.rows.map((row) => Number(row.tahun)).filter((year) => Number.isInteger(year)),
    items: kegiatanResult.rows.map(mapPimpinanKegiatanRow),
  };
};

export const findMainDashboardSummary = async ({ idPeriodeSkp = null } = {}) => {
  const [
    totalPegawaiResult,
    pensionResult,
    kgbResult,
    kegiatanCountResult,
    kegiatanResult,
  ] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status_aktif IS DISTINCT FROM FALSE) AS current_value,
        COUNT(*) FILTER (
          WHERE status_aktif IS DISTINCT FROM FALSE
            AND created_at < date_trunc('month', current_date)
        ) AS previous_value
      FROM pengguna
    `),
    pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE status_aktif IS DISTINCT FROM FALSE
            AND tmt_pensiun IS NOT NULL
            AND tmt_pensiun::date BETWEEN current_date AND current_date + INTERVAL '5 years'
        ) AS current_value,
        COUNT(*) FILTER (
          WHERE status_aktif IS DISTINCT FROM FALSE
            AND tmt_pensiun IS NOT NULL
            AND tmt_pensiun::date BETWEEN current_date - INTERVAL '1 month'
              AND current_date - INTERVAL '1 month' + INTERVAL '5 years'
        ) AS previous_value
      FROM pengguna
    `),
    pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE status_aktif IS DISTINCT FROM FALSE
            AND tmt_kgb IS NOT NULL
            AND tmt_kgb::date BETWEEN current_date AND current_date + INTERVAL '90 days'
        ) AS current_value,
        COUNT(*) FILTER (
          WHERE status_aktif IS DISTINCT FROM FALSE
            AND tmt_kgb IS NOT NULL
            AND tmt_kgb::date BETWEEN current_date - INTERVAL '1 month'
              AND current_date - INTERVAL '1 month' + INTERVAL '90 days'
        ) AS previous_value
      FROM pengguna
    `),
    pool.query(
      `
        SELECT
          COUNT(DISTINCT pengguna_kegiatan.id_butir_kegiatan) AS current_value,
          COUNT(DISTINCT pengguna_kegiatan.id_butir_kegiatan) FILTER (
            WHERE pengguna_kegiatan.created_at < date_trunc('month', current_date)
          ) AS previous_value
        FROM pengguna_kegiatan
        WHERE pengguna_kegiatan.status <> 'batal'
          AND ($1::integer IS NULL OR pengguna_kegiatan.id_periode_skp = $1::integer)
      `,
      [idPeriodeSkp],
    ),
    pool.query(
      `
        WITH assignment_metrics AS (
          SELECT
            pengguna_kegiatan.id_pengguna_kegiatan,
            butir_kegiatan.id_butir_kegiatan,
            butir_kegiatan.nama_kegiatan,
            pengguna.id_pengguna,
            pengguna.nama,
            COALESCE(penempatan.nama_penempatan, '-') AS unit_kerja,
            CASE
              WHEN pengguna_kegiatan.target_ketercapaian ~ '^[0-9]+([.][0-9]+)?$'
                THEN pengguna_kegiatan.target_ketercapaian::numeric
              ELSE 0
            END AS target_total,
            COALESCE(realisasi.approved_total, 0) AS approved_total
          FROM pengguna_kegiatan
          INNER JOIN butir_kegiatan
            ON butir_kegiatan.id_butir_kegiatan = pengguna_kegiatan.id_butir_kegiatan
          INNER JOIN pengguna
            ON pengguna.id_pengguna = pengguna_kegiatan.id_pengguna
          LEFT JOIN penempatan
            ON penempatan.id_penempatan = pengguna.id_penempatan
          LEFT JOIN LATERAL (
            SELECT
              SUM(
                CASE
                  WHEN realisasi_kegiatan.realisasi_target ~ '^[0-9]+([.][0-9]+)?$'
                    THEN realisasi_kegiatan.realisasi_target::numeric
                  ELSE 0
                END
              ) AS approved_total
            FROM realisasi_kegiatan
            WHERE realisasi_kegiatan.id_pengguna_kegiatan = pengguna_kegiatan.id_pengguna_kegiatan
              AND realisasi_kegiatan.status = 'disetujui'
          ) realisasi ON TRUE
          WHERE pengguna_kegiatan.status <> 'batal'
            AND pengguna.status_aktif IS DISTINCT FROM FALSE
            AND ($1::integer IS NULL OR pengguna_kegiatan.id_periode_skp = $1::integer)
        ),
        employee_metrics AS (
          SELECT
            id_butir_kegiatan,
            nama_kegiatan,
            id_pengguna,
            nama,
            MIN(unit_kerja) AS unit_kerja,
            SUM(target_total) AS target_total,
            SUM(approved_total) AS approved_total
          FROM assignment_metrics
          GROUP BY
            id_butir_kegiatan,
            nama_kegiatan,
            id_pengguna,
            nama
        ),
        kegiatan_metrics AS (
          SELECT
            id_butir_kegiatan,
            nama_kegiatan,
            MIN(unit_kerja) AS unit_kerja,
            SUM(target_total) AS target_total,
            SUM(approved_total) AS approved_total,
            COUNT(*) AS jumlah_pegawai,
            json_agg(
              json_build_object(
                'nama', nama,
                'skpSelesai', approved_total,
                'skpTarget', target_total
              )
              ORDER BY nama ASC, id_pengguna ASC
            ) AS pegawai
          FROM employee_metrics
          GROUP BY
            id_butir_kegiatan,
            nama_kegiatan
        )
        SELECT *
        FROM kegiatan_metrics
        ORDER BY
          CASE WHEN target_total > 0 THEN approved_total / target_total ELSE 0 END ASC,
          nama_kegiatan ASC
        LIMIT 4
      `,
      [idPeriodeSkp],
    ),
  ]);

  const buildKpi = (label, value, previousValue, color) => {
    const delta = formatDashboardDelta(value, previousValue);
    return {
      label,
      value: String(Number(value ?? 0)),
      change: delta.change,
      trend: delta.trend,
      color,
    };
  };

  const totalPegawai = totalPegawaiResult.rows[0] ?? {};
  const pension = pensionResult.rows[0] ?? {};
  const kgb = kgbResult.rows[0] ?? {};
  const kegiatanCount = kegiatanCountResult.rows[0] ?? {};

  return {
    kpis: [
      buildKpi("Total Pegawai Aktif", totalPegawai.current_value, totalPegawai.previous_value, "blue"),
      buildKpi("Mendekati Pensiun", pension.current_value, pension.previous_value, "amber"),
      buildKpi("Mendekati KGB", kgb.current_value, kgb.previous_value, "purple"),
      buildKpi("Jumlah Kegiatan", kegiatanCount.current_value, kegiatanCount.previous_value, "purple"),
    ],
    kegiatan: kegiatanResult.rows.map(mapDashboardKegiatanRow),
  };
};

export const findCurrentYearButirAssignmentsByEmployee = async (idPengguna, filters = {}) => {
  const { idPeriodeSkp = null, tahun = null } = typeof filters === "object" && filters !== null ? filters : { tahun: filters };

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
        pengguna_kegiatan.status_pengajuan,
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
        AND (
          ($2::integer IS NOT NULL AND pengguna_kegiatan.id_periode_skp = $2::integer)
          OR ($2::integer IS NULL AND periode_skp.tahun = COALESCE($3::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer))
        )
      GROUP BY
        pengguna_kegiatan.id_pengguna_kegiatan,
        butir_kegiatan.nama_kegiatan,
        periode_skp.tahun,
        periode_skp.tanggal_mulai,
        periode_skp.tanggal_selesai
      ORDER BY pengguna_kegiatan.created_at DESC, pengguna_kegiatan.id_pengguna_kegiatan DESC
    `,
    [idPengguna, idPeriodeSkp, tahun],
  );

  return result.rows.map(mapMyButirAssignmentRow);
};

const findDashboardProfileByEmployee = async (idPengguna) => {
  const result = await pool.query(
    `
      SELECT
        ${formatDateColumn("tmt_kgb")} AS tmt_kgb,
        ${formatDateColumn("tmt_pensiun")} AS tmt_pensiun,
        target_ketercapaian
      FROM pengguna
      WHERE id_pengguna = $1
      LIMIT 1
    `,
    [idPengguna],
  );

  return result.rows[0] ? mapDashboardProfileRow(result.rows[0]) : null;
};

export const findMyDashboardSummary = async (idPengguna, filters = {}) => {
  const [kinerja, penugasanTambahan, profile] = await Promise.all([
    findCurrentYearButirAssignmentsByEmployee(idPengguna, filters),
    findAdditionalAssignmentsByEmployee(idPengguna),
    findDashboardProfileByEmployee(idPengguna),
  ]);

  const realisasiTotal = kinerja.reduce((total, item) => total + toNumeric(item.realisasiTotal), 0);
  const targetKetercapaian = toNumeric(profile?.targetKetercapaian);
  const achievementPercentage =
    targetKetercapaian > 0 ? Math.round((realisasiTotal / targetKetercapaian) * 1000) / 10 : null;

  return {
    summary: {
      achievementPercentage,
      realisasiTotal,
      targetKetercapaian,
      totalKegiatan: kinerja.length,
    },
    timeline: {
      tmtKgb: profile?.tmtKgb ?? "",
      tmtPensiun: profile?.tmtPensiun ?? "",
    },
    kinerja: kinerja.slice(0, 4),
    penugasanTambahan: penugasanTambahan.slice(0, 4),
  };
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
        status_pengajuan = CASE
          WHEN $4 IS NOT NULL
            AND COALESCE(target_ketercapaian, '') IS DISTINCT FROM $4
            AND status_pengajuan = 'diterima'
            THEN 'diubah'
          ELSE status_pengajuan
        END,
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
        status_pengajuan = 'diajukan',
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

export const submitButirAssignmentForApproval = async ({ id, idPengguna }) => {
  const result = await pool.query(
    `
      UPDATE pengguna_kegiatan
      SET
        status_pengajuan = 'diajukan',
        updated_at = current_timestamp
      WHERE id_pengguna_kegiatan = $1
        AND id_pengguna = $2
        AND target_ketercapaian IS NOT NULL
        AND btrim(target_ketercapaian) <> ''
      RETURNING id_pengguna_kegiatan
    `,
    [id, idPengguna],
  );

  if (!result.rows[0]) return null;

  const assignments = await findCurrentYearButirAssignmentsByEmployee(idPengguna);
  return assignments.find((assignment) => assignment.id === String(id)) ?? null;
};

export const approveButirAssignmentTarget = async (id) => {
  const result = await pool.query(
    `
      UPDATE pengguna_kegiatan
      SET
        status_pengajuan = 'diterima',
        updated_at = current_timestamp
      WHERE id_pengguna_kegiatan = $1
        AND status_pengajuan = 'diajukan'
      RETURNING id_pengguna_kegiatan
    `,
    [id],
  );

  if (!result.rows[0]) return null;
  return findButirAssignmentById(id);
};

export const findPendingApprovalKegiatan = async () => {
  const result = await pool.query(
    `
      SELECT
        pengguna.id_pengguna,
        pengguna.nama,
        pengguna.nip,
        pengguna_kegiatan.id_pengguna_kegiatan,
        pengguna_kegiatan.id_butir_kegiatan,
        pengguna_kegiatan.id_periode_skp,
        butir_kegiatan.nama_kegiatan,
        pengguna_kegiatan.uraian,
        pengguna_kegiatan.deskripsi,
        pengguna_kegiatan.target_ketercapaian,
        pengguna_kegiatan.status,
        pengguna_kegiatan.status_pengajuan
      FROM pengguna_kegiatan
      INNER JOIN pengguna
        ON pengguna.id_pengguna = pengguna_kegiatan.id_pengguna
      INNER JOIN butir_kegiatan
        ON butir_kegiatan.id_butir_kegiatan = pengguna_kegiatan.id_butir_kegiatan
      LEFT JOIN roles
        ON roles.role_id = pengguna.role_id
      WHERE pengguna_kegiatan.status_pengajuan = 'diajukan'
        AND pengguna_kegiatan.status <> 'batal'
        AND pengguna_kegiatan.target_ketercapaian IS NOT NULL
        AND btrim(pengguna_kegiatan.target_ketercapaian) <> ''
        AND pengguna.status_aktif IS DISTINCT FROM FALSE
        AND LOWER(COALESCE(roles.name, '')) = 'pegawai'
      ORDER BY pengguna.nama ASC, pengguna.id_pengguna ASC, pengguna_kegiatan.updated_at DESC
    `,
  );

  const grouped = new Map();

  for (const row of result.rows) {
    const id = String(row.id_pengguna);
    if (!grouped.has(id)) {
      grouped.set(id, {
        idPengguna: id,
        nama: row.nama ?? "",
        nip: row.nip ?? "",
        pendingCount: 0,
        kegiatan: [],
      });
    }

    const employee = grouped.get(id);
    employee.pendingCount += 1;
    employee.kegiatan.push(mapButirAssignmentRow(row));
  }

  return Array.from(grouped.values());
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
        realisasi_kegiatan.keterangan,
        realisasi_kegiatan.status
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
        keterangan,
        status
      )
      SELECT $2, $3, $4, $5, 'diajukan'
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

export const findApprovalRealisasiEmployees = async ({ idPeriodeSkp = null, tahun = null } = {}) => {
  const result = await pool.query(
    `
      SELECT
        pengguna.id_pengguna,
        pengguna.nip,
        pengguna.nama,
        pengguna.fungsional,
        pangkat.nama_pangkat AS pangkat,
        golongan.nama_golongan AS golongan,
        COUNT(realisasi_kegiatan.id_realisasi_kegiatan) AS pending_count,
        COALESCE(
          SUM(
            CASE
              WHEN realisasi_kegiatan.realisasi_target ~ '^[0-9]+([.][0-9]+)?$'
                THEN realisasi_kegiatan.realisasi_target::numeric
              ELSE 0
            END
          ),
          0
        ) AS pending_realisasi_total,
        ${formatDateColumn("MAX(realisasi_kegiatan.tanggal_realisasi)")} AS last_tanggal_realisasi
      FROM realisasi_kegiatan
      INNER JOIN pengguna_kegiatan
        ON pengguna_kegiatan.id_pengguna_kegiatan = realisasi_kegiatan.id_pengguna_kegiatan
      INNER JOIN pengguna
        ON pengguna.id_pengguna = pengguna_kegiatan.id_pengguna
      INNER JOIN periode_skp
        ON periode_skp.id_periode_skp = pengguna_kegiatan.id_periode_skp
      LEFT JOIN pangkat
        ON pangkat.id_pangkat = pengguna.id_pangkat
      LEFT JOIN golongan
        ON golongan.id_golongan = pengguna.id_golongan
      LEFT JOIN roles
        ON roles.role_id = pengguna.role_id
      WHERE realisasi_kegiatan.status = 'diajukan'
        AND pengguna.status_aktif IS DISTINCT FROM FALSE
        AND LOWER(COALESCE(roles.name, '')) = 'pegawai'
        AND (
          ($1::integer IS NOT NULL AND pengguna_kegiatan.id_periode_skp = $1::integer)
          OR ($1::integer IS NULL AND periode_skp.tahun = COALESCE($2::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer))
        )
      GROUP BY
        pengguna.id_pengguna,
        pangkat.nama_pangkat,
        golongan.nama_golongan
      ORDER BY MAX(realisasi_kegiatan.tanggal_realisasi) DESC, pengguna.nama ASC
    `,
    [idPeriodeSkp, tahun],
  );

  return result.rows.map(mapApprovalEmployeeRow);
};

export const findApprovalRealisasiByEmployee = async (idPengguna, { idPeriodeSkp = null, tahun = null } = {}) => {
  const result = await pool.query(
    `
      SELECT
        realisasi_kegiatan.id_realisasi_kegiatan,
        realisasi_kegiatan.id_pengguna_kegiatan,
        butir_kegiatan.nama_kegiatan,
        pengguna_kegiatan.uraian,
        pengguna_kegiatan.deskripsi,
        ${formatDateColumn("realisasi_kegiatan.tanggal_realisasi")} AS tanggal_realisasi,
        realisasi_kegiatan.realisasi_target,
        realisasi_kegiatan.keterangan,
        pengguna_kegiatan.target_ketercapaian,
        realisasi_kegiatan.status
      FROM realisasi_kegiatan
      INNER JOIN pengguna_kegiatan
        ON pengguna_kegiatan.id_pengguna_kegiatan = realisasi_kegiatan.id_pengguna_kegiatan
      INNER JOIN butir_kegiatan
        ON butir_kegiatan.id_butir_kegiatan = pengguna_kegiatan.id_butir_kegiatan
      INNER JOIN periode_skp
        ON periode_skp.id_periode_skp = pengguna_kegiatan.id_periode_skp
      WHERE pengguna_kegiatan.id_pengguna = $1
        AND realisasi_kegiatan.status IN ('diajukan', 'disetujui')
        AND (
          ($2::integer IS NOT NULL AND pengguna_kegiatan.id_periode_skp = $2::integer)
          OR ($2::integer IS NULL AND periode_skp.tahun = COALESCE($3::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer))
        )
      ORDER BY realisasi_kegiatan.tanggal_realisasi DESC, realisasi_kegiatan.id_realisasi_kegiatan DESC
    `,
    [idPengguna, idPeriodeSkp, tahun],
  );

  return result.rows.map(mapApprovalRealisasiRow);
};

export const approveRealisasiKegiatan = async (ids) => {
  const result = await pool.query(
    `
      UPDATE realisasi_kegiatan
      SET
        status = 'disetujui',
        updated_at = current_timestamp
      WHERE id_realisasi_kegiatan = ANY($1::integer[])
        AND status = 'diajukan'
      RETURNING id_realisasi_kegiatan
    `,
    [ids],
  );

  return {
    approvedCount: result.rowCount,
    approvedIds: result.rows.map((row) => String(row.id_realisasi_kegiatan)),
  };
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
