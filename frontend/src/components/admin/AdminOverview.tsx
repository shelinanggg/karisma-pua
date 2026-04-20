import { useState } from 'react';
import { TrendingUp, TrendingDown, CheckCircle2, Target, CalendarCheck, Users, Eye, ChevronDown, ChevronUp, Award, ClipboardList, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { WorkspaceDashboard } from '../workspace/WorkspaceDashboard';
import { Workspace } from '../../types';

// ── Mock KPI data for SKP Dashboard ──────────────────────────────────────────

const mockSKPKPIs = [
  {
    label: 'Target Kinerja',
    value: '120',
    change: '+8 dari bulan lalu',
    trend: 'up' as const,
    icon: Target,
    color: 'blue',
  },
  {
    label: 'Realisasi Kinerja',
    value: '89',
    change: '+12 dari bulan lalu',
    trend: 'up' as const,
    icon: CheckCircle2,
    color: 'green',
  },
  {
    label: 'Persentase Ketercapaian',
    value: '74.2%',
    change: '-2.3% dari bulan lalu',
    trend: 'down' as const,
    icon: BarChart3,
    color: 'amber',
  },
  {
    label: 'Jumlah Kegiatan',
    value: '18',
    change: '+3 dari bulan lalu',
    trend: 'up' as const,
    icon: CalendarCheck,
    color: 'purple',
  },
];

// ── Mock: Progress Kegiatan (SKP) ─────────────────────────────────────────────

const mockKegiatan = [
  {
    id: 1,
    namaKegiatan: 'Pengembangan Sistem Informasi Kepegawaian',
    unitKerja: 'Bidang TI',
    tujuanSKP: 8,
    skpSelesai: 5,
    jumlahPegawai: 6,
    pegawai: [
      { nama: 'Andi Kurniawan', inisial: 'AK', skpSelesai: 2, skpTarget: 2 },
      { nama: 'Siti Rahayu', inisial: 'SR', skpSelesai: 1, skpTarget: 2 },
      { nama: 'Budi Santoso', inisial: 'BS', skpSelesai: 1, skpTarget: 2 },
      { nama: 'Dewi Lestari', inisial: 'DL', skpSelesai: 1, skpTarget: 1 },
      { nama: 'Eko Prasetyo', inisial: 'EP', skpSelesai: 0, skpTarget: 1 },
      { nama: 'Fitri Handayani', inisial: 'FH', skpSelesai: 0, skpTarget: 0 },
    ],
  },
  {
    id: 2,
    namaKegiatan: 'Penyusunan Laporan Evaluasi Kinerja Q1',
    unitKerja: 'Bidang Evaluasi',
    tujuanSKP: 5,
    skpSelesai: 2,
    jumlahPegawai: 4,
    pegawai: [
      { nama: 'Gunawan Hidayat', inisial: 'GH', skpSelesai: 1, skpTarget: 2 },
      { nama: 'Hana Pertiwi', inisial: 'HP', skpSelesai: 1, skpTarget: 1 },
      { nama: 'Irwan Saputra', inisial: 'IS', skpSelesai: 0, skpTarget: 1 },
      { nama: 'Joko Widodo', inisial: 'JW', skpSelesai: 0, skpTarget: 1 },
    ],
  },
  {
    id: 3,
    namaKegiatan: 'Pelatihan Kompetensi Digital ASN',
    unitKerja: 'Bidang Diklat',
    tujuanSKP: 10,
    skpSelesai: 8,
    jumlahPegawai: 8,
    pegawai: [
      { nama: 'Kartini Wulandari', inisial: 'KW', skpSelesai: 2, skpTarget: 2 },
      { nama: 'Lukman Hakim', inisial: 'LH', skpSelesai: 2, skpTarget: 2 },
      { nama: 'Maya Sari', inisial: 'MS', skpSelesai: 2, skpTarget: 2 },
      { nama: 'Nanda Putra', inisial: 'NP', skpSelesai: 1, skpTarget: 2 },
      { nama: 'Oki Firmansyah', inisial: 'OF', skpSelesai: 1, skpTarget: 1 },
      { nama: 'Putri Amelia', inisial: 'PA', skpSelesai: 0, skpTarget: 1 },
    ],
  },
  {
    id: 4,
    namaKegiatan: 'Pembaruan Regulasi Administrasi Umum',
    unitKerja: 'Bidang Hukum',
    tujuanSKP: 6,
    skpSelesai: 6,
    jumlahPegawai: 3,
    pegawai: [
      { nama: 'Rini Susanti', inisial: 'RS', skpSelesai: 2, skpTarget: 2 },
      { nama: 'Surya Dinata', inisial: 'SD', skpSelesai: 2, skpTarget: 2 },
      { nama: 'Tina Marlina', inisial: 'TM', skpSelesai: 2, skpTarget: 2 },
    ],
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

export function AdminOverview() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [expandedKegiatan, setExpandedKegiatan] = useState<number | null>(null);
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
        {/* Year filter */}
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

      {/* ── SKP KPI Cards ── */}
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
                {kpi.change && (
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Progress Kegiatan ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-700" />
            <h2>Progress Kegiatan</h2>
          </div>
          <Button variant="link">Lihat Semua →</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockKegiatan.map((kegiatan) => {
            const pct = Math.round((kegiatan.skpSelesai / kegiatan.tujuanSKP) * 100);
            const isExpanded = expandedKegiatan === kegiatan.id;
            return (
              <Card key={kegiatan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm leading-tight">{kegiatan.namaKegiatan}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* SKP Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">SKP Diselesaikan</span>
                      <span className="font-semibold text-gray-800">
                        {kegiatan.skpSelesai}
                        <span className="font-normal text-gray-400">/{kegiatan.tujuanSKP} tujuan SKP</span>
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span className={pct === 100 ? 'text-green-600 font-medium' : pct >= 60 ? 'text-blue-600' : 'text-amber-500'}>
                        {pct}% tercapai
                      </span>
                      <span>{kegiatan.tujuanSKP - kegiatan.skpSelesai} SKP tersisa</span>
                    </div>
                  </div>

                  {/* Pegawai row + expand button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{kegiatan.jumlahPegawai} pegawai terlibat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-gray-500 gap-1"
                        onClick={() => setExpandedKegiatan(isExpanded ? null : kegiatan.id)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded pegawai detail */}
                  {isExpanded && (
                    <div className="border-t pt-3 space-y-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Detail Pegawai & SKP</div>
                      {kegiatan.pegawai.map((p, idx) => {
                        const pegawaiPct = p.skpTarget > 0 ? Math.round((p.skpSelesai / p.skpTarget) * 100) : 0;
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-700 truncate">{p.nama}</span>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {p.skpSelesai}/{p.skpTarget} SKP
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    pegawaiPct === 100 ? 'bg-green-500' :
                                    pegawaiPct >= 50 ? 'bg-blue-400' : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${pegawaiPct}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {pegawaiPct === 100 ? (
                                <Award className="w-4 h-4 text-green-500" />
                              ) : (
                                <span className={`text-xs font-semibold ${pegawaiPct >= 50 ? 'text-blue-600' : 'text-amber-500'}`}>
                                  {pegawaiPct}%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}