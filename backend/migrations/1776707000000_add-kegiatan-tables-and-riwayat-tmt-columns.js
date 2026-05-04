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
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riwayat_jabatan'
          AND column_name = 'tanggal'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riwayat_jabatan'
          AND column_name = 'tmt_jabatan'
      ) THEN
        ALTER TABLE riwayat_jabatan RENAME COLUMN tanggal TO tmt_jabatan;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riwayat_penempatan'
          AND column_name = 'tanggal'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riwayat_penempatan'
          AND column_name = 'tmt_penempatan'
      ) THEN
        ALTER TABLE riwayat_penempatan RENAME COLUMN tanggal TO tmt_penempatan;
      END IF;
    END $$;
  `);

  pgm.createTable('butir_kegiatan', {
    id_butir_kegiatan: 'id',
    nama_kegiatan: { type: 'text', notNull: true, unique: true },
    created_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
  });

  pgm.createTable('pegawai_kegiatan', {
    id_pegawai_kegiatan: 'id',
    id_pengguna: { type: 'integer', references: '"pengguna"(id_pengguna)', notNull: true, onDelete: 'CASCADE' },
    id_butir_kegiatan: { type: 'integer', references: '"butir_kegiatan"(id_butir_kegiatan)', notNull: true },
    uraian: { type: 'text' },
    deskripsi: { type: 'text' },
    periode_mulai: { type: 'date', notNull: true },
    periode_selesai: { type: 'date' },
    target_ketercapaian: { type: 'text' },
    status: { type: 'text', notNull: true, default: 'aktif' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('pegawai_kegiatan', 'pegawai_kegiatan_status_check', {
    check: "status IN ('aktif', 'selesai', 'batal')",
  });

  pgm.createTable('realisasi_kegiatan', {
    id_realisasi_kegiatan: 'id',
    id_pegawai_kegiatan: { type: 'integer', references: '"pegawai_kegiatan"(id_pegawai_kegiatan)', notNull: true, onDelete: 'CASCADE' },
    tanggal_realisasi: { type: 'date', notNull: true },
    realisasi_target: { type: 'text' },
    keterangan: { type: 'text' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
  });

  pgm.sql(`
    INSERT INTO butir_kegiatan (nama_kegiatan) VALUES
      ('Menilai kondisi fisik dan informasi koleksi perpustakaan'),
      ('Melakukan penyiangan koleksi perpustakaan'),
      ('Melakukan pengatalogan deskriptif kompleks dan subjek bahan perpustakaan'),
      ('Menyusun literatur sekunder'),
      ('Mengelola data dalam pangkalan data kepustakawanan'),
      ('Memberikan layanan orientasi perpustakaan'),
      ('Memberikan layanan konsultasi riset kepada pemustaka kategori pre researcher'),
      ('Menyusun paket informasi terseleksi'),
      ('Melakukan publisitas melalui media cetak dan/atau elektronik'),
      ('Menyiapkan konten pameran di bidang perpustakaan'),
      ('Melakukan program literasi informasi tingkat I'),
      ('Melakukan program literasi informasi tingkat II'),
      ('Melakukan program literasi informasi tingkat III'),
      ('Melakukan analisis kebutuhan informasi pemustaka'),
      ('Melakukan seleksi bahan perpustakaan'),
      ('Menganalisis kebutuhan pelestarian'),
      ('Melakukan pelestarian informasi bahan perpustakaan ke dalam bentuk terekam'),
      ('Membuat abstrak informatif koleksi perpustakaan'),
      ('Melakukan pengkajian kepustakawanan bersifat monodisiplin'),
      ('Melakukan pengkajian kepustakawanan bersifat multidisiplin'),
      ('Melaksanakan penyuluhan tentang pengembangan kepustakawanan'),
      ('Melaksanakan penyuluhan tentang pemanfaatan perpustakaan'),
      ('Melakukan pemantauan penyelenggaraan perpustakaan'),
      ('Membuat sinopsis koleksi perpustakaan'),
      ('Melakukan layanan kepada pemustaka dengan karakteristik tertentu'),
      ('Mengelola konten website dan media sosial kepustakawanan'),
      ('Mengevaluasi koleksi perpustakaan'),
      ('Memberikan pertimbangan terhadap lisensi dan hak guna koleksi digital'),
      ('Membuat panduan pustaka (pathfinder)'),
      ('Memberi konsultasi kepustakawanan yang bersifat konsep'),
      ('Melakukan penilaian kesesuaian terhadap penerapan standar di bidang perpustakaan'),
      ('Menyusun rancangan standar di bidang perpustakaan'),
      ('Melakukan pembinaan teknis perpustakaan'),
      ('Melakukan evaluasi penyelenggaraan perpustakaan'),
      ('Menyusun rencana penyelenggaraan perpustakaan'),
      ('Mengelola layanan kepada pemustaka'),
      ('Memberikan layanan konsultasi riset kepada pemustaka kelompok mid-level researcher'),
      ('Memberikan layanan konsultasi riset kepada pemustaka kategori junior researcher'),
      ('Mengevaluasi kepuasan terhadap layanan perpustakaan'),
      ('Melakukan instruksi bibliografi'),
      ('Membuat resensi bahan perpustakaan yang dipublikasikan'),
      ('Merancang desain pameran di bidang perpustakaan'),
      ('Menyusun rencana penanggulangan bencana perpustakaan'),
      ('PIC program kerja'),
      ('Melakukan silang layan perpustakaan (inter library loan)'),
      ('Melakukan autentikasi manuskrip bahan perpustakaan'),
      ('Melakukan pengendalian mutu hasil pelestarian'),
      ('Melakukan pengendalian mutu pengatalogan bahan perpustakaan'),
      ('Mengadvokasi kebijakan di bidang perpustakaan di dalam institusi'),
      ('Menyusun rencana program kerja perpustakaan'),
      ('Melakukan evaluasi program kerja perpustakaan'),
      ('Mengendalikan mutu data kepustakawanan'),
      ('Mengorganisasikan data set dalam repositori data'),
      ('Memberikan layanan referensi'),
      ('Melakukan pemetaan kebutuhan pemustaka terhadap layanan perpustakaan'),
      ('Membuat produk pengetahuan dalam format multimedia'),
      ('Melakukan identifikasi kebutuhan informasi pemustaka'),
      ('Mengontrol kondisi lingkungan penyimpanan koleksi perpustakaan'),
      ('Melakukan validasi pengatalogan bahan perpustakaan'),
      ('Menata naskah terbitan berkala'),
      ('Menyusun rencana kerja teknis perpustakaan'),
      ('Melakukan layanan penyebaran informasi terbaru (current awareness service)'),
      ('Melakukan layanan tur perpustakaan'),
      ('Membuat statistik perpustakaan'),
      ('Memvalidasi rancangan standar di bidang perpustakaan'),
      ('Menyusun rencana strategis di bidang perpustakaan'),
      ('Membimbing pustakawan dalam kajian kepustakawanan'),
      ('Mengukur kinerja perpustakaan sesuai standar'),
      ('Memberikan layanan informasi tren riset dan IPTEK'),
      ('Bendahara penerimaan'),
      ('Melakukan deteksi dan perbaikan masalah jaringan lokal'),
      ('Melakukan pencatatan infrastruktur teknologi informasi'),
      ('Melakukan pemasangan kabel infrastruktur TI'),
      ('Melakukan pemeliharaan perangkat TI end user'),
      ('Melakukan perbaikan perangkat TI end user'),
      ('Melakukan konversi data'),
      ('Melakukan kompilasi data'),
      ('Melakukan uji coba program multimedia interaktif'),
      ('Melakukan layanan teknologi informasi'),
      ('Menyiapkan peralatan video conference dan monitoring perangkat'),
      ('Tim kreatif'),
      ('Melakukan monitoring akses pengguna'),
      ('Mengumpulkan data untuk audit TI'),
      ('Melakukan monitoring jaringan'),
      ('Monitoring kinerja infrastruktur TI'),
      ('Instalasi dan upgrade sistem operasi'),
      ('Menyusun petunjuk operasional aplikasi'),
      ('Backup dan pemulihan data'),
      ('Optimalisasi sistem jaringan'),
      ('Pemeriksaan kesesuaian infrastruktur TI'),
      ('Perancangan sistem informasi'),
      ('Membuat program aplikasi'),
      ('Menyusun standar keamanan data'),
      ('Analisis awal audit TI')
    ON CONFLICT (nama_kegiatan) DO NOTHING;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('realisasi_kegiatan');
  pgm.dropTable('pegawai_kegiatan');
  pgm.dropTable('butir_kegiatan');

  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riwayat_jabatan'
          AND column_name = 'tmt_jabatan'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riwayat_jabatan'
          AND column_name = 'tanggal'
      ) THEN
        ALTER TABLE riwayat_jabatan RENAME COLUMN tmt_jabatan TO tanggal;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riwayat_penempatan'
          AND column_name = 'tmt_penempatan'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'riwayat_penempatan'
          AND column_name = 'tanggal'
      ) THEN
        ALTER TABLE riwayat_penempatan RENAME COLUMN tmt_penempatan TO tanggal;
      END IF;
    END $$;
  `);
};
