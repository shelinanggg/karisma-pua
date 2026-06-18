# Menjalankan Karisma PUA dengan Docker

Konfigurasi ini menjalankan empat service:

- `postgres`: PostgreSQL 18 dengan volume persisten.
- `migrate`: menjalankan migration lalu berhenti.
- `backend`: API Node.js beserta `pg_dump` dan `psql` versi 18.
- `frontend`: Nginx yang menyajikan React dan meneruskan `/api` ke backend.

Hanya frontend yang diterbitkan ke host. Backend dan PostgreSQL hanya dapat
diakses melalui jaringan internal Docker.

## Persiapan pertama

Pastikan Docker Desktop sedang berjalan, lalu dari root proyek jalankan:

```powershell
Copy-Item .env.docker.example .env.docker
```

Ubah minimal `DB_PASSWORD` dan `JWT_SECRET` pada `.env.docker`.

Bangun dan jalankan seluruh service:

```powershell
docker compose --env-file .env.docker up --build -d
```

Buka aplikasi:

```text
http://localhost:8080
```

## Melihat status dan log

```powershell
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker logs -f migrate
```

Service `migrate` dengan status `Exited (0)` berarti migration berhasil.

## Menghentikan aplikasi

```powershell
docker compose --env-file .env.docker down
```

Perintah tersebut tidak menghapus data PostgreSQL.

Untuk menghapus container sekaligus volume database:

```powershell
docker compose --env-file .env.docker down -v
```

Perintah `down -v` menghapus seluruh database Docker dan hanya boleh digunakan
ketika datanya memang tidak lagi diperlukan.

## Menjalankan migration setelah ada file migration baru

```powershell
docker compose --env-file .env.docker run --rm migrate
```

Kemudian restart backend bila diperlukan:

```powershell
docker compose --env-file .env.docker restart backend
```

## Import data pribadi di luar migration

Data pegawai dan data pribadi lain tidak boleh dimasukkan ke Git atau Docker
image. Simpan file hanya pada folder `private-data` di mesin deployment.

Gunakan urutan nama berikut:

```text
private-data/
  01-init-data-pegawai.sql
  02-update-jobdesc-pengguna-kegiatan-2026.sql
  03-init-target-realisasi-dwi-prihastuti-2026.sql
```

Jalankan import setelah migration selesai:

```powershell
docker compose --env-file .env.docker --profile tools run --rm private-import
```

Importer berhenti pada error pertama karena menggunakan `ON_ERROR_STOP`. File
yang memiliki `BEGIN` dan `COMMIT` akan melakukan rollback jika salah satu
perintahnya gagal.

Jangan sertakan `insert_angka_kredit_integrasi.sql` yang masih mengandalkan
`id_periode_skp = 1`. Importer akan menolak pola tersebut. Pada database Docker
baru ID itu biasanya merupakan periode 2026, dan aplikasi saat ini membaca
`pengguna.angka_kredit_saat_ini` yang sudah diisi file data pegawai.

Setelah berhasil, file privat dapat dipindahkan ke penyimpanan terenkripsi atau
dihapus dari server sesuai kebijakan retensi organisasi. Jangan menjalankan
import ulang tanpa memahami perilaku setiap script:

- Data pegawai memakai `ON CONFLICT DO NOTHING`.
- Job description menghapus dan membuat ulang penugasan 2026, serta menolak
  berjalan jika pegawai terkait sudah mempunyai realisasi.
- Target/realisasi Dwi dapat dijalankan ulang untuk data integrasi miliknya.

## Backup dan restore

Image backend memasang PostgreSQL client 18. Karena itu fitur backup dan restore
admin menggunakan:

```text
PG_DUMP_PATH=pg_dump
PSQL_PATH=psql
```

Path Windows dari `backend/.env` tidak digunakan di dalam container.

## Memeriksa database dari terminal

```powershell
docker compose --env-file .env.docker exec postgres `
  psql -U karisma_user -d karisma
```

## Catatan deployment server

Untuk pengujian lokal HTTP gunakan:

```env
NODE_ENV=development
CORS_ORIGINS=http://localhost:8080
```

Saat server sudah memakai domain dan HTTPS, ubah menjadi:

```env
NODE_ENV=production
CORS_ORIGINS=https://domain-aplikasi.example
```

Pada deployment HTTPS, letakkan reverse proxy TLS di depan port frontend atau
sesuaikan konfigurasi Nginx agar menangani sertifikat.
