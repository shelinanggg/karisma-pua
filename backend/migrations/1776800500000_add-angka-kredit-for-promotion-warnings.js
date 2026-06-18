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
    ALTER TABLE jabatan
      ADD COLUMN IF NOT EXISTS kredit_koefisien_per_tahun numeric(10, 3),
      ADD COLUMN IF NOT EXISTS target_angka_kredit_naik_jabatan numeric(10, 3);

    ALTER TABLE pengguna
      ADD COLUMN IF NOT EXISTS angka_kredit_integrasi numeric(10, 3) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS angka_kredit_saat_ini numeric(10, 3);

    INSERT INTO periode_skp (tahun, tanggal_mulai, tanggal_selesai)
    SELECT 2026, DATE '2026-01-01', DATE '2026-12-31'
    WHERE NOT EXISTS (
      SELECT 1
      FROM periode_skp
      WHERE tahun = 2026
    );

    CREATE UNIQUE INDEX IF NOT EXISTS periode_skp_tahun_unique_idx
      ON periode_skp(tahun);

    UPDATE jabatan
    SET
      kredit_koefisien_per_tahun = CASE jabatan_pengguna
        WHEN 'Pustakawan Ahli Madya' THEN 37.50
        WHEN 'Pustakawan Ahli Muda' THEN 25.00
        WHEN 'Pustakawan Penyelia' THEN 25.00
        WHEN 'Pustakawan Ahli Pertama' THEN 12.50
        WHEN 'Pustakawan Terampil' THEN 5.00
        ELSE kredit_koefisien_per_tahun
      END,
      target_angka_kredit_naik_jabatan = CASE jabatan_pengguna
        WHEN 'Pustakawan Ahli Madya' THEN 450.00
        WHEN 'Pustakawan Ahli Muda' THEN 200.00
        WHEN 'Pustakawan Ahli Pertama' THEN 200.00
        WHEN 'Pustakawan Terampil' THEN 100.00
        ELSE target_angka_kredit_naik_jabatan
      END
    WHERE jabatan_pengguna IN (
      'Pustakawan Ahli Madya',
      'Pustakawan Ahli Muda',
      'Pustakawan Penyelia',
      'Pustakawan Ahli Pertama',
      'Pustakawan Terampil'
    );

    CREATE TABLE IF NOT EXISTS angka_kredit_pegawai (
      id_angka_kredit_pegawai serial PRIMARY KEY,
      id_pengguna integer NOT NULL REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
      id_periode_skp integer NOT NULL REFERENCES periode_skp(id_periode_skp) ON DELETE CASCADE,
      angka_kredit numeric(10, 3) NOT NULL DEFAULT 0,
      created_at timestamp with time zone DEFAULT current_timestamp,
      updated_at timestamp with time zone DEFAULT current_timestamp,
      CONSTRAINT angka_kredit_pegawai_unique UNIQUE (id_pengguna, id_periode_skp),
      CONSTRAINT angka_kredit_pegawai_non_negative CHECK (angka_kredit >= 0)
    );

    CREATE INDEX IF NOT EXISTS angka_kredit_pegawai_id_pengguna_idx
      ON angka_kredit_pegawai(id_pengguna);

    CREATE INDEX IF NOT EXISTS angka_kredit_pegawai_id_periode_skp_idx
      ON angka_kredit_pegawai(id_periode_skp);

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'jabatan_kredit_koefisien_non_negative'
      ) THEN
        ALTER TABLE jabatan
          ADD CONSTRAINT jabatan_kredit_koefisien_non_negative
          CHECK (kredit_koefisien_per_tahun IS NULL OR kredit_koefisien_per_tahun >= 0);
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'jabatan_target_angka_kredit_non_negative'
      ) THEN
        ALTER TABLE jabatan
          ADD CONSTRAINT jabatan_target_angka_kredit_non_negative
          CHECK (target_angka_kredit_naik_jabatan IS NULL OR target_angka_kredit_naik_jabatan >= 0);
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pengguna_angka_kredit_integrasi_non_negative'
      ) THEN
        ALTER TABLE pengguna
          ADD CONSTRAINT pengguna_angka_kredit_integrasi_non_negative
          CHECK (angka_kredit_integrasi >= 0);
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pengguna_angka_kredit_saat_ini_non_negative'
      ) THEN
        ALTER TABLE pengguna
          ADD CONSTRAINT pengguna_angka_kredit_saat_ini_non_negative
          CHECK (angka_kredit_saat_ini IS NULL OR angka_kredit_saat_ini >= 0);
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
    DROP TABLE IF EXISTS angka_kredit_pegawai;

    DROP INDEX IF EXISTS periode_skp_tahun_unique_idx;

    DELETE FROM periode_skp
    WHERE tahun = 2026
      AND tanggal_mulai = DATE '2026-01-01'
      AND tanggal_selesai = DATE '2026-12-31'
      AND NOT EXISTS (
        SELECT 1
        FROM pengguna_kegiatan
        WHERE pengguna_kegiatan.id_periode_skp = periode_skp.id_periode_skp
      );

    ALTER TABLE pengguna
      DROP CONSTRAINT IF EXISTS pengguna_angka_kredit_saat_ini_non_negative,
      DROP CONSTRAINT IF EXISTS pengguna_angka_kredit_integrasi_non_negative,
      DROP COLUMN IF EXISTS angka_kredit_saat_ini,
      DROP COLUMN IF EXISTS angka_kredit_integrasi;

    ALTER TABLE jabatan
      DROP CONSTRAINT IF EXISTS jabatan_target_angka_kredit_non_negative,
      DROP CONSTRAINT IF EXISTS jabatan_kredit_koefisien_non_negative,
      DROP COLUMN IF EXISTS target_angka_kredit_naik_jabatan,
      DROP COLUMN IF EXISTS kredit_koefisien_per_tahun;
  `);
};
