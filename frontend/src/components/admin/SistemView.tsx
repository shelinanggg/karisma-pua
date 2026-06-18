import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Filter,
  HardDrive,
  RefreshCw,
  Search,
  Shield,
  Upload,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
  createBackup,
  getAuditLogs,
  getBackupLogs,
  restoreBackup,
  type AuditLogItem,
  type BackupLogItem,
  type PaginatedResponse,
} from '../../api/sistemApi';

const pageSizeOptions = [5, 10, 20];
const maxRestoreSize = 100 * 1024 * 1024;

const activityStyles: Record<string, { bg: string; fg: string }> = {
  Login: { bg: 'var(--activity-login-bg)', fg: 'var(--activity-login)' },
  CRUD: { bg: 'var(--activity-crud-bg)', fg: 'var(--activity-crud)' },
};

const statusStyles: Record<string, { bg: string; fg: string }> = {
  Berhasil: { bg: 'var(--status-success-bg)', fg: 'var(--status-success)' },
  Gagal: { bg: 'var(--status-failed-bg)', fg: 'var(--status-failed)' },
  Diproses: { bg: 'var(--status-progress-bg)', fg: 'var(--status-progress)' },
};

function openDatePicker(event: { currentTarget: HTMLInputElement }) {
  const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
  try {
    input.showPicker?.();
  } catch {
    // Native focus/click remains available.
  }
}

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage === 1) return [1, 2, 3, totalPages];
  if (currentPage >= totalPages - 1) return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return Array.from(new Set([currentPage - 1, currentPage, currentPage + 1, totalPages].filter((page) => page >= 1 && page <= totalPages))).sort((a, b) => a - b);
}

