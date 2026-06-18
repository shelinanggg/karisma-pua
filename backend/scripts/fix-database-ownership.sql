\set ON_ERROR_STOP on

\if :{?app_user}
\else
\echo 'Parameter app_user wajib diisi, contoh: --set app_user=karisma_user'
\quit
\endif

SELECT set_config('karisma.app_user', :'app_user', false);

DO $ownership$
DECLARE
  target_role text := current_setting('karisma.app_user');
  object_record record;
  object_type text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = target_role) THEN
    RAISE EXCEPTION 'Role PostgreSQL "%" tidak ditemukan.', target_role;
  END IF;

  FOR object_record IN
    SELECT
      namespace.nspname AS schema_name,
      relation.relname AS object_name,
      relation.relkind
    FROM pg_class AS relation
    JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
    WHERE namespace.nspname = 'public'
      AND relation.relkind IN ('r', 'p', 'S', 'v', 'm', 'f')
      AND relation.relowner <> (SELECT oid FROM pg_roles WHERE rolname = target_role)
    ORDER BY relation.relkind, relation.relname
  LOOP
    object_type := CASE object_record.relkind
      WHEN 'S' THEN 'SEQUENCE'
      WHEN 'v' THEN 'VIEW'
      WHEN 'm' THEN 'MATERIALIZED VIEW'
      WHEN 'f' THEN 'FOREIGN TABLE'
      ELSE 'TABLE'
    END;

    EXECUTE format(
      'ALTER %s %I.%I OWNER TO %I',
      object_type,
      object_record.schema_name,
      object_record.object_name,
      target_role
    );
  END LOOP;

  EXECUTE format('ALTER SCHEMA public OWNER TO %I', target_role);
END
$ownership$;

SELECT format(
  'ALTER DATABASE %I OWNER TO %I',
  current_database(),
  :'app_user'
)
\gexec

\echo 'Ownership database dan seluruh objek pada schema public berhasil diseragamkan.'
