/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('riwayat_jabatan', {
    id_riwayat_jabatan: 'id',
    id_pengguna: { type: 'integer', references: '"pengguna"(id_pengguna)', notNull: true, onDelete: 'CASCADE' },
    id_jabatan: { type: 'integer', references: '"jabatan"', notNull: true },
    tmt_jabatan: { type: 'date', notNull: true },
  });

  pgm.createTable('riwayat_penempatan', {
    id_riwayat_penempatan: 'id',
    id_pengguna: { type: 'integer', references: '"pengguna"(id_pengguna)', notNull: true, onDelete: 'CASCADE' },
    id_penempatan: { type: 'integer', references: '"penempatan"', notNull: true },
    tmt_penempatan: { type: 'date', notNull: true },
  });

  pgm.createTable('riwayat_kgb', {
    id_riwayat_kgb: 'id',
    id_pengguna: { type: 'integer', references: '"pengguna"(id_pengguna)', notNull: true, onDelete: 'CASCADE' },
    tanggal: { type: 'date', notNull: true },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('riwayat_kgb');
  pgm.dropTable('riwayat_penempatan');
  pgm.dropTable('riwayat_jabatan');
};
