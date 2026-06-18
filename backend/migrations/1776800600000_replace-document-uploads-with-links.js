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
    ALTER TABLE penugasan_tambahan
      ADD COLUMN IF NOT EXISTS link_surat text;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'penugasan_tambahan'
          AND column_name = 'surat_tugas'
      ) THEN
        UPDATE penugasan_tambahan
        SET link_surat = surat_tugas
        WHERE link_surat IS NULL
          AND surat_tugas ~* '^https?://';
      END IF;
    END $$;

    DROP INDEX IF EXISTS penugasan_tambahan_id_surat_tugas_dokumen_idx;

    ALTER TABLE penugasan_tambahan
      DROP COLUMN IF EXISTS id_surat_tugas_dokumen,
      DROP COLUMN IF EXISTS surat_tugas;

    ALTER TABLE realisasi_kegiatan
      ADD COLUMN IF NOT EXISTS link_dokumen_pendukung text,
      DROP COLUMN IF EXISTS id_dokumen;

    DROP TABLE IF EXISTS dokumen;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE penugasan_tambahan
      ADD COLUMN IF NOT EXISTS surat_tugas text;

    UPDATE penugasan_tambahan
    SET surat_tugas = link_surat
    WHERE surat_tugas IS NULL;

    ALTER TABLE penugasan_tambahan
      DROP COLUMN IF EXISTS link_surat;

    ALTER TABLE realisasi_kegiatan
      DROP COLUMN IF EXISTS link_dokumen_pendukung;
  `);
};
