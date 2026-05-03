import React, { useMemo, useRef, useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  X,
  Shield,
  Database,
  Calendar,
  FileText,
  Activity,
  HardDrive,
  Clock,
  CheckCircle2,
} from "lucide-react";

// --- MOCK DATA ---
const mockAuditLogs = [
  { id: 1, timestamp: "2026-04-17 08:30:15", user: "Admin Sistem", role: "Admin", type: "Login", description: "Pengguna berhasil login", status: "Berhasil" },
  { id: 2, timestamp: "2026-04-17 09:12:00", user: "Budi Santoso", role: "Pimpinan", type: "CRUD", description: "Membuat laporan bulanan", status: "Berhasil" },
  { id: 3, timestamp: "2026-04-17 10:05:40", user: "Siti Aminah", role: "Pengguna", type: "CRUD", description: "Memperbarui informasi profil", status: "Berhasil" },
  { id: 4, timestamp: "2026-04-17 11:20:10", user: "Tidak Dikenal", role: "Pengguna", type: "Login", description: "Percobaan login gagal karena kata sandi salah", status: "Gagal" },
  { id: 5, timestamp: "2026-04-17 13:45:00", user: "Admin Sistem", role: "Admin", type: "CRUD", description: "Mengubah konfigurasi sistem", status: "Berhasil" },
  { id: 6, timestamp: "2026-04-17 15:30:25", user: "Siti Aminah", role: "Pengguna", type: "Logout", description: "Pengguna logout secara manual", status: "Berhasil" },
];

const mockBackupLogs = [
  { id: 1, date: "2026-04-16 23:59:00", user: "Sistem Otomatis", size: "14.2 MB", status: "Berhasil" },
  { id: 2, date: "2026-04-15 23:59:00", user: "Sistem Otomatis", size: "14.1 MB", status: "Berhasil" },
  { id: 3, date: "2026-04-14 14:20:00", user: "Admin Sistem", size: "14.1 MB", status: "Diproses" },
  { id: 4, date: "2026-04-10 23:59:00", user: "Sistem Otomatis", size: "0 Bytes", status: "Gagal" },
];

// --- TOKENS ---
const activityStyles: Record<string, { bg: string; fg: string }> = {
  Login: { bg: "var(--activity-login-bg)", fg: "var(--activity-login)" },
  Logout: { bg: "var(--activity-logout-bg)", fg: "var(--activity-logout)" },
  CRUD: { bg: "var(--activity-crud-bg)", fg: "var(--activity-crud)" },
  // "Admin Activity": { bg: "var(--activity-admin-bg)", fg: "var(--activity-admin)" },
  // "Pimpinan Activity": { bg: "var(--activity-pimpinan-bg)", fg: "var(--activity-pimpinan)" },
};

const statusStyles: Record<string, { bg: string; fg: string }> = {
  Berhasil: { bg: "var(--status-success-bg)", fg: "var(--status-success)" },
  Gagal: { bg: "var(--status-failed-bg)", fg: "var(--status-failed)" },
  Diproses: { bg: "var(--status-progress-bg)", fg: "var(--status-progress)" },
};

const ActivityBadge = ({ type }: { type: string }) => {
  const s = activityStyles[type] ?? { bg: "var(--muted)", fg: "var(--muted-foreground)" };
  return (
    <span
      className="inline-flex w-24 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.fg }}
      title={type}
    >
      <span className="truncate">{type}</span>
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusStyles[status] ?? { bg: "var(--muted)", fg: "var(--muted-foreground)" };
  return (
    <span
      className="inline-flex w-24 items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {status === "Berhasil" && <CheckCircle2 className="h-3 w-3" />}
      {status === "Gagal" && <AlertCircle className="h-3 w-3" />}
      {status === "Diproses" && <RefreshCw className="h-3 w-3 animate-spin" />}
      {status}
    </span>
  );
};

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage === 1) {
    return [1, 2, 3, totalPages];
  }

  if (currentPage >= totalPages - 1) {
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return Array.from(
    new Set([currentPage - 1, currentPage, currentPage + 1, totalPages].filter((page) => page >= 1 && page <= totalPages)),
  ).sort((a, b) => a - b);
}

