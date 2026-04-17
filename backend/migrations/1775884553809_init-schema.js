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
  pgm.createTable('roles', {
    role_id: 'id', // 'id' in node-pg-migrate handles serial primary key
    name: { type: 'varchar(50)', notNull: true, unique: true },
  }, { ifNotExists: true });

  pgm.createTable('pengguna', {
    id_pengguna: 'id',
    nip: { type: 'varchar(50)', unique: true },
    nama: { type: 'varchar(100)', notNull: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    tempat_lahir: { type: 'varchar(100)' },
    tanggal_lahir: { type: 'date' },
    fungsional: { type: 'varchar(100)' },
    tmt_golongan: { type: 'date' },
    pendidikan: { type: 'varchar(100)' },
    kualifikasi: { type: 'varchar(100)' },
    tmt_kgb: { type: 'date' },
    status_aktif: { type: 'boolean', default: true },
    tmt_jabatan: { type: 'date' },
    tmt_pensiun: { type: 'date' },
    role_id: {
      type: 'integer',
      references: '"roles"',
    },
    created_at: {
      type: 'timestamp with time zone',
      default: pgm.func('current_timestamp'),
    },
  }, { ifNotExists: true });

  pgm.sql(`INSERT INTO roles (role_id, name) VALUES (1, 'admin'), (2, 'pimpinan'), (3, 'pegawai') ON CONFLICT DO NOTHING`);

  // Initial testing users / seeding data
  pgm.sql(`
    INSERT INTO pengguna (nama, password_hash, nip, role_id, tempat_lahir, tanggal_lahir, fungsional, tmt_golongan, pendidikan, kualifikasi, tmt_kgb, status_aktif, tmt_jabatan, tmt_pensiun) 
    VALUES 
      ('pimpinan', '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'pimpinan', 2, 'tempat_lahir', '1975-06-15', 'fungsional', '2005-01-01', 'pendidikan', 'kualifikasi', '2010-03-01', TRUE, '2015-07-01', '2035-06-15'),
      ('admin',    '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'admin',    1, 'tempat_lahir', '1980-09-22', 'fungsional', '2008-04-01', 'pendidikan', 'kualifikasi', '2012-06-01', TRUE, '2018-01-01', '2040-09-22'),
      ('pegawai',  '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'pegawai',  3, 'tempat_lahir', '1990-03-10', 'fungsional', '2015-10-01', 'pendidikan', 'kualifikasi', '2018-12-01', TRUE, '2020-04-01', '2050-03-10')
    ON CONFLICT (nip) DO NOTHING;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('pengguna');
  pgm.dropTable('roles');
};
