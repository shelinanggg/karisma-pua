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
  // 1. Create tables
  pgm.createTable('jabatan', {
    id_jabatan: 'id',
    jabatan_pengguna: { type: 'varchar(255)', notNull: true },
  });

  pgm.createTable('pangkat', {
    id_pangkat: 'id',
    nama_pangkat: { type: 'varchar(255)', notNull: true },
  });

  pgm.createTable('golongan', {
    id_golongan: 'id',
    nama_golongan: { type: 'varchar(255)', notNull: true },
  });

  pgm.createTable('penempatan', {
    id_penempatan: 'id',
    nama_penempatan: { type: 'varchar(255)', notNull: true },
  });

  pgm.createTable('sertifikasi', {
    id_sertifikasi: 'id',
    nama_sertifikasi: { type: 'varchar(255)', notNull: true },
  });

  // 2. Insert seed data
  pgm.sql(`
    INSERT INTO jabatan (jabatan_pengguna) VALUES
      ('Pustakawan Ahli Madya'), ('Pustakawan Ahli Muda'), ('Pustakawan Penyelia'),
      ('Pustakawan Ahli Pertama'), ('Pustakawan Terampil'), ('Pelaksana');
  `);

  pgm.sql(`
    INSERT INTO pangkat (nama_pangkat) VALUES
      ('Pembina Tk I'), ('Pembina'), ('Penata Tk I'), ('Penata'),
      ('Pegawai Tetap'), ('Penata Muda Tk I'), ('Penata Muda'),
      ('Pengatur'), ('Pengatur Muda'), ('Pegawai Tidak Tetap');
  `);

  pgm.sql(`
    INSERT INTO golongan (nama_golongan) VALUES
      ('IV/b'), ('IV/a'), ('III/d'), ('III/c'), ('III/b'),
      ('III/a'), ('II/c'), ('II/a'), ('setara III/b'),
      ('setara II/d'), ('setara III/a');
  `);

  pgm.sql(`
    INSERT INTO penempatan (nama_penempatan) VALUES
      ('Hubungan Masyarakat'), ('Pembinaan Koleksi'), ('KK, Referensi, Koleksi A'),
      ('Pelatihan dan Pengembangan'), ('Referensi & Repository Kampus C'),
      ('Pengolahan Informasi & Data Perpustakaan'), ('Kasubag Tata Usaha'),
      ('Kepegawaian'), ('Kasie Kepustakawanan'), ('Ruang Baca Umum B, Podcast, Movio'),
      ('RBU, Terbitan Berkala C'), ('Layanan Sirkulasi C'), ('Layanan E-Lib Kampus C'),
      ('Layanan Repository Kampus B'), ('Layanan Sirkulasi B'), ('Layanan RBU B'),
      ('Sarana dan Prasarana'), ('Sekretariat'), ('Teknologi Informasi'), ('Keuangan');
  `);

  pgm.sql(`
    INSERT INTO sertifikasi (nama_sertifikasi) VALUES
      ('Pemasyarakatan Perpustakaan'), ('Pengembangan Bahan Pustaka'),
      ('Pengolahan Bahan Pustaka'), ('Layanan Perpustakaan');
  `);

  // 3. Add foreign key columns to pengguna
  pgm.addColumns('pengguna', {
    id_jabatan: { type: 'integer', references: '"jabatan"' },
    id_pangkat: { type: 'integer', references: '"pangkat"' },
    id_golongan: { type: 'integer', references: '"golongan"' },
    id_penempatan: { type: 'integer', references: '"penempatan"' },
    id_sertifikasi: { type: 'integer', references: '"sertifikasi"' },
  });

  // 4. Update existing seed data in pengguna
  pgm.sql(`
    UPDATE pengguna 
    SET 
      id_jabatan = 1,
      id_pangkat = 1,
      id_golongan = 1,
      id_penempatan = 1,
      id_sertifikasi = 1
    WHERE nip IN ('pimpinan', 'admin', 'pegawai');
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropColumns('pengguna', [
    'id_jabatan', 'id_pangkat', 'id_golongan', 'id_penempatan', 'id_sertifikasi'
  ]);
  
  pgm.dropTable('sertifikasi');
  pgm.dropTable('penempatan');
  pgm.dropTable('golongan');
  pgm.dropTable('pangkat');
  pgm.dropTable('jabatan');
};
