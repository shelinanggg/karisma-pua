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
    ALTER TABLE pengguna_kegiatan
      ADD COLUMN IF NOT EXISTS status_pengajuan text NOT NULL DEFAULT 'diajukan';

    UPDATE pengguna_kegiatan
    SET status_pengajuan = 'diajukan'
    WHERE status_pengajuan IS NULL
      OR status_pengajuan NOT IN ('diajukan', 'diterima', 'diubah');

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pengguna_kegiatan_status_pengajuan_check'
      ) THEN
        ALTER TABLE pengguna_kegiatan
          ADD CONSTRAINT pengguna_kegiatan_status_pengajuan_check
          CHECK (status_pengajuan IN ('diajukan', 'diterima', 'diubah'));
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
    ALTER TABLE pengguna_kegiatan
      DROP CONSTRAINT IF EXISTS pengguna_kegiatan_status_pengajuan_check,
      DROP COLUMN IF EXISTS status_pengajuan;
  `);
};
