import pool from "../config/db.js";

export const createDocumentMetadata = async (
  {
    storageKey,
    originalFilename,
    mimeType,
    fileSize,
    checksumSha256,
    kategori,
    uploadedBy,
  },
  queryable = pool,
) => {
  const result = await queryable.query(
    `
      INSERT INTO dokumen (
        storage_key,
        original_filename,
        mime_type,
        file_size,
        checksum_sha256,
        kategori,
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id_dokumen,
        storage_key,
        original_filename,
        mime_type,
        file_size,
        checksum_sha256,
        kategori,
        uploaded_by,
        created_at,
        updated_at,
        deleted_at
    `,
    [storageKey, originalFilename, mimeType, fileSize, checksumSha256, kategori, uploadedBy],
  );

  return result.rows[0];
};

export const findDocumentMetadataById = async (idDokumen, queryable = pool) => {
  const result = await queryable.query(
    `
      SELECT
        dokumen.id_dokumen,
        dokumen.storage_key,
        dokumen.original_filename,
        dokumen.mime_type,
        dokumen.file_size,
        dokumen.checksum_sha256,
        dokumen.kategori,
        dokumen.uploaded_by,
        dokumen.created_at,
        dokumen.updated_at,
        dokumen.deleted_at,
        pengguna.nama AS uploaded_by_name
      FROM dokumen
      LEFT JOIN pengguna
        ON pengguna.id_pengguna = dokumen.uploaded_by
      WHERE dokumen.id_dokumen = $1
        AND dokumen.deleted_at IS NULL
      LIMIT 1
    `,
    [idDokumen],
  );

  return result.rows[0] ?? null;
};

export const softDeleteDocumentMetadata = async (idDokumen, queryable = pool) => {
  await queryable.query(
    `
      UPDATE dokumen
      SET deleted_at = current_timestamp,
          updated_at = current_timestamp
      WHERE id_dokumen = $1
    `,
    [idDokumen],
  );
};

export const userCanAccessDocument = async ({ idDokumen, idPengguna, role }) => {
  const normalizedRole = String(role ?? "").toLowerCase();

  if (["admin", "pimpinan"].includes(normalizedRole)) {
    return true;
  }

  if (!idPengguna) return false;

  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM realisasi_kegiatan
        INNER JOIN pengguna_kegiatan
          ON pengguna_kegiatan.id_pengguna_kegiatan = realisasi_kegiatan.id_pengguna_kegiatan
        WHERE realisasi_kegiatan.id_dokumen = $1
          AND pengguna_kegiatan.id_pengguna = $2
      ) OR EXISTS (
        SELECT 1
        FROM penugasan_tambahan
        LEFT JOIN penugasan_tambahan_pengguna
          ON penugasan_tambahan_pengguna.id_penugasan_tambahan = penugasan_tambahan.id_penugasan_tambahan
        WHERE penugasan_tambahan.id_surat_tugas_dokumen = $1
          AND (
            penugasan_tambahan.id_pengguna = $2
            OR penugasan_tambahan_pengguna.id_pengguna = $2
          )
      ) AS can_access
    `,
    [idDokumen, idPengguna],
  );

  return Boolean(result.rows[0]?.can_access);
};
