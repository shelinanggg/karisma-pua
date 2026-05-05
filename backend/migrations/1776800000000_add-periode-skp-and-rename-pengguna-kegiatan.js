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
    CREATE TABLE IF NOT EXISTS periode_skp (
      id_periode_skp serial PRIMARY KEY,
      tahun integer NOT NULL,
      tanggal_mulai date NOT NULL,
      tanggal_selesai date NOT NULL,
      created_at timestamp with time zone DEFAULT current_timestamp,
      updated_at timestamp with time zone DEFAULT current_timestamp
    );

    INSERT INTO periode_skp (tahun, tanggal_mulai, tanggal_selesai)
    SELECT DISTINCT
      EXTRACT(YEAR FROM periode_mulai)::integer AS tahun,
      periode_mulai AS tanggal_mulai,
      COALESCE(periode_selesai, periode_mulai) AS tanggal_selesai
    FROM pegawai_kegiatan
    WHERE periode_mulai IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM periode_skp
        WHERE periode_skp.tahun = EXTRACT(YEAR FROM pegawai_kegiatan.periode_mulai)::integer
          AND periode_skp.tanggal_mulai = pegawai_kegiatan.periode_mulai
          AND periode_skp.tanggal_selesai = COALESCE(pegawai_kegiatan.periode_selesai, pegawai_kegiatan.periode_mulai)
      );

    DO $$
    BEGIN
      IF to_regclass('public.pegawai_kegiatan') IS NOT NULL
        AND to_regclass('public.pengguna_kegiatan') IS NULL THEN
        ALTER TABLE pegawai_kegiatan RENAME TO pengguna_kegiatan;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'pengguna_kegiatan'
          AND column_name = 'id_pegawai_kegiatan'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'pengguna_kegiatan'
          AND column_name = 'id_pengguna_kegiatan'
      ) THEN
        ALTER TABLE pengguna_kegiatan RENAME COLUMN id_pegawai_kegiatan TO id_pengguna_kegiatan;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pegawai_kegiatan_pkey'
      ) THEN
        ALTER TABLE pengguna_kegiatan RENAME CONSTRAINT pegawai_kegiatan_pkey TO pengguna_kegiatan_pkey;
      END IF;

      IF to_regclass('public.pegawai_kegiatan_id_pegawai_kegiatan_seq') IS NOT NULL
        AND to_regclass('public.pengguna_kegiatan_id_pengguna_kegiatan_seq') IS NULL THEN
        ALTER SEQUENCE pegawai_kegiatan_id_pegawai_kegiatan_seq RENAME TO pengguna_kegiatan_id_pengguna_kegiatan_seq;
      END IF;
    END $$;

    ALTER SEQUENCE IF EXISTS pengguna_kegiatan_id_pengguna_kegiatan_seq
      OWNED BY pengguna_kegiatan.id_pengguna_kegiatan;

    ALTER TABLE pengguna_kegiatan
      ALTER COLUMN id_pengguna_kegiatan SET DEFAULT nextval('pengguna_kegiatan_id_pengguna_kegiatan_seq'::regclass);

    ALTER TABLE pengguna_kegiatan
      DROP CONSTRAINT IF EXISTS pegawai_kegiatan_status_check;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pengguna_kegiatan_status_check'
      ) THEN
        ALTER TABLE pengguna_kegiatan
          ADD CONSTRAINT pengguna_kegiatan_status_check
          CHECK (status IN ('aktif', 'selesai', 'batal'));
      END IF;
    END $$;

    ALTER TABLE pengguna_kegiatan
      ADD COLUMN IF NOT EXISTS id_periode_skp integer;

    UPDATE pengguna_kegiatan
    SET id_periode_skp = periode_skp.id_periode_skp
    FROM periode_skp
    WHERE pengguna_kegiatan.id_periode_skp IS NULL
      AND periode_skp.tahun = EXTRACT(YEAR FROM pengguna_kegiatan.periode_mulai)::integer
      AND periode_skp.tanggal_mulai = pengguna_kegiatan.periode_mulai
      AND periode_skp.tanggal_selesai = COALESCE(pengguna_kegiatan.periode_selesai, pengguna_kegiatan.periode_mulai);

    ALTER TABLE pengguna_kegiatan
      ALTER COLUMN id_periode_skp SET NOT NULL;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pengguna_kegiatan_id_periode_skp_fkey'
      ) THEN
        ALTER TABLE pengguna_kegiatan
          ADD CONSTRAINT pengguna_kegiatan_id_periode_skp_fkey
          FOREIGN KEY (id_periode_skp)
          REFERENCES periode_skp(id_periode_skp);
      END IF;
    END $$;

    ALTER TABLE pengguna_kegiatan
      DROP COLUMN IF EXISTS periode_mulai,
      DROP COLUMN IF EXISTS periode_selesai;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'realisasi_kegiatan'
          AND column_name = 'id_pegawai_kegiatan'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'realisasi_kegiatan'
          AND column_name = 'id_pengguna_kegiatan'
      ) THEN
        ALTER TABLE realisasi_kegiatan RENAME COLUMN id_pegawai_kegiatan TO id_pengguna_kegiatan;
      END IF;
    END $$;

    ALTER TABLE realisasi_kegiatan
      DROP CONSTRAINT IF EXISTS realisasi_kegiatan_id_pegawai_kegiatan_fkey;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'realisasi_kegiatan_id_pengguna_kegiatan_fkey'
      ) THEN
        ALTER TABLE realisasi_kegiatan
          ADD CONSTRAINT realisasi_kegiatan_id_pengguna_kegiatan_fkey
          FOREIGN KEY (id_pengguna_kegiatan)
          REFERENCES pengguna_kegiatan(id_pengguna_kegiatan)
          ON DELETE CASCADE;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS penugasan_tambahan (
      id_penugasan_tambahan serial PRIMARY KEY,
      id_pengguna integer NOT NULL REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
      nama_kegiatan text NOT NULL,
      status text NOT NULL DEFAULT 'aktif',
      deskripsi text,
      tanggal_mulai date,
      tanggal_selesai date,
      surat_tugas text,
      created_at timestamp with time zone DEFAULT current_timestamp,
      updated_at timestamp with time zone DEFAULT current_timestamp,
      CONSTRAINT penugasan_tambahan_status_check CHECK (status IN ('aktif', 'selesai', 'batal'))
    );

    CREATE TABLE IF NOT EXISTS pengguna_penugasan_tambahan (
      id_pengguna_penugasan_tambahan serial PRIMARY KEY,
      id_pengguna integer NOT NULL REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
      id_penugasan_tambahan integer NOT NULL REFERENCES penugasan_tambahan(id_penugasan_tambahan) ON DELETE CASCADE,
      CONSTRAINT pengguna_penugasan_tambahan_unique UNIQUE (id_pengguna, id_penugasan_tambahan)
    );
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS pengguna_penugasan_tambahan;

    DROP TABLE IF EXISTS penugasan_tambahan;

    ALTER TABLE realisasi_kegiatan
      DROP CONSTRAINT IF EXISTS realisasi_kegiatan_id_pengguna_kegiatan_fkey;

    ALTER TABLE pengguna_kegiatan
      ADD COLUMN IF NOT EXISTS periode_mulai date,
      ADD COLUMN IF NOT EXISTS periode_selesai date;

    UPDATE pengguna_kegiatan
    SET
      periode_mulai = periode_skp.tanggal_mulai,
      periode_selesai = periode_skp.tanggal_selesai
    FROM periode_skp
    WHERE pengguna_kegiatan.id_periode_skp = periode_skp.id_periode_skp;

    ALTER TABLE pengguna_kegiatan
      ALTER COLUMN periode_mulai SET NOT NULL;

    ALTER TABLE pengguna_kegiatan
      DROP CONSTRAINT IF EXISTS pengguna_kegiatan_id_periode_skp_fkey,
      DROP COLUMN IF EXISTS id_periode_skp;

    ALTER TABLE pengguna_kegiatan
      DROP CONSTRAINT IF EXISTS pengguna_kegiatan_status_check;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pegawai_kegiatan_status_check'
      ) THEN
        ALTER TABLE pengguna_kegiatan
          ADD CONSTRAINT pegawai_kegiatan_status_check
          CHECK (status IN ('aktif', 'selesai', 'batal'));
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'realisasi_kegiatan'
          AND column_name = 'id_pengguna_kegiatan'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'realisasi_kegiatan'
          AND column_name = 'id_pegawai_kegiatan'
      ) THEN
        ALTER TABLE realisasi_kegiatan RENAME COLUMN id_pengguna_kegiatan TO id_pegawai_kegiatan;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'pengguna_kegiatan'
          AND column_name = 'id_pengguna_kegiatan'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'pengguna_kegiatan'
          AND column_name = 'id_pegawai_kegiatan'
      ) THEN
        ALTER TABLE pengguna_kegiatan RENAME COLUMN id_pengguna_kegiatan TO id_pegawai_kegiatan;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'pengguna_kegiatan_pkey'
      ) THEN
        ALTER TABLE pengguna_kegiatan RENAME CONSTRAINT pengguna_kegiatan_pkey TO pegawai_kegiatan_pkey;
      END IF;

      IF to_regclass('public.pengguna_kegiatan_id_pengguna_kegiatan_seq') IS NOT NULL
        AND to_regclass('public.pegawai_kegiatan_id_pegawai_kegiatan_seq') IS NULL THEN
        ALTER SEQUENCE pengguna_kegiatan_id_pengguna_kegiatan_seq RENAME TO pegawai_kegiatan_id_pegawai_kegiatan_seq;
      END IF;

      IF to_regclass('public.pengguna_kegiatan') IS NOT NULL
        AND to_regclass('public.pegawai_kegiatan') IS NULL THEN
        ALTER TABLE pengguna_kegiatan RENAME TO pegawai_kegiatan;
      END IF;
    END $$;

    ALTER SEQUENCE IF EXISTS pegawai_kegiatan_id_pegawai_kegiatan_seq
      OWNED BY pegawai_kegiatan.id_pegawai_kegiatan;

    ALTER TABLE pegawai_kegiatan
      ALTER COLUMN id_pegawai_kegiatan SET DEFAULT nextval('pegawai_kegiatan_id_pegawai_kegiatan_seq'::regclass);

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'realisasi_kegiatan_id_pegawai_kegiatan_fkey'
      ) THEN
        ALTER TABLE realisasi_kegiatan
          ADD CONSTRAINT realisasi_kegiatan_id_pegawai_kegiatan_fkey
          FOREIGN KEY (id_pegawai_kegiatan)
          REFERENCES pegawai_kegiatan(id_pegawai_kegiatan)
          ON DELETE CASCADE;
      END IF;
    END $$;

    DROP TABLE IF EXISTS periode_skp;
  `);
};
