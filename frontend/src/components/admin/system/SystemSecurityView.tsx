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
  { id: 1, timestamp: "2026-04-17 08:30:15", user: "Admin System", role: "Admin", type: "Login", description: "User login success", status: "Success" },
  { id: 2, timestamp: "2026-04-17 09:12:00", user: "Budi Santoso", role: "Pimpinan", type: "CRUD", description: "Generate monthly report", status: "Success" },
  { id: 3, timestamp: "2026-04-17 10:05:40", user: "Siti Aminah", role: "User", type: "CRUD", description: "Update profile information", status: "Success" },
  { id: 4, timestamp: "2026-04-17 11:20:10", user: "Unknown", role: "User", type: "Login", description: "Failed login attempt due to wrong password", status: "Failed" },
  { id: 5, timestamp: "2026-04-17 13:45:00", user: "Admin System", role: "Admin", type: "CRUD", description: "Change system configuration", status: "Success" },
  { id: 6, timestamp: "2026-04-17 15:30:25", user: "Siti Aminah", role: "User", type: "Logout", description: "User manual logout", status: "Success" },
];

const mockBackupLogs = [
  { id: 1, date: "2026-04-16 23:59:00", user: "System Auto", size: "14.2 MB", status: "Success" },
  { id: 2, date: "2026-04-15 23:59:00", user: "System Auto", size: "14.1 MB", status: "Success" },
  { id: 3, date: "2026-04-14 14:20:00", user: "Admin System", size: "14.1 MB", status: "In Progress" },
  { id: 4, date: "2026-04-10 23:59:00", user: "System Auto", size: "0 Bytes", status: "Failed" },
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
  Success: { bg: "var(--status-success-bg)", fg: "var(--status-success)" },
  Failed: { bg: "var(--status-failed-bg)", fg: "var(--status-failed)" },
  "In Progress": { bg: "var(--status-progress-bg)", fg: "var(--status-progress)" },
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
      {status === "Success" && <CheckCircle2 className="h-3 w-3" />}
      {status === "Failed" && <AlertCircle className="h-3 w-3" />}
      {status === "In Progress" && <RefreshCw className="h-3 w-3 animate-spin" />}
      {status}
    </span>
  );
};

