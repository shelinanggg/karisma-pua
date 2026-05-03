-- Reset pgmigrations table
DELETE FROM "public"."pgmigrations";

-- Create roles table
CREATE TABLE IF NOT EXISTS "roles" (
  "role_id" serial PRIMARY KEY,
  "name" varchar(50) NOT NULL UNIQUE
);

-- Create pengguna table
CREATE TABLE IF NOT EXISTS "pengguna" (
  "id_pengguna" serial PRIMARY KEY,
  "nip" varchar(50) UNIQUE,
  "nama" varchar(100) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "tempat_lahir" varchar(100),
  "tanggal_lahir" date,
  "fungsional" varchar(100),
  "tmt_golongan" date,
  "pendidikan" varchar(100),
  "kualifikasi" varchar(100),
  "tmt_kgb" date,
  "status_aktif" boolean DEFAULT true,
  "tmt_jabatan" date,
  "tmt_pensiun" date,
  "role_id" integer REFERENCES "roles"("role_id"),
  "created_at" timestamp with time zone DEFAULT current_timestamp
);

-- Insert roles
INSERT INTO roles (role_id, name) VALUES (1, 'admin'), (2, 'pimpinan'), (3, 'pegawai') ON CONFLICT DO NOTHING;

-- Insert test users (password: 'test123' hashed with bcrypt)
INSERT INTO pengguna (nama, password_hash, nip, role_id, tempat_lahir, tanggal_lahir, fungsional, tmt_golongan, pendidikan, kualifikasi, tmt_kgb, status_aktif, tmt_jabatan, tmt_pensiun) 
VALUES 
  ('pimpinan', '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'pimpinan', 2, 'tempat_lahir', '1975-06-15', 'fungsional', '2005-01-01', 'pendidikan', 'kualifikasi', '2010-03-01', TRUE, '2015-07-01', '2035-06-15'),
  ('admin', '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'admin', 1, 'tempat_lahir', '1980-09-22', 'fungsional', '2008-04-01', 'pendidikan', 'kualifikasi', '2012-06-01', TRUE, '2018-01-01', '2040-09-22'),
  ('pegawai', '$2a$10$0R/jtWlZ9jXwsLmlb8qcYeIYU2v4CsVwn3.f8plmFvesUmKSlDLAi', 'pegawai', 3, 'tempat_lahir', '1990-03-10', 'fungsional', '2015-10-01', 'pendidikan', 'kualifikasi', '2018-12-01', TRUE, '2020-04-01', '2050-03-10')
ON CONFLICT DO NOTHING;

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" serial PRIMARY KEY,
  "id_pengguna" integer NOT NULL REFERENCES "pengguna" ON DELETE cascade,
  "token" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT current_timestamp
);
