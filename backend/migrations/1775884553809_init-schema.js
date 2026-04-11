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

  pgm.createTable('users', {
    user_id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    nip: { type: 'varchar(50)', unique: true },
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

  // Initial testing users from dump
  pgm.sql(`
    INSERT INTO users (name, password_hash, nip, role_id) 
    VALUES 
      ('pimpinan', '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'pimpinan', 2),
      ('admin', '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'admin', 1),
      ('pegawai', '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'pegawai', 3)
    ON CONFLICT (nip) DO NOTHING;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('users');
  pgm.dropTable('roles');
};
