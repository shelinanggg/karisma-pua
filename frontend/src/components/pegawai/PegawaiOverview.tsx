import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CalendarCheck, 
  BarChart3, 
  ChevronDown, 
  ClipboardList, 
  FileText,
  Hourglass,
  CalendarClock,
  Calendar,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { WorkspaceDashboard } from '../workspace/WorkspaceDashboard';
import { Workspace } from '../../types';

// ── Types ─────────────────────────────────────────────────────────────────────

type KPIData = {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  changeIcon?: React.ElementType; // Tambahkan ini agar icon keterangan bawah bisa dicustom
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'purple';
};

// ── Mock KPI data ─────────────────────────────────────────────────────────────

const mockSKPKPIs: KPIData[] = [
  {
    label: 'Persentase Ketercapaian',
    value: '74.2%',
    change: '-2.3% dari bulan lalu',
    trend: 'down',
    icon: BarChart3,
    color: 'amber',
  },
  {
    label: 'Jumlah Kegiatan',
    value: '18',
    change: '+3 dari bulan lalu',
    trend: 'up',
    icon: CalendarCheck,
    color: 'purple',
  },
  {
    label: 'KGB Berikutnya',
    value: '8 Bln 12 Hari',
    change: 'Estimasi: 1 Jan 2027',
    trend: 'neutral',
    changeIcon: Calendar, // Icon Kalender
    icon: CalendarClock,
    color: 'green',
  },
  {
    label: 'Perkiraan Pensiun',
    value: '5 Thn 4 Bln',
    change: 'TMT: 1 Okt 2031',
    trend: 'neutral',
    changeIcon: Clock, // Icon Jam (Berbeda)
    icon: Hourglass,
    color: 'blue',
  },
];

// ── Mock: Progress Kegiatan ───────────────────────────────────────────────────

const mockKegiatan = [
  {
    id: 1,
    namaKegiatan: 'Pengembangan Sistem Informasi Kepegawaian',
    unitKerja: 'Bidang TI',
    tujuanSKP: 8,
    skpSelesai: 5,
    status: 'disetujui' as const,
  },
  {
    id: 2,
    namaKegiatan: 'Penyusunan Laporan Evaluasi Kinerja Q1',
    unitKerja: 'Bidang Evaluasi',
    tujuanSKP: 5,
    skpSelesai: 2,
    status: 'menunggu' as const,
  },
  {
    id: 3,
    namaKegiatan: 'Pelatihan Kompetensi Digital ASN',
    unitKerja: 'Bidang Diklat',
    tujuanSKP: 10,
    skpSelesai: 8,
    status: 'disetujui' as const,
  },
  {
    id: 4,
    namaKegiatan: 'Pembaruan Regulasi Administrasi Umum',
    unitKerja: 'Bidang Hukum',
    tujuanSKP: 6,
    skpSelesai: 6,
    status: 'menunggu' as const,
  },
];

// ── Mock: Penugasan Tambahan ──────────────────────────────────────────────────

const mockPenugasan = [
  {
    id: 1,
    judul: 'Surat Tugas Rapat Koordinasi Nasional',
    keterangan: 'Diterbitkan 2 jam lalu',
  },
  {
    id: 2,
    judul: 'Surat Tugas Pendampingan Audit Internal',
    keterangan: 'Diterbitkan 1 hari lalu',
  },
  {
    id: 3,
    judul: 'Surat Tugas Pelatihan Kepemimpinan Tk. II',
    keterangan: 'Diterbitkan 3 April 2026',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const YEARS = [2025, 2024, 2023, 2022];

const kpiColorMap: Record<string, { bg: string; icon: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
};

// ── Main component ────────────────────────────────────────────────────────────

export function PegawaiOverview() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  if (selectedWorkspace) {
    return <WorkspaceDashboard workspace={selectedWorkspace} onBack={() => setSelectedWorkspace(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard Capaian SKP</h1>
          <p className="text-gray-600 mt-1">Pantau target dan realisasi kinerja pegawai periode berjalan.</p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowYearDropdown((v) => !v)}
          >
            {selectedYear}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
          {showYearDropdown && (
            <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              {YEARS.map((year) => (
                <button
                  key={year}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    year === selectedYear ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                  onClick={() => { setSelectedYear(year); setShowYearDropdown(false); }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockSKPKPIs.map((kpi, index) => {
          const colors = kpiColorMap[kpi.color];
          const Icon = kpi.icon;
          return (
            <Card key={index} className={`border ${colors.border}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{kpi.label}</CardDescription>
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${colors.icon}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                {kpi.change && kpi.trend && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {kpi.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {kpi.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                    
                    {/* Menggunakan custom icon jika trend-nya neutral dan ukurannya w-3 h-3 (lebih kecil) */}
                    {kpi.trend === 'neutral' && kpi.changeIcon && (
                      <kpi.changeIcon className="w-3 h-3 text-gray-400" strokeWidth={2.5} />
                    )}
                    
                    <span 
                      className={`text-xs ${
                        kpi.trend === 'up' ? 'text-green-600' : 
                        kpi.trend === 'down' ? 'text-red-600' : 
                        'text-gray-500 font-medium'
                      }`}
                    >
                      {kpi.change}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Bottom Section: Progress Kinerja + Penugasan Tambahan ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Progress Kinerja */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-700" />
                <CardTitle className="text-base">Realisasi Kinerja</CardTitle>
              </div>
              <Button variant="link" className="text-xs p-0 h-auto">Lihat Semua →</Button>
            </div>
            <CardDescription>Capaian SKP periode berjalan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockKegiatan.map((kegiatan) => {
              const pct = Math.round((kegiatan.skpSelesai / kegiatan.tujuanSKP) * 100);
              const isDisetujui = kegiatan.status === 'disetujui';
              return (
                <div key={kegiatan.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{kegiatan.namaKegiatan}</p>
                    </div>
                    <Badge
                      className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                        isDisetujui
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isDisetujui ? 'Disetujui' : 'Menunggu Persetujuan'}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">SKP Diselesaikan</span>
                      <span className="font-semibold text-gray-700">
                        {kegiatan.skpSelesai}
                        <span className="font-normal text-gray-400">/{kegiatan.tujuanSKP}</span>
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className={`text-xs mt-1 font-medium ${
                      pct === 100 ? 'text-green-600' : pct >= 60 ? 'text-blue-600' : 'text-amber-500'
                    }`}>
                      {pct}% tercapai
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Penugasan Tambahan */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-700" />
                <CardTitle className="text-base">Penugasan Tambahan</CardTitle>
              </div>
              <Button variant="link" className="text-xs p-0 h-auto">Lihat Semua →</Button>
            </div>
            <CardDescription>Surat tugas yang diterbitkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockPenugasan.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4 hover:bg-gray-100/60 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{item.judul}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.keterangan}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}