export function SystemSecurityView() {
  const [activeTab, setActiveTab] = useState<"audit" | "backup">("audit");
  const [selectedAuditLog, setSelectedAuditLog] = useState<(typeof mockAuditLogs)[number] | null>(null);
  const [isBackupLocationModalOpen, setBackupLocationModalOpen] = useState(false);
  const [isBackupConfirmModalOpen, setBackupConfirmModalOpen] = useState(false);
  const [isRestoreConfirmModalOpen, setRestoreConfirmModalOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const successCount = mockBackupLogs.filter((b) => b.status === "Success").length;
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

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 md:p-8">
      {/* Header */}
      <div style={{ marginBottom: "2.25rem" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
          >
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              System Security
            </h1>
            <p className="mt-1 text-sm text-muted-foreground" style={{ marginBottom: "0.75rem" }}>
              Monitor system activity and manage backups
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
                  placeholder="Search activity..."
                  className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15">
                  <option value="">All Events</option>
                  <option>Login / Logout</option>
                  <option>Admin Activity</option>
                  <option>Pimpinan Activity</option>
                  <option>CRUD Activity</option>
                </select>

                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input type="date" className="bg-transparent text-sm outline-none" />
                  <span className="text-muted-foreground">–</span>
                  <input type="date" className="bg-transparent text-sm outline-none" />
                </div>

                <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted">
                  <Filter className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 text-center font-medium">Activity Type</th>
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-6 py-3 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockAuditLogs.map((log) => (
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
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Total Backups", value: stats.total, icon: Database, color: "var(--primary)", bg: "var(--primary-soft)" },
                { label: "Successful", value: stats.success, icon: CheckCircle2, color: "var(--status-success)", bg: "var(--status-success-bg)" },
                { label: "Last Backup", value: stats.lastBackup, icon: Clock, color: "var(--activity-pimpinan)", bg: "var(--activity-pimpinan-bg)" },
                { label: "Storage Used", value: stats.totalSize, icon: HardDrive, color: "var(--activity-crud)", bg: "var(--activity-crud-bg)" },
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
                        <h3 className="font-semibold text-foreground">Database Backup</h3>
                        <p className="text-xs text-muted-foreground">Create a secure snapshot</p>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Auto-backup</span>
                      <span className="font-medium" style={{ color: "var(--status-success)" }}>
                        Daily · 23:59
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
                      Backup Now
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
                        <h3 className="font-semibold text-foreground">Restore Database</h3>
                        <p className="text-xs text-muted-foreground">Upload a .sql file</p>
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
                      <p className="text-sm font-medium text-foreground">Click or drag & drop</p>
                      <p className="mt-1 text-xs text-muted-foreground">.sql file only · max 100 MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: History */}
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] lg:col-span-2">
                <div className="flex items-center justify-between border-b border-border p-5">
                  <div>
                    <h3 className="font-semibold text-foreground">Backup History</h3>
                    <p className="text-xs text-muted-foreground">Recent snapshots and their status</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {mockBackupLogs.length} entries
                  </span>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date Created</th>
                        <th className="px-6 py-3 font-medium">Created By</th>
                        <th className="px-6 py-3 font-medium">File Size</th>
                        <th className="px-6 py-3 text-center font-medium">Status</th>
                        <th className="px-6 py-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockBackupLogs.map((log) => (
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
                              disabled={log.status !== "Success"}
                              title="Download backup"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {selectedAuditLog && (
        <Modal onClose={() => setSelectedAuditLog(null)} title="Activity Details" size="lg">
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Description</p>
              <p className="font-medium text-foreground">{selectedAuditLog.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Timestamp" value={selectedAuditLog.timestamp} mono />
              <Field label="Status">
                <StatusBadge status={selectedAuditLog.status} />
              </Field>
              <Field label="User" value={selectedAuditLog.user} />
              <Field label="Role" value={selectedAuditLog.role} />
              <Field label="Activity Type">
                <ActivityBadge type={selectedAuditLog.type} />
              </Field>
              <Field label="IP / Device" value="192.168.1.104 · Chrome" mono />
            </div>
          </div>
          <ModalFooter>
            <button
              onClick={() => setSelectedAuditLog(null)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Close
            </button>
          </ModalFooter>
        </Modal>
      )}

      {isBackupLocationModalOpen && (
        <Modal onClose={() => setBackupLocationModalOpen(false)} title="Create Backup">
          <div className="p-6">
            <label className="mb-2 block text-sm font-medium text-foreground">Location Name</label>
            <input
              type="text"
              defaultValue="Default Local Storage"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
            />
            <div
              className="mt-4 flex items-start gap-2 rounded-lg p-3 text-sm"
              style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
            >
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>
                Backup generates a secure <code className="font-mono text-xs">.sql</code> file you can download.
              </p>
            </div>
          </div>
          <ModalFooter>
            <button
              onClick={() => setBackupLocationModalOpen(false)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setBackupLocationModalOpen(false);
                setBackupConfirmModalOpen(true);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium transition hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Start Backup
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
            <h3 className="mb-2 text-lg font-semibold text-foreground">Confirm Backup</h3>
            <p className="mx-auto max-w-xs text-sm text-muted-foreground">
              Create a database backup now? Performance may slightly reduce during the process.
            </p>
          </div>
          <ModalFooter>
            <button
              onClick={() => setBackupConfirmModalOpen(false)}
              className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={() => setBackupConfirmModalOpen(false)}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Confirm
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
            <h3 className="mb-3 text-xl font-bold text-foreground">Restore Database</h3>

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
                <p className="mb-1 font-bold">CRITICAL WARNING</p>
                <p>This will overwrite all existing data. Current state will be permanently lost unless backed up first.</p>
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
              Cancel
            </button>
            <button
              onClick={() => {
                setRestoreConfirmModalOpen(false);
                setRestoreFile(null);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: "var(--status-failed)" }}
            >
              Restore Database
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
