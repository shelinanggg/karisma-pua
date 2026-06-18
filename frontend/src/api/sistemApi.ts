import axiosInstance from './axiosInstance';

export type AuditLogItem = {
  id: string;
  timestamp: string;
  userId: string;
  user: string;
  role: string;
  type: 'Login' | 'CRUD';
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  status: 'Berhasil' | 'Gagal';
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
};

export type BackupLogItem = {
  id: string;
  date: string;
  userId: string;
  user: string;
  action: 'backup' | 'restore';
  fileName: string;
  sizeBytes: number;
  status: 'Berhasil' | 'Gagal';
  errorMessage: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type AuditLogParams = {
  search?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export type BackupLogParams = {
  page?: number;
  pageSize?: number;
};

export async function getAuditLogs(params?: AuditLogParams) {
  const response = await axiosInstance.get<{ data: PaginatedResponse<AuditLogItem> }>('/sistem/audit-logs', { params });
  return response.data.data;
}

export async function getBackupLogs(params?: BackupLogParams) {
  const response = await axiosInstance.get<{ data: PaginatedResponse<BackupLogItem> }>('/sistem/backups', { params });
  return response.data.data;
}

export async function createBackup() {
  const response = await axiosInstance.post<Blob>('/sistem/backups', undefined, { responseType: 'blob' });
  return {
    blob: response.data,
    fileName: getFileNameFromDisposition(response.headers['content-disposition']) || 'karisma-pua-backup.sql',
  };
}

export async function restoreBackup(file: File) {
  const response = await axiosInstance.post<{ message: string; data: BackupLogItem | null }>(
    '/sistem/restore',
    file,
    {
      headers: {
        'Content-Type': 'application/sql',
        'X-Backup-Filename': encodeURIComponent(file.name),
      },
    },
  );
  return response.data;
}

function getFileNameFromDisposition(disposition?: string) {
  if (!disposition) return '';
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].replace(/"/g, ''));
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? '';
}
