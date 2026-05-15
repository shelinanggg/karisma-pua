import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Target, CalendarCheck, Users, Eye, ChevronDown, ChevronUp, Award, ClipboardList, BarChart3, GraduationCap, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { WorkspaceDashboard } from '../workspace/WorkspaceDashboard';
import { Workspace } from '../../types';
import { getPeriodeSkpList, type PeriodeSkp } from '../../api/periodeSkpApi';
import { getDashboardUtamaData, type DashboardKegiatan, type DashboardKpi, type EmployeeStatistics } from '../../api/dashboardApi';

const kpiColorMap: Record<string, { border: string }> = {
  blue: { border: 'border-blue-100' },
  green: { border: 'border-green-100' },
  amber: { border: 'border-amber-100' },
  purple: { border: 'border-purple-100' },
};

const kpiIconMap: Record<string, typeof Users> = {
  'Total Pegawai Aktif': Users,
  'Mendekati Pensiun': Award,
  'Mendekati KGB': Target,
  'Jumlah Kegiatan': CalendarCheck,
};

const demoEmployeeStatistics: EmployeeStatistics = {
  golongan: [
    { label: 'III/a', value: 34, percentage: 28.3 },
    { label: 'III/b', value: 29, percentage: 24.2 },
    { label: 'IV/a', value: 24, percentage: 20.0 },
    { label: 'II/c', value: 13, percentage: 10.8 },
    { label: 'Lainnya', value: 20, percentage: 16.7 },
  ],
  pendidikan: [
    { label: 'S1', value: 45, percentage: 37.5 },
    { label: 'S2', value: 28, percentage: 23.3 },
    { label: 'D3', value: 19, percentage: 15.8 },
    { label: 'SMA', value: 17, percentage: 14.2 },
    { label: 'Lainnya', value: 11, percentage: 9.2 },
  ],
  fungsional: [
    { label: 'Analis', value: 31, percentage: 25.8 },
    { label: 'Pranata', value: 26, percentage: 21.7 },
    { label: 'Perencana', value: 22, percentage: 18.3 },
    { label: 'Auditor', value: 18, percentage: 15.0 },
    { label: 'Lainnya', value: 23, percentage: 19.2 },
  ],
  jabatan: [
    { label: 'Pelaksana', value: 42, percentage: 35.0 },
    { label: 'Staf', value: 27, percentage: 22.5 },
    { label: 'Kepala Subbag', value: 18, percentage: 15.0 },
    { label: 'Kepala Bidang', value: 13, percentage: 10.8 },
    { label: 'Lainnya', value: 20, percentage: 16.7 },
  ],
};

function formatPeriodeLabel(periode: PeriodeSkp) {
  return String(periode.tahun);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value || 0);
}

export function PimpinanOverview() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [expandedKegiatan, setExpandedKegiatan] = useState<number | null>(null);
  const [periodeItems, setPeriodeItems] = useState<PeriodeSkp[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [dashboardKpis, setDashboardKpis] = useState<DashboardKpi[]>([]);
  const [dashboardKegiatan, setDashboardKegiatan] = useState<DashboardKegiatan[]>([]);
  const [statistics, setStatistics] = useState<EmployeeStatistics | undefined>();
  const displayStatistics = statistics ?? demoEmployeeStatistics;
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
        if (!ignore) {
          setPeriodeItems([]);
          setSelectedPeriodeId('');
        }
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
      try {
        const data = await getDashboardUtamaData(selectedPeriodeId ? { idPeriodeSkp: selectedPeriodeId } : undefined);
        if (!ignore) {
          setDashboardKpis(data.kpis);
          setDashboardKegiatan(data.kegiatan);
          setStatistics(data.statistics);
        }
      } catch {
        if (!ignore) {
          setDashboardKpis([]);
          setDashboardKegiatan([]);
          setStatistics(undefined);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [selectedPeriodeId]);

  if (selectedWorkspace) {
    return <WorkspaceDashboard workspace={selectedWorkspace} onBack={() => setSelectedWorkspace(null)} />;
  }

  return (
    <div className="space-y-6">
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
                  onClick={() => { setSelectedPeriodeId(String(periode.id)); setShowYearDropdown(false); }}
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

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-700" />
            <h2>Statistik Kepegawaian</h2>
          </div>
          {!statistics && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
              Tampilan contoh frontend
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {displayStatistics.golongan.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Golongan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {displayStatistics.golongan.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="text-gray-600">{item.value}</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                    <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {displayStatistics.pendidikan.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Pendidikan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {displayStatistics.pendidikan.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="text-gray-600">{item.value}</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                    <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {displayStatistics.fungsional.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Fungsional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {displayStatistics.fungsional.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium truncate">{item.label}</span>
                      <span className="text-gray-600">{item.value}</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                    <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {displayStatistics.jabatan.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Jabatan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {displayStatistics.jabatan.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium truncate">{item.label}</span>
                      <span className="text-gray-600">{item.value}</span>
                    </div>
                    <Progress value={item.percentage} className="h-1.5" />
                    <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardKpis.map((kpi, index) => {
          const colors = kpiColorMap[kpi.color] ?? kpiColorMap.blue;
          const Icon = kpiIconMap[kpi.label] ?? BarChart3;
          return (
            <Card key={index} className={`border ${colors.border}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{kpi.label}</CardDescription>
                  <div className={`dashboard-kpi-icon dashboard-kpi-icon-${kpi.color}`}>
                    <Icon />
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

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-700" />
            <h2>Progress Kegiatan</h2>
          </div>
          <Button variant="link">Lihat Semua →</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {dashboardKegiatan.map((kegiatan) => {
            const pct = kegiatan.tujuanSKP > 0 ? Math.round((kegiatan.skpSelesai / kegiatan.tujuanSKP) * 100) : 0;
            const isExpanded = expandedKegiatan === kegiatan.id;
            return (
              <Card key={kegiatan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm leading-tight">{kegiatan.namaKegiatan}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">SKP Diselesaikan</span>
                      <span className="font-semibold text-gray-800">
                        {formatNumber(kegiatan.skpSelesai)}
                        <span className="font-normal text-gray-400">/{formatNumber(kegiatan.tujuanSKP)} tujuan SKP</span>
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span className={pct === 100 ? 'text-green-600 font-medium' : pct >= 60 ? 'text-blue-600' : 'text-amber-500'}>
                        {pct}% tercapai
                      </span>
                      <span>{formatNumber(Math.max(0, kegiatan.tujuanSKP - kegiatan.skpSelesai))} SKP tersisa</span>
                    </div>
                  </div>

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
                                  {formatNumber(p.skpSelesai)}/{formatNumber(p.skpTarget)} SKP
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
