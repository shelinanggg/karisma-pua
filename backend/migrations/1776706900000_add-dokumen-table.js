/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('dokumen', {
    id_dokumen: 'id',
    storage_key: { type: 'text', notNull: true, unique: true },
    original_filename: { type: 'text', notNull: true },
    mime_type: { type: 'varchar(150)', notNull: true },
    file_size: { type: 'bigint', notNull: true },
    checksum_sha256: { type: 'char(64)' },
    kategori: { type: 'varchar(80)', notNull: true },
    uploaded_by: { type: 'integer', references: '"pengguna"(id_pengguna)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
    deleted_at: { type: 'timestamp with time zone' },
  });

  pgm.addConstraint('dokumen', 'dokumen_file_size_check', {
    check: 'file_size >= 0',
  });

  pgm.addConstraint('dokumen', 'dokumen_storage_key_relative_check', {
    check: "storage_key !~ '^[A-Za-z]:[\\\\/]' AND storage_key !~ '^/' AND storage_key !~ '(^|/)\\.\\.(/|$)'",
  });

  pgm.addConstraint('dokumen', 'dokumen_kategori_not_empty_check', {
    check: "btrim(kategori) <> ''",
  });

  pgm.createIndex('dokumen', 'kategori');
  pgm.createIndex('dokumen', 'uploaded_by');
  pgm.createIndex('dokumen', 'deleted_at');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('dokumen');
};
