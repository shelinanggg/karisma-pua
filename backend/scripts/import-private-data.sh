#!/bin/sh
set -eu

PRIVATE_DATA_DIR="${PRIVATE_DATA_DIR:-/private-data}"
ALLOW_HARDCODED_PERIOD_ID="${ALLOW_HARDCODED_PERIOD_ID:-false}"

if [ ! -d "$PRIVATE_DATA_DIR" ]; then
  echo "Direktori private data tidak ditemukan: $PRIVATE_DATA_DIR" >&2
  exit 1
fi

set -- "$PRIVATE_DATA_DIR"/*.sql

if [ ! -e "$1" ]; then
  echo "Tidak ada file .sql di $PRIVATE_DATA_DIR" >&2
  exit 1
fi

echo "File private data akan dijalankan berdasarkan urutan nama:"
for sql_file in "$PRIVATE_DATA_DIR"/*.sql; do
  echo "  - $(basename "$sql_file")"
done

for sql_file in "$PRIVATE_DATA_DIR"/*.sql; do
  if grep -Eq 'SELECT[[:space:]]+1::integer[[:space:]]+AS[[:space:]]+id_periode_skp' "$sql_file" \
    && [ "$ALLOW_HARDCODED_PERIOD_ID" != "true" ]; then
    echo >&2
    echo "Import dibatalkan: $(basename "$sql_file") memakai id_periode_skp = 1 secara hard-coded." >&2
    echo "Jika ID 1 sudah diverifikasi benar, set ALLOW_HARDCODED_PERIOD_ID=true pada .env.docker." >&2
    exit 1
  fi

  echo
  echo "Menjalankan $(basename "$sql_file")..."
  psql \
    --no-psqlrc \
    --set ON_ERROR_STOP=on \
    --file "$sql_file"
done

echo
echo "Seluruh private data SQL berhasil di-import."
