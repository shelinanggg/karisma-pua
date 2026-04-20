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
  pgm.createTable('refresh_tokens', {
    id: 'id',
    id_pengguna: {
      type: 'integer',
      notNull: true,
      references: '"pengguna"',
      onDelete: 'cascade'
    },
    token: { type: 'text', notNull: true },
    expires_at: { type: 'timestamp with time zone', notNull: true },
    created_at: {
      type: 'timestamp with time zone',
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('refresh_tokens');
};