export function SystemSecurityView() {
  const pageSizeOptions = [5, 10, 20];
  const [activeTab, setActiveTab] = useState<"audit" | "backup">("audit");
  const [selectedAuditLog, setSelectedAuditLog] = useState<(typeof mockAuditLogs)[number] | null>(null);
  const [isBackupLocationModalOpen, setBackupLocationModalOpen] = useState(false);
  const [isBackupConfirmModalOpen, setBackupConfirmModalOpen] = useState(false);
  const [isRestoreConfirmModalOpen, setRestoreConfirmModalOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [backupPage, setBackupPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(5);
  const [backupPageSize, setBackupPageSize] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const successCount = mockBackupLogs.filter((b) => b.status === "Berhasil").length;
    return {
      total: mockBackupLogs.length,
      success: successCount,
      lastBackup: mockBackupLogs[0]?.date.split(" ")[0] ?? "—",
      totalSize: "42.4 MB",
    };
  }, []);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".sql")) return;
    setRestoreFile(file);
    setRestoreConfirmModalOpen(true);
  };

  const totalAuditPages = Math.max(1, Math.ceil(mockAuditLogs.length / auditPageSize));
  const totalBackupPages = Math.max(1, Math.ceil(mockBackupLogs.length / backupPageSize));

  const normalizedAuditPage = Math.min(auditPage, totalAuditPages);
  const normalizedBackupPage = Math.min(backupPage, totalBackupPages);

  const paginatedAuditLogs = mockAuditLogs.slice((normalizedAuditPage - 1) * auditPageSize, normalizedAuditPage * auditPageSize);
  const paginatedBackupLogs = mockBackupLogs.slice((normalizedBackupPage - 1) * backupPageSize, normalizedBackupPage * backupPageSize);

  const auditStart = mockAuditLogs.length === 0 ? 0 : (normalizedAuditPage - 1) * auditPageSize + 1;
  const auditEnd = Math.min(normalizedAuditPage * auditPageSize, mockAuditLogs.length);
  const backupStart = mockBackupLogs.length === 0 ? 0 : (normalizedBackupPage - 1) * backupPageSize + 1;
  const backupEnd = Math.min(normalizedBackupPage * backupPageSize, mockBackupLogs.length);
  const auditVisiblePages = getAdaptivePages(normalizedAuditPage, totalAuditPages);
  const backupVisiblePages = getAdaptivePages(normalizedBackupPage, totalBackupPages);

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 md:p-8">
      {/* Header */}
      <div style={{ marginBottom: "2.75rem" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--primary-soft)", color: "var(--primary)", width: "2.75rem", height: "2.75rem" }}
          >
            <Shield style={{ width: "1.4rem", height: "1.4rem" }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Keamanan Sistem
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pantau aktivitas sistem dan kelola cadangan data
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="inline-flex w-max gap-1 rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-soft)]"
        style={{ marginBottom: "2rem" }}
      >
        {[
          { key: "audit", label: "Audit Log", icon: Activity },
          { key: "backup", label: "Backup & Restore", icon: Database },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "audit" | "backup")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            style={
              activeTab === key
                ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                : { color: "var(--muted-foreground)" }
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        {activeTab === "audit" ? (
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari aktivitas..."
                  className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15">
                  <option value="">Semua Aktivitas</option>
                  <option>Login / Logout</option>
                  <option>Aktivitas Admin</option>
                  <option>Aktivitas Pimpinan</option>
                  <option>Aktivitas CRUD</option>
                </select>

                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input type="date" className="bg-transparent text-sm outline-none" />
                  <span className="text-muted-foreground">–</span>
                  <input type="date" className="bg-transparent text-sm outline-none" />
                </div>

                <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted">
                  <Filter className="h-4 w-4" />
                  Atur Ulang
                </button>
              </div>
            </div>

            {/* Table */}
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
                  {paginatedAuditLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedAuditLog(log)}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-muted-foreground">{log.timestamp}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{log.user}</td>
                      <td className="px-6 py-4 text-muted-foreground">{log.role}</td>
                      <td className="px-6 py-4 text-center">
                        <ActivityBadge type={log.type} />
                      </td>
                      <td className="px-6 py-4 text-foreground/80">{log.description}</td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Menampilkan {auditStart}-{auditEnd} dari {mockAuditLogs.length} data
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
                  <span className="text-xs text-muted-foreground">Tampilkan</span>
                  <select
                    value={auditPageSize}
                    onChange={(e) => {
                      setAuditPageSize(Number(e.target.value));
                      setAuditPage(1);
                    }}
                    className="text-xs font-medium outline-none"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setAuditPage((prev) => Math.max(1, prev - 1))}
                  disabled={normalizedAuditPage === 1}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                {auditVisiblePages.map((page, idx) => (
                  <React.Fragment key={page}>
                    {idx > 0 && page - auditVisiblePages[idx - 1] > 1 && (
                      <span className="px-1 text-xs text-muted-foreground">...</span>
                    )}
                  <button
                    onClick={() => setAuditPage(page)}
                    className="rounded-lg border py-1 text-xs font-medium transition"
                    style={{
                      minWidth: "2rem",
                      paddingLeft: "0.1rem",
                      paddingRight: "0.1rem",
                      ...(page === normalizedAuditPage
                        ? { background: "var(--primary)", color: "var(--primary-foreground)", borderColor: "var(--primary)" }
                        : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }),
                    }}
                  >
                    {page}
                  </button>
                  </React.Fragment>
                ))}
                <button
                  onClick={() => setAuditPage((prev) => Math.min(totalAuditPages, prev + 1))}
                  disabled={normalizedAuditPage === totalAuditPages}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Total Cadangan", value: stats.total, icon: Database, color: "var(--primary)", bg: "var(--primary-soft)" },
                { label: "Berhasil", value: stats.success, icon: CheckCircle2, color: "var(--status-success)", bg: "var(--status-success-bg)" },
                { label: "Cadangan Terakhir", value: stats.lastBackup, icon: Clock, color: "var(--activity-pimpinan)", bg: "var(--activity-pimpinan-bg)" },
                { label: "Penyimpanan Terpakai", value: stats.totalSize, icon: HardDrive, color: "var(--activity-crud)", bg: "var(--activity-crud-bg)" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: s.bg, color: s.color }}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-semibold text-foreground">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* LEFT: Actions */}
              <div className="flex flex-col gap-6 lg:col-span-1">
                {/* Backup */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
                  <div
                    className="h-1.5 w-full"
                    style={{ background: "linear-gradient(90deg, var(--primary), var(--activity-crud))" }}
                  />
                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
                      >
                        <Download className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Cadangan Basis Data</h3>
                        <p className="text-xs text-muted-foreground">Buat salinan data saat ini</p>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Cadangan Otomatis</span>
                      <span className="font-medium" style={{ color: "var(--status-success)" }}>
                        Harian · 23:59
                      </span>
                    </div>

                    <button
                      onClick={() => setBackupLocationModalOpen(true)}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-all"
                      style={{
                        background: "linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 82%, white))",
                        color: "var(--primary-foreground)",
                        borderColor: "color-mix(in oklab, var(--primary) 55%, transparent)",
                        boxShadow: "0 10px 20px color-mix(in oklab, var(--primary) 25%, transparent)",
                      }}
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: "color-mix(in oklab, white 20%, transparent)" }}
                      >
                        <Database className="h-3.5 w-3.5" />
                      </span>
                      Cadangkan Sekarang
                    </button>
                  </div>
                </div>

                {/* Restore */}
                <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
                  <div
                    className="h-1.5 w-full"
                    style={{ background: "linear-gradient(90deg, var(--activity-pimpinan), var(--status-failed))" }}
                  />
                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: "var(--activity-pimpinan-bg)", color: "var(--activity-pimpinan)" }}
                      >
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Pulihkan Basis Data</h3>
                        <p className="text-xs text-muted-foreground">Unggah file .sql</p>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".sql"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFile(e.dataTransfer.files?.[0] ?? null);
                      }}
                      className="group flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]/40"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm transition group-hover:scale-105">
                        <Upload className="h-5 w-5 text-muted-foreground transition group-hover:text-[var(--primary)]" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Klik atau seret & lepas</p>
                      <p className="mt-1 text-xs text-muted-foreground">Hanya file .sql · maks 100 MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: History */}
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] lg:col-span-2">
                <div
                  className="flex items-center justify-between border-b border-border px-6"
                  style={{ paddingTop: "1rem", paddingBottom: "1rem" }}
                >
                  <div>
                    <h3 className="font-semibold text-foreground">Riwayat Cadangan</h3>
                    <p className="text-xs text-muted-foreground">Snapshot terbaru beserta statusnya</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {mockBackupLogs.length} entri
                  </span>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-6 py-3 font-medium">Tanggal Dibuat</th>
                        <th className="px-6 py-3 font-medium">Dibuat Oleh</th>
                        <th className="px-6 py-3 font-medium">Ukuran File</th>
                        <th className="px-6 py-3 text-center font-medium">Status</th>
                        <th className="px-6 py-3 text-right font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedBackupLogs.map((log) => (
                        <tr key={log.id} className="transition hover:bg-muted/40">
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-muted-foreground">{log.date}</td>
                          <td className="px-6 py-4 font-medium text-foreground">{log.user}</td>
                          <td className="px-6 py-4 text-muted-foreground">{log.size}</td>
                          <td className="px-6 py-4 text-center">
                            <StatusBadge status={log.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className="rounded-lg p-2 text-muted-foreground transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                              disabled={log.status !== "Berhasil"}
                              title="Unduh cadangan"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Menampilkan {backupStart}-{backupEnd} dari {mockBackupLogs.length} data
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
                      <span className="text-xs text-muted-foreground">Tampilkan</span>
                      <select
                        value={backupPageSize}
                        onChange={(e) => {
                          setBackupPageSize(Number(e.target.value));
                          setBackupPage(1);
                        }}
                        className="text-xs font-medium outline-none"
                      >
                        {pageSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => setBackupPage((prev) => Math.max(1, prev - 1))}
                      disabled={normalizedBackupPage === 1}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    {backupVisiblePages.map((page, idx) => (
                      <React.Fragment key={page}>
                        {idx > 0 && page - backupVisiblePages[idx - 1] > 1 && (
                          <span className="px-1 text-xs text-muted-foreground">...</span>
                        )}
                      <button
                        onClick={() => setBackupPage(page)}
                        className="rounded-lg border py-1 text-xs font-medium transition"
                        style={{
                          minWidth: "2rem",
                          paddingLeft: "0.1rem",
                          paddingRight: "0.1rem",
                          ...(page === normalizedBackupPage
                            ? { background: "var(--primary)", color: "var(--primary-foreground)", borderColor: "var(--primary)" }
                            : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }),
                        }}
                      >
                        {page}
                      </button>
                      </React.Fragment>
                    ))}
                    <button
                      onClick={() => setBackupPage((prev) => Math.min(totalBackupPages, prev + 1))}
                      disabled={normalizedBackupPage === totalBackupPages}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {selectedAuditLog && (
        <Modal onClose={() => setSelectedAuditLog(null)} title="Detail Aktivitas" size="lg">
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Deskripsi</p>
              <p className="font-medium text-foreground">{selectedAuditLog.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Waktu" value={selectedAuditLog.timestamp} mono />
              <Field label="Status">
                <StatusBadge status={selectedAuditLog.status} />
              </Field>
              <Field label="Pengguna" value={selectedAuditLog.user} />
              <Field label="Role" value={selectedAuditLog.role} />
              <Field label="Tipe Aktivitas">
                <ActivityBadge type={selectedAuditLog.type} />
              </Field>
              <Field label="IP / Perangkat" value="192.168.1.104 · Chrome" mono />
            </div>
          </div>
          <ModalFooter>
            <button
              onClick={() => setSelectedAuditLog(null)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Tutup
            </button>
          </ModalFooter>
        </Modal>
      )}

      {isBackupLocationModalOpen && (
        <Modal onClose={() => setBackupLocationModalOpen(false)} title="Buat Cadangan">
          <div className="p-6">
            <label className="mb-2 block text-sm font-medium text-foreground">Nama Lokasi</label>
            <input
              type="text"
              defaultValue="Penyimpanan Lokal Default"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
            />
            <div
              className="mt-4 flex items-start gap-2 rounded-lg p-3 text-sm"
              style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
            >
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Cadangan akan menghasilkan file <code className="font-mono text-xs">.sql</code> yang dapat diunduh.
              </p>
            </div>
          </div>
          <ModalFooter>
            <button
              onClick={() => setBackupLocationModalOpen(false)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Batal
            </button>
            <button
              onClick={() => {
                setBackupLocationModalOpen(false);
                setBackupConfirmModalOpen(true);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Mulai Cadangan
            </button>
          </ModalFooter>
        </Modal>
      )}

      {isBackupConfirmModalOpen && (
        <Modal onClose={() => setBackupConfirmModalOpen(false)} title="" hideHeader>
          <div className="p-6 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
            >
              <Database className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Konfirmasi Cadangan</h3>
            <p className="mx-auto max-w-xs text-sm text-muted-foreground">
              Buat cadangan basis data sekarang? Performa dapat sedikit menurun selama proses berlangsung.
            </p>
          </div>
          <ModalFooter>
            <button
              onClick={() => setBackupConfirmModalOpen(false)}
              className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Batal
            </button>
            <button
              onClick={() => setBackupConfirmModalOpen(false)}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Konfirmasi
            </button>
          </ModalFooter>
        </Modal>
      )}

      {isRestoreConfirmModalOpen && (
        <Modal
          onClose={() => {
            setRestoreConfirmModalOpen(false);
            setRestoreFile(null);
          }}
          title=""
          hideHeader
        >
          <div className="p-6 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "var(--status-failed-bg)", color: "var(--status-failed)" }}
            >
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Pulihkan Basis Data</h3>

            {restoreFile && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-mono text-foreground">
                <FileText className="h-3.5 w-3.5" />
                {restoreFile.name}
              </div>
            )}

            <div
              className="flex gap-3 rounded-lg p-4 text-left text-sm"
              style={{ background: "var(--status-failed-bg)", color: "var(--status-failed)" }}
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="mb-1 font-bold">PERINGATAN KRITIS</p>
                <p>Proses ini akan menimpa seluruh data yang ada. Kondisi saat ini akan hilang permanen jika belum dicadangkan.</p>
              </div>
            </div>
          </div>
          <ModalFooter>
            <button
              onClick={() => {
                setRestoreConfirmModalOpen(false);
                setRestoreFile(null);
              }}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Batal
            </button>
            <button
              onClick={() => {
                setRestoreConfirmModalOpen(false);
                setRestoreFile(null);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--status-failed)" }}
            >
              Pulihkan Basis Data
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

// --- Reusable Modal Primitives ---
function Modal({
  children,
  onClose,
  title,
  size = "md",
  hideHeader,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  size?: "md" | "lg";
  hideHeader?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "oklch(0.18 0.03 260 / 0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)] ${size === "lg" ? "max-w-lg" : "max-w-sm"
          }`}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4">{children}</div>
  );
}

function Field({
  label,
  value,
  children,
  mono,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      {children ?? (
        <p className={`text-sm font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
      )}
    </div>
  );
}

export default SystemSecurityView;
