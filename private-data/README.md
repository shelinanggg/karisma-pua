# Private data

Folder ini untuk SQL yang mengandung data pribadi. Isi SQL diabaikan oleh Git
dan dipasang read-only ke container `private-import`.

Urutan file yang digunakan:

```text
01-init-data-pegawai.sql
02-update-jobdesc-pengguna-kegiatan-2026.sql
03-init-target-realisasi-dwi-prihastuti-2026.sql
```

Jika `insert_angka_kredit_integrasi.sql` menggunakan `id_periode_skp = 1`,
verifikasi dahulu bahwa ID tersebut benar. Setelah terverifikasi, set
`ALLOW_HARDCODED_PERIOD_ID=true` pada `.env.docker`.
