import { useEffect, useMemo, useState, type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Hourglass,
  TrendingUp,
} from 'lucide-react';

import {
  getMyDashboardSummary,
  type MyDashboardSummary,
  type MyPenugasanButir,
  type PenugasanTambahan,
} from '../../api/penugasanApi';
import { getPeriodeSkpList, type PeriodeSkp } from '../../api/periodeSkpApi';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { cn } from '../ui/utils';

type KPIData = {
  label: string;
  value: string;
  detail?: string;
  icon: ElementType;
  detailIcon?: ElementType;
  color: 'blue' | 'green' | 'amber' | 'purple';
  disabled?: boolean;
};

const kpiColorMap: Record<KPIData['color'], { border: string }> = {
  blue: { border: 'border-blue-100' },
  green: { border: 'border-green-100' },
  amber: { border: 'border-amber-100' },
  purple: { border: 'border-purple-100' },
};

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

function normalizeDate(iso: string): string {
  return iso ? iso.slice(0, 10) : '';
}

function formatTanggal(iso: string): string {
  const normalized = normalizeDate(iso);
  if (!normalized) return '-';

  const [year, month, day] = normalized.split('-');
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${monthNames[Number(month)] ?? month} ${year}`;
}

function formatPeriodeLabel(periode: PeriodeSkp): string {
  return String(periode.tahun);
}

function parseLocalDate(iso: string): Date | null {
  const normalized = normalizeDate(iso);
  if (!normalized) return null;

  const [year, month, day] = normalized.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatRemainingDate(iso: string): { value: string; detail: string } {
  const date = parseLocalDate(iso);
  if (!date) return { value: '-', detail: 'Tanggal belum tersedia' };

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date < start) {
    return { value: 'Sudah lewat', detail: `TMT: ${formatTanggal(iso)}` };
  }

  let years = date.getFullYear() - start.getFullYear();
  let months = date.getMonth() - start.getMonth();
  let days = date.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [
    years > 0 ? `${years} Thn` : '',
    months > 0 ? `${months} Bln` : '',
    days > 0 || (years === 0 && months === 0) ? `${days} Hari` : '',
  ].filter(Boolean);

  return { value: parts.join(' '), detail: `TMT: ${formatTanggal(iso)}` };
}

function getTarget(item: MyPenugasanButir): number {
  return toNumber(item.targetKetercapaian);
}

function getProgressPercent(item: MyPenugasanButir): number {
  const target = getTarget(item);
  if (target <= 0) return 0;
  return Math.min(100, Math.round((item.realisasiTotal / target) * 100));
}

function getKinerjaStatus(item: MyPenugasanButir): string {
  const target = getTarget(item);
  if (target <= 0) return 'Belum Ditetapkan';
  if (item.realisasiTotal >= target) return 'Selesai';
  if (item.realisasiTotal > 0) return 'Sedang Berjalan';
  return 'Belum Ada Realisasi';
}

function getStatusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'selesai' || normalized === 'disetujui') return 'bg-green-50 text-green-700 hover:bg-green-50';
  if (normalized === 'sedang berjalan' || normalized === 'aktif') return 'bg-blue-50 text-blue-700 hover:bg-blue-50';
  if (normalized === 'belum ditetapkan' || normalized === 'belum ada realisasi') return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
  return 'bg-amber-50 text-amber-700 hover:bg-amber-50';
}

function formatPeriodeTambahan(item: PenugasanTambahan): string {
  const start = normalizeDate(item.tanggalMulai);
  const end = normalizeDate(item.tanggalSelesai);
  if (!start && !end) return '-';
  if (start && (!end || start === end)) return formatTanggal(start);
  return `${formatTanggal(start)} - ${formatTanggal(end)}`;
}

function KpiCard({ kpi }: { kpi: KPIData }) {
  const colors = kpiColorMap[kpi.color];
  const Icon = kpi.icon;
  const DetailIcon = kpi.detailIcon;

  return (
    <Card
      aria-disabled={kpi.disabled}
      className={cn(
        'border',
        colors.border,
        kpi.disabled && 'border-gray-200 bg-gray-50 text-gray-500 opacity-80',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription>{kpi.label}</CardDescription>
          <div className={cn('dashboard-kpi-icon', kpi.disabled ? 'dashboard-kpi-icon-disabled' : `dashboard-kpi-icon-${kpi.color}`)}>
            <Icon />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{kpi.value}</div>
        {kpi.detail && (
          <div className={cn('mt-1 flex items-center gap-1.5 text-xs font-normal', kpi.disabled ? 'text-gray-500' : 'text-green-600')}>
            {DetailIcon && (
              <DetailIcon
                className={cn('shrink-0', kpi.disabled ? 'text-gray-400' : 'text-green-600')}
                size={11}
                strokeWidth={2.25}
                style={{ width: 11, height: 11 }}
              />
            )}
            <span>{kpi.detail}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PegawaiOverview() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<MyDashboardSummary | null>(null);
  const [periodeItems, setPeriodeItems] = useState<PeriodeSkp[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const selectedPeriode = periodeItems.find((periode) => String(periode.id) === selectedPeriodeId) ?? null;

  useEffect(() => {
    let ignore = false;

    const loadPeriode = async () => {
      try {
        const data = await getPeriodeSkpList();
        if (ignore) return;

        const currentYear = new Date().getFullYear();
        const defaultPeriod = data.find((periode) => periode.tahun === currentYear) ?? data[0] ?? null;
        setPeriodeItems(data);
        setSelectedPeriodeId(defaultPeriod ? String(defaultPeriod.id) : '');
      } catch {
        if (!ignore) setError('Gagal memuat data periode SKP.');
      }
    };

    loadPeriode();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await getMyDashboardSummary({ idPeriodeSkp: selectedPeriodeId });
        if (!ignore) setDashboard(data);
      } catch {
        if (!ignore) setError('Gagal memuat data dashboard pegawai.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    if (selectedPeriodeId) {
      loadDashboard();
    } else {
      setIsLoading(false);
      setDashboard(null);
    }

    return () => {
      ignore = true;
    };
  }, [selectedPeriodeId]);

  const kpis = useMemo<KPIData[]>(() => {
    const kgb = formatRemainingDate(dashboard?.timeline.tmtKgb ?? '');
    const pensiun = formatRemainingDate(dashboard?.timeline.tmtPensiun ?? '');

    return [
      {
        label: 'Ketercapaian',
        value: isLoading
          ? '...'
          : dashboard?.summary.achievementPercentage === null
            ? '-'
            : `${formatNumber(dashboard?.summary.achievementPercentage ?? 0)}%`,
        detail:
          isLoading
            ? 'Memuat data'
            : dashboard?.summary.targetKetercapaian
            ? `${formatNumber(dashboard.summary.realisasiTotal)}/${formatNumber(dashboard.summary.targetKetercapaian)}`
            : 'Target belum diisi',
        detailIcon: TrendingUp,
        icon: BarChart3,
        color: 'amber',
      },
      {
        label: 'Jumlah Kegiatan',
        value: isLoading ? '...' : String(dashboard?.summary.totalKegiatan ?? 0),
        detail: selectedPeriode ? `Butir SKP periode ${formatPeriodeLabel(selectedPeriode)}` : 'Periode belum tersedia',
        detailIcon: ClipboardList,
        icon: CalendarCheck,
        color: 'purple',
      },
      {
        label: 'KGB Berikutnya',
        value: isLoading ? '...' : kgb.value,
        detail: isLoading ? 'Memuat tanggal' : kgb.detail,
        detailIcon: Calendar,
        icon: CalendarClock,
        color: 'green',
      },
      {
        label: 'Perkiraan Pensiun',
        value: isLoading ? '...' : pensiun.value,
        detail: isLoading ? 'Memuat tanggal' : pensiun.detail,
        detailIcon: Clock,
        icon: Hourglass,
        color: 'blue',
      },
    ];
  }, [dashboard, isLoading, selectedPeriode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard Capaian SKP</h1>
          <p className="mt-1 text-gray-600">Pantau target dan realisasi kinerja pegawai periode berjalan.</p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowYearDropdown((value) => !value)}
          >
            {selectedPeriode ? formatPeriodeLabel(selectedPeriode) : 'Periode'}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
          {showYearDropdown && (
            <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              {periodeItems.length > 0 ? periodeItems.map((periode) => (
                <button
                  key={periode.id}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    String(periode.id) === selectedPeriodeId ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedPeriodeId(String(periode.id));
                    setShowYearDropdown(false);
                  }}
                  type="button"
                >
                  {formatPeriodeLabel(periode)}
                </button>
              )) : (
                <div className="px-4 py-2 text-sm text-gray-500">Tidak ada periode</div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-gray-700" />
                <CardTitle className="text-base">Realisasi Kinerja</CardTitle>
              </div>
              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/pegawai/projects')}>
                Lihat Semua
              </Button>
            </div>
            <CardDescription>Capaian SKP periode berjalan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-500">
                Memuat realisasi kinerja...
              </div>
            ) : dashboard?.kinerja.length ? (
              dashboard.kinerja.map((item) => {
                const pct = getProgressPercent(item);
                const status = getKinerjaStatus(item);
                const target = getTarget(item);

                return (
                  <div key={item.id} className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight text-gray-900">{item.namaKegiatan}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.uraian || item.deskripsi || '-'}</p>
                      </div>
                      <Badge className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', getStatusBadgeClass(status))}>
                        {status}
                      </Badge>
                    </div>
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-gray-500">Realisasi</span>
                        <span className="font-semibold text-gray-700">
                          {formatNumber(item.realisasiTotal)}
                          <span className="font-normal text-gray-400">/{target > 0 ? formatNumber(target) : '-'}</span>
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className={cn('mt-1 text-xs font-medium', pct >= 100 ? 'text-green-600' : pct >= 60 ? 'text-blue-600' : 'text-amber-500')}>
                        {pct}% tercapai
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-500">
                Belum ada butir kegiatan pada periode tahun berjalan.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-gray-700" />
                <CardTitle className="text-base">Penugasan Tambahan</CardTitle>
              </div>
              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/pegawai/organization')}>
                Lihat Semua
              </Button>
            </div>
            <CardDescription>Daftar kegiatan penugasan tambahan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-500">
                Memuat penugasan tambahan...
              </div>
            ) : dashboard?.penugasanTambahan.length ? (
              dashboard.penugasanTambahan.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-100"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <FileText className="size-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight text-gray-900">{item.namaKegiatan}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span className="truncate">{item.suratTugas || 'Belum ada surat tugas'}</span>
                        <span>-</span>
                        <span className="shrink-0">{formatPeriodeTambahan(item)}</span>
                      </div>
                    </div>
                  </div>

                  {item.suratTugas ? (
                    <a
                      href={`/surat-tugas/${item.suratTugas}`}
                      download={item.suratTugas}
                      title={`Unduh ${item.suratTugas}`}
                      className="ml-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Download className="size-4" />
                    </a>
                  ) : (
                    <Button variant="ghost" size="icon" className="ml-2 size-8 shrink-0 text-gray-300" disabled title="Surat tugas belum tersedia">
                      <Download className="size-4" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-500">
                Belum ada penugasan tambahan.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
