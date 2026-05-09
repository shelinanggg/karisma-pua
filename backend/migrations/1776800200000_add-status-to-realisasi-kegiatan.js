/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE realisasi_kegiatan
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'diajukan';

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'realisasi_kegiatan_status_check'
      ) THEN
        ALTER TABLE realisasi_kegiatan
          ADD CONSTRAINT realisasi_kegiatan_status_check
          CHECK (status IN ('diajukan', 'disetujui'));
      END IF;
    END $$;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE realisasi_kegiatan
      DROP CONSTRAINT IF EXISTS realisasi_kegiatan_status_check,
      DROP COLUMN IF EXISTS status;
  `);
};