function formatBytes(value: number) {
  if (!value) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** index;
  return `${amount.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function ActivityBadge({ type }: { type: string }) {
  const style = activityStyles[type] ?? { bg: 'var(--muted)', fg: 'var(--muted-foreground)' };
  return (
    <span className="inline-flex w-24 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: style.bg, color: style.fg }}>
      <span className="truncate">{type}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? { bg: 'var(--muted)', fg: 'var(--muted-foreground)' };
  return (
    <span className="inline-flex w-24 items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: style.bg, color: style.fg }}>
      {status === 'Berhasil' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'Gagal' && <AlertCircle className="h-3 w-3" />}
      {status === 'Diproses' && <RefreshCw className="h-3 w-3 animate-spin" />}
      {status}
    </span>
  );
}

function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const visiblePages = getAdaptivePages(page, totalPages);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Menampilkan {start}-{end} dari {total} data
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
          <span className="text-xs text-muted-foreground">Tampilkan</span>
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value));
              onPageChange(1);
            }}
            className="text-xs font-medium outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40">
          Sebelumnya
        </button>
        {visiblePages.map((pageNumber, idx) => (
          <span key={pageNumber} className="flex items-center gap-2">
            {idx > 0 && pageNumber - visiblePages[idx - 1] > 1 && <span className="px-1 text-xs text-muted-foreground">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className="rounded-lg border py-1 text-xs font-medium transition"
              style={{
                minWidth: '2rem',
                paddingLeft: '0.1rem',
                paddingRight: '0.1rem',
                ...(pageNumber === page
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' }
                  : { background: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }),
              }}
            >
              {pageNumber}
            </button>
          </span>
        ))}
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40">
          Berikutnya
        </button>
      </div>
    </div>
  );
}

const emptyAuditData: PaginatedResponse<AuditLogItem> = {
  items: [],
  pagination: { page: 1, pageSize: 5, total: 0, totalPages: 1 },
};

const emptyBackupData: PaginatedResponse<BackupLogItem> = {
  items: [],
  pagination: { page: 1, pageSize: 5, total: 0, totalPages: 1 },
};

export function SistemView() {
  const [activeTab, setActiveTab] = useState<'audit' | 'backup'>('audit');
  const [auditData, setAuditData] = useState(emptyAuditData);
  const [backupData, setBackupData] = useState(emptyBackupData);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(null);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isRestoreConfirmModalOpen, setRestoreConfirmModalOpen] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditType, setAuditType] = useState('');
  const [auditStatus, setAuditStatus] = useState('');
  const [auditDateFrom, setAuditDateFrom] = useState('');
  const [auditDateTo, setAuditDateTo] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [backupPage, setBackupPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(5);
  const [backupPageSize, setBackupPageSize] = useState(5);
  const [auditError, setAuditError] = useState('');
  const [backupError, setBackupError] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [isAuditLoading, setAuditLoading] = useState(false);
  const [isBackupLoading, setBackupLoading] = useState(false);
  const [isBackupRunning, setBackupRunning] = useState(false);
  const [isRestoreRunning, setRestoreRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    setAuditError('');
    try {
      const data = await getAuditLogs({
        search: auditSearch,
        type: auditType,
        status: auditStatus,
        dateFrom: auditDateFrom,
        dateTo: auditDateTo,
        page: auditPage,
        pageSize: auditPageSize,
      });
      setAuditData(data);
    } catch (error: any) {
      setAuditData(emptyAuditData);
      setAuditError(error.response?.data?.message || 'Gagal mengambil audit log.');
    } finally {
      setAuditLoading(false);
    }
  };

  const loadBackupLogs = async () => {
    setBackupLoading(true);
    setBackupError('');
    try {
      const data = await getBackupLogs({ page: backupPage, pageSize: backupPageSize });
      setBackupData(data);
    } catch (error: any) {
      setBackupData(emptyBackupData);
      setBackupError(error.response?.data?.message || 'Gagal mengambil riwayat backup.');
    } finally {
      setBackupLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [auditSearch, auditType, auditStatus, auditDateFrom, auditDateTo, auditPage, auditPageSize]);

  useEffect(() => {
    loadBackupLogs();
  }, [backupPage, backupPageSize]);

  const stats = useMemo(() => {
    const successItems = backupData.items.filter((item) => item.status === 'Berhasil');
    const totalSize = successItems.reduce((total, item) => total + item.sizeBytes, 0);
    return {
      total: backupData.pagination.total,
      success: successItems.length,
      lastBackup: successItems[0]?.date.split(' ')[0] ?? '-',
      totalSize: formatBytes(totalSize),
    };
  }, [backupData]);

  const resetAuditFilters = () => {
    setAuditSearch('');
    setAuditType('');
    setAuditStatus('');
    setAuditDateFrom('');
    setAuditDateTo('');
    setAuditPage(1);
  };

  const handleBackup = async () => {
    setBackupRunning(true);
    setBackupError('');
    try {
      const { blob, fileName } = await createBackup();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setBackupPage(1);
      await loadBackupLogs();
    } catch (error: any) {
      setBackupError(error.response?.data?.message || 'Gagal membuat backup database.');
      await loadBackupLogs();
    } finally {
      setBackupRunning(false);
    }
  };

  const handleFile = (file: File | null) => {
    setRestoreError('');
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.sql')) {
      setRestoreError('File restore wajib berformat .sql.');
      return;
    }
    if (file.size > maxRestoreSize) {
      setRestoreError('Ukuran file restore maksimal 100 MB.');
      return;
    }
    setRestoreFile(file);
    setRestoreConfirmModalOpen(true);
  };

  const handleRestore = async () => {
    if (!restoreFile) return;

    setRestoreRunning(true);
    setRestoreError('');
    try {
      await restoreBackup(restoreFile);
      setRestoreConfirmModalOpen(false);
      setRestoreFile(null);
      setBackupPage(1);
      await loadBackupLogs();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal restore database.';
      const detail = error.response?.data?.detail;
      setRestoreError(detail ? `${message} ${detail}` : message);
      await loadBackupLogs();
    } finally {
      setRestoreRunning(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 md:p-8">
      <div style={{ marginBottom: '2.75rem' }}>
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', width: '2.75rem', height: '2.75rem' }}>
            <Shield style={{ width: '1.4rem', height: '1.4rem' }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Keamanan Sistem</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pantau aktivitas sistem dan kelola cadangan data</p>
          </div>
        </div>
      </div>

      <div className="inline-flex w-max gap-1 rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-soft)]" style={{ marginBottom: '2rem' }}>
        {[
          { key: 'audit', label: 'Audit Log', icon: Activity },
          { key: 'backup', label: 'Backup & Restore', icon: Database },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as 'audit' | 'backup')}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={activeTab === key ? { background: 'var(--primary)', color: 'var(--primary-foreground)' } : { color: 'var(--muted-foreground)' }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {activeTab === 'audit' ? (
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <div className="relative min-w-[220px] max-w-sm flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(event) => {
                    setAuditSearch(event.target.value);
                    setAuditPage(1);
                  }}
                  placeholder="Cari aktivitas..."
                  className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={auditType} onChange={(event) => { setAuditType(event.target.value); setAuditPage(1); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15">
                  <option value="">Semua Aktivitas</option>
                  <option value="Login">Login</option>
                  <option value="CRUD">CRUD</option>
                </select>
                <select value={auditStatus} onChange={(event) => { setAuditStatus(event.target.value); setAuditPage(1); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15">
                  <option value="">Semua Status</option>
                  <option value="Berhasil">Berhasil</option>
                  <option value="Gagal">Gagal</option>
                </select>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15">
                  <div className="relative">
                    <input type="date" value={auditDateFrom} onChange={(event) => { setAuditDateFrom(event.target.value); setAuditPage(1); }} className="admin-date-input bg-transparent text-sm outline-none" onClick={openDatePicker} style={{ width: '9.25rem', paddingRight: '1.75rem' }} />
                    <Calendar className="text-muted-foreground" style={{ position: 'absolute', right: '0.125rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="relative">
                    <input type="date" value={auditDateTo} onChange={(event) => { setAuditDateTo(event.target.value); setAuditPage(1); }} className="admin-date-input bg-transparent text-sm outline-none" onClick={openDatePicker} style={{ width: '9.25rem', paddingRight: '1.75rem' }} />
                    <Calendar className="text-muted-foreground" style={{ position: 'absolute', right: '0.125rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <button type="button" onClick={resetAuditFilters} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted">
                  <Filter className="h-4 w-4" />
                  Atur Ulang
                </button>
              </div>
            </div>

            {auditError && <p className="m-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{auditError}</p>}

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="px-6 py-3 font-medium">Waktu</th>
                    <th className="px-6 py-3 font-medium">Pengguna</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 text-center font-medium">Tipe Aktivitas</th>
                    <th className="px-6 py-3 font-medium">Deskripsi</th>
                    <th className="px-6 py-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isAuditLoading ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Memuat audit log...</td></tr>
                  ) : auditData.items.length > 0 ? (
                    auditData.items.map((log) => (
                      <tr key={log.id} onClick={() => setSelectedAuditLog(log)} className="cursor-pointer transition-colors hover:bg-muted/40">
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-muted-foreground">{log.timestamp}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{log.user}</td>
                        <td className="px-6 py-4 text-muted-foreground">{log.role}</td>
                        <td className="px-6 py-4 text-center"><ActivityBadge type={log.type} /></td>
                        <td className="px-6 py-4 text-foreground/80">{log.description}</td>
                        <td className="px-6 py-4 text-center"><StatusBadge status={log.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                        <div className="mx-auto max-w-sm rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5">
                          <p className="text-sm font-medium text-foreground">Belum ada log aktivitas.</p>
                          <p className="mt-1 text-xs text-muted-foreground">Riwayat aktivitas sistem akan muncul di tabel ini.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={Math.min(auditPage, auditData.pagination.totalPages)}
              pageSize={auditPageSize}
              total={auditData.pagination.total}
              totalPages={auditData.pagination.totalPages}
              onPageChange={setAuditPage}
              onPageSizeChange={setAuditPageSize}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Total Riwayat', value: stats.total, icon: Database, color: 'var(--primary)', bg: 'var(--primary-soft)' },
                { label: 'Berhasil', value: stats.success, icon: CheckCircle2, color: 'var(--status-success)', bg: 'var(--status-success-bg)' },
                { label: 'Cadangan Terakhir', value: stats.lastBackup, icon: Clock, color: 'var(--activity-pimpinan)', bg: 'var(--activity-pimpinan-bg)' },
                { label: 'Ukuran Berhasil', value: stats.totalSize, icon: HardDrive, color: 'var(--activity-crud)', bg: 'var(--activity-crud-bg)' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: item.bg, color: item.color }}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-1">
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
                  <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--primary), var(--activity-crud))' }} />
                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Cadangkan Basis Data</h3>
                        <p className="text-xs text-muted-foreground">Unduh file .sql ke perangkat admin</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleBackup}
                      disabled={isBackupRunning}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-all disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 82%, white))', color: 'var(--primary-foreground)', borderColor: 'color-mix(in oklab, var(--primary) 55%, transparent)', boxShadow: '0 10px 20px color-mix(in oklab, var(--primary) 25%, transparent)' }}
                    >
                      {isBackupRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                      {isBackupRunning ? 'Mencadangkan...' : 'Cadangkan Sekarang'}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
                  <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--activity-pimpinan), var(--status-failed))' }} />
                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--activity-pimpinan-bg)', color: 'var(--activity-pimpinan)' }}>
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Pulihkan Basis Data</h3>
                        <p className="text-xs text-muted-foreground">Unggah file .sql</p>
                      </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".sql" className="hidden" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleFile(event.dataTransfer.files?.[0] ?? null);
                      }}
                      className="group flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]/40"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm transition group-hover:scale-105">
                        <Upload className="h-5 w-5 text-muted-foreground transition group-hover:text-[var(--primary)]" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Klik atau seret & lepas</p>
                      <p className="mt-1 text-xs text-muted-foreground">Hanya file .sql, maks 100 MB</p>
                    </div>
                    {restoreError && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{restoreError}</p>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] lg:col-span-2">
                <div className="flex items-center justify-between border-b border-border px-6" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                  <div>
                    <h3 className="font-semibold text-foreground">Riwayat Backup & Restore</h3>
                    <p className="text-xs text-muted-foreground">Snapshot dan pemulihan terbaru beserta statusnya</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{backupData.pagination.total} entri</span>
                </div>
                {(backupError || restoreError) && <p className="m-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{backupError || restoreError}</p>}
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-6 py-3 font-medium">Tanggal Dibuat</th>
                        <th className="px-6 py-3 font-medium">Dibuat Oleh</th>
                        <th className="px-6 py-3 font-medium">Aksi</th>
                        <th className="px-6 py-3 font-medium">File</th>
                        <th className="px-6 py-3 font-medium">Ukuran</th>
                        <th className="px-6 py-3 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isBackupLoading ? (
                        <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Memuat riwayat backup...</td></tr>
                      ) : backupData.items.length > 0 ? (
                        backupData.items.map((log) => (
                          <tr key={log.id} title={log.errorMessage || undefined} className="transition hover:bg-muted/40">
                            <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-muted-foreground">{log.date}</td>
                            <td className="px-6 py-4 font-medium text-foreground">{log.user}</td>
                            <td className="px-6 py-4 text-muted-foreground">{log.action === 'backup' ? 'Backup' : 'Restore'}</td>
                            <td className="max-w-[220px] truncate px-6 py-4 text-muted-foreground">{log.fileName || '-'}</td>
                            <td className="px-6 py-4 text-muted-foreground">{formatBytes(log.sizeBytes)}</td>
                            <td className="px-6 py-4 text-center"><StatusBadge status={log.status} /></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center">
                            <div className="mx-auto max-w-sm rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5">
                              <p className="text-sm font-medium text-foreground">Belum ada riwayat backup.</p>
                              <p className="mt-1 text-xs text-muted-foreground">Data backup akan muncul di tabel ini setelah tersedia.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={Math.min(backupPage, backupData.pagination.totalPages)}
                  pageSize={backupPageSize}
                  total={backupData.pagination.total}
                  totalPages={backupData.pagination.totalPages}
                  onPageChange={setBackupPage}
                  onPageSizeChange={setBackupPageSize}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedAuditLog && (
        <Modal onClose={() => setSelectedAuditLog(null)} title="Detail Aktivitas" size="lg">
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Deskripsi</p>
              <p className="font-medium text-foreground">{selectedAuditLog.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Waktu" value={selectedAuditLog.timestamp} mono />
              <Field label="Status"><StatusBadge status={selectedAuditLog.status} /></Field>
              <Field label="Pengguna" value={selectedAuditLog.user} />
              <Field label="Role" value={selectedAuditLog.role} />
              <Field label="Tipe Aktivitas"><ActivityBadge type={selectedAuditLog.type} /></Field>
              <Field label="Resource" value={selectedAuditLog.resource || '-'} />
              <Field label="IP" value={selectedAuditLog.ipAddress || '-'} mono />
              <Field label="Perangkat" value={selectedAuditLog.userAgent || '-'} />
            </div>
          </div>
          <ModalFooter>
            <button type="button" onClick={() => setSelectedAuditLog(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
              Tutup
            </button>
          </ModalFooter>
        </Modal>
      )}

      {isRestoreConfirmModalOpen && (
        <Modal onClose={() => !isRestoreRunning && setRestoreConfirmModalOpen(false)} title="" size="lg" hideHeader>
          <div className="restore-confirm-dialog">
            <div className="restore-confirm-dialog__glow" />
            <button
              type="button"
              aria-label="Tutup dialog"
              disabled={isRestoreRunning}
              onClick={() => setRestoreConfirmModalOpen(false)}
              className="restore-confirm-dialog__close"
            >
              <X />
            </button>

            <div className="restore-confirm-dialog__body">
              <div className="restore-confirm-dialog__icon">
                <Database />
              </div>

              <p className="restore-confirm-dialog__eyebrow">
                Konfirmasi pemulihan
              </p>
              <h3 className="restore-confirm-dialog__title">Pulihkan basis data?</h3>
              <p className="restore-confirm-dialog__description">
                Sistem akan mengganti struktur dan data saat ini dengan isi cadangan yang dipilih.
              </p>

              {restoreFile && (
                <div className="restore-confirm-dialog__file">
                  <div className="restore-confirm-dialog__file-icon">
                    <FileText />
                  </div>
                  <div className="restore-confirm-dialog__file-copy">
                    <p className="restore-confirm-dialog__file-name">{restoreFile.name}</p>
                    <p className="restore-confirm-dialog__file-meta">{formatBytes(restoreFile.size)} · File cadangan SQL</p>
                  </div>
                  <span className="restore-confirm-dialog__file-badge">SQL</span>
                </div>
              )}

              <div className="restore-confirm-dialog__warning">
                <AlertCircle />
                <div>
                  <p className="restore-confirm-dialog__warning-title">Pastikan cadangan ini sudah benar</p>
                  <p className="restore-confirm-dialog__warning-copy">
                    Proses tidak dapat dibatalkan setelah selesai. Jika terjadi kesalahan saat restore, seluruh perubahan akan otomatis dibatalkan.
                  </p>
                </div>
              </div>

              {restoreError && (
                <div className="restore-confirm-dialog__error">
                  <AlertCircle />
                  <p>{restoreError}</p>
                </div>
              )}
            </div>
          </div>
          <div className="restore-confirm-dialog__footer">
            <button type="button" disabled={isRestoreRunning} onClick={() => { setRestoreConfirmModalOpen(false); setRestoreFile(null); }} className="restore-confirm-dialog__button restore-confirm-dialog__button--cancel">
              Batal
            </button>
            <button type="button" disabled={isRestoreRunning} onClick={handleRestore} className="restore-confirm-dialog__button restore-confirm-dialog__button--restore">
              {isRestoreRunning ? <RefreshCw className="animate-spin" /> : <Database />}
              {isRestoreRunning ? 'Sedang memulihkan...' : 'Ya, pulihkan sekarang'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
  size = 'md',
  hideHeader,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  size?: 'md' | 'lg';
  hideHeader?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'oklch(0.18 0.03 260 / 0.45)' }} onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className={`w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)] ${size === 'lg' ? 'max-w-lg' : 'max-w-sm'}`}>
        {!hideHeader && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4">{children}</div>;
}

function Field({ label, value, children, mono }: { label: string; value?: string; children?: ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      {children ?? <p className={`text-sm font-medium text-foreground ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>}
    </div>
  );
}

export default SistemView;
