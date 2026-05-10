import pool from "../config/db.js";

const formatDateColumn = (column) => `to_char(${column}, 'YYYY-MM-DD HH24:MI:SS')`;

const mapAuditLogRow = (row) => ({
  id: String(row.id_audit_log),
  timestamp: row.created_at ?? "",
  userId: row.id_pengguna ? String(row.id_pengguna) : "",
  user: row.user_name ?? "Tidak Dikenal",
  role: row.user_role ?? "-",
  type: row.activity_type,
  action: row.action,
  resource: row.resource ?? "",
  resourceId: row.resource_id ?? "",
  description: row.description,
  status: row.status,
  ipAddress: row.ip_address ?? "",
  userAgent: row.user_agent ?? "",
  metadata: row.metadata ?? {},
});

const mapBackupLogRow = (row) => ({
  id: String(row.id_backup_log),
  date: row.created_at ?? "",
  userId: row.id_pengguna ? String(row.id_pengguna) : "",
  user: row.user_name ?? "Tidak Dikenal",
  action: row.action,
  fileName: row.file_name ?? "",
  sizeBytes: Number(row.file_size ?? 0),
  status: row.status,
  errorMessage: row.error_message ?? "",
});

export const createAuditLog = async ({
  idPengguna = null,
  userName = null,
  userRole = null,
  activityType,
  action,
  resource = null,
  resourceId = null,
  description,
  status,
  ipAddress = null,
  userAgent = null,
  metadata = {},
}) => {
  const result = await pool.query(
    `
      INSERT INTO audit_logs (
        id_pengguna,
        user_name,
        user_role,
        activity_type,
        action,
        resource,
        resource_id,
        description,
        status,
        ip_address,
        user_agent,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
      RETURNING
        id_audit_log,
        ${formatDateColumn("created_at")} AS created_at,
        id_pengguna,
        user_name,
        user_role,
        activity_type,
        action,
        resource,
        resource_id,
        description,
        status,
        ip_address,
        user_agent,
        metadata
    `,
    [
      idPengguna,
      userName,
      userRole,
      activityType,
      action,
      resource,
      resourceId,
      description,
      status,
      ipAddress,
      userAgent,
      JSON.stringify(metadata ?? {}),
    ],
  );

  return mapAuditLogRow(result.rows[0]);
};

export const findAuditLogs = async ({
  search = "",
  type = "",
  status = "",
  dateFrom = "",
  dateTo = "",
  page = 1,
  pageSize = 10,
} = {}) => {
  const filters = [];
  const values = [];

  const addValue = (value) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (search) {
    const param = addValue(`%${search.toLowerCase()}%`);
    filters.push(`(
      lower(coalesce(user_name, '')) LIKE ${param}
      OR lower(coalesce(user_role, '')) LIKE ${param}
      OR lower(coalesce(activity_type, '')) LIKE ${param}
      OR lower(coalesce(action, '')) LIKE ${param}
      OR lower(coalesce(resource, '')) LIKE ${param}
      OR lower(coalesce(description, '')) LIKE ${param}
      OR lower(coalesce(status, '')) LIKE ${param}
    )`);
  }

  if (type) filters.push(`activity_type = ${addValue(type)}`);
  if (status) filters.push(`status = ${addValue(status)}`);
  if (dateFrom) filters.push(`created_at::date >= ${addValue(dateFrom)}::date`);
  if (dateTo) filters.push(`created_at::date <= ${addValue(dateTo)}::date`);

  const whereSql = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const limit = addValue(pageSize);
  const offset = addValue((page - 1) * pageSize);

  const [countResult, dataResult] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM audit_logs ${whereSql}`, values.slice(0, values.length - 2)),
    pool.query(
      `
        SELECT
          id_audit_log,
          ${formatDateColumn("created_at")} AS created_at,
          id_pengguna,
          user_name,
          user_role,
          activity_type,
          action,
          resource,
          resource_id,
          description,
          status,
          ip_address,
          user_agent,
          metadata
        FROM audit_logs
        ${whereSql}
        ORDER BY created_at DESC, id_audit_log DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      values,
    ),
  ]);

  const total = Number(countResult.rows[0]?.total ?? 0);
  return {
    items: dataResult.rows.map(mapAuditLogRow),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
};

export const createBackupLog = async ({
  idPengguna = null,
  userName = null,
  action,
  fileName = null,
  fileSize = 0,
  status,
  errorMessage = null,
}) => {
  const result = await pool.query(
    `
      INSERT INTO backup_logs (
        id_pengguna,
        user_name,
        action,
        file_name,
        file_size,
        status,
        error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id_backup_log,
        ${formatDateColumn("created_at")} AS created_at,
        id_pengguna,
        user_name,
        action,
        file_name,
        file_size,
        status,
        error_message
    `,
    [idPengguna, userName, action, fileName, fileSize, status, errorMessage],
  );

  return mapBackupLogRow(result.rows[0]);
};

export const findBackupLogs = async ({ page = 1, pageSize = 10 } = {}) => {
  const [countResult, dataResult] = await Promise.all([
    pool.query("SELECT COUNT(*) AS total FROM backup_logs"),
    pool.query(
      `
        SELECT
          id_backup_log,
          ${formatDateColumn("created_at")} AS created_at,
          id_pengguna,
          user_name,
          action,
          file_name,
          file_size,
          status,
          error_message
        FROM backup_logs
        ORDER BY created_at DESC, id_backup_log DESC
        LIMIT $1 OFFSET $2
      `,
      [pageSize, (page - 1) * pageSize],
    ),
  ]);

  const total = Number(countResult.rows[0]?.total ?? 0);
  return {
    items: dataResult.rows.map(mapBackupLogRow),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
};
