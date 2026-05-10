export const up = (pgm) => {
  pgm.createTable('audit_logs', {
    id_audit_log: 'id',
    id_pengguna: { type: 'integer', references: '"pengguna"(id_pengguna)', onDelete: 'SET NULL' },
    user_name: { type: 'text' },
    user_role: { type: 'text' },
    activity_type: { type: 'text', notNull: true },
    action: { type: 'text', notNull: true },
    resource: { type: 'text' },
    resource_id: { type: 'text' },
    description: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true },
    ip_address: { type: 'text' },
    user_agent: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('audit_logs', 'audit_logs_activity_type_check', {
    check: "activity_type IN ('Login', 'CRUD')",
  });
  pgm.addConstraint('audit_logs', 'audit_logs_status_check', {
    check: "status IN ('Berhasil', 'Gagal')",
  });
  pgm.createIndex('audit_logs', 'created_at');
  pgm.createIndex('audit_logs', 'activity_type');
  pgm.createIndex('audit_logs', 'status');

  pgm.createTable('backup_logs', {
    id_backup_log: 'id',
    id_pengguna: { type: 'integer', references: '"pengguna"(id_pengguna)', onDelete: 'SET NULL' },
    user_name: { type: 'text' },
    action: { type: 'text', notNull: true },
    file_name: { type: 'text' },
    file_size: { type: 'bigint', notNull: true, default: 0 },
    status: { type: 'text', notNull: true },
    error_message: { type: 'text' },
    created_at: { type: 'timestamp with time zone', default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('backup_logs', 'backup_logs_action_check', {
    check: "action IN ('backup', 'restore')",
  });
  pgm.addConstraint('backup_logs', 'backup_logs_status_check', {
    check: "status IN ('Berhasil', 'Gagal')",
  });
  pgm.createIndex('backup_logs', 'created_at');
  pgm.createIndex('backup_logs', 'action');
  pgm.createIndex('backup_logs', 'status');
};

export const down = (pgm) => {
  pgm.dropTable('backup_logs');
  pgm.dropTable('audit_logs');
};
