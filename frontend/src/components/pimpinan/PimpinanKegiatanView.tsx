import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Search } from 'lucide-react';
import { mockDeliverables, mockProjects, mockTasks } from '../../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const PAGE_SIZE_OPTIONS = [10, 20, 30] as const;

const MONTH_OPTIONS = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '0', label: 'Januari' },
  { value: '1', label: 'Februari' },
  { value: '2', label: 'Maret' },
  { value: '3', label: 'April' },
  { value: '4', label: 'Mei' },
  { value: '5', label: 'Juni' },
  { value: '6', label: 'Juli' },
  { value: '7', label: 'Agustus' },
  { value: '8', label: 'September' },
  { value: '9', label: 'Oktober' },
  { value: '10', label: 'November' },
  { value: '11', label: 'Desember' },
] as const;

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage === 1) return [1, 2, 3, totalPages];
  if (currentPage >= totalPages - 1) return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return Array.from(
    new Set([currentPage - 1, currentPage, currentPage + 1, totalPages].filter((page) => page >= 1 && page <= totalPages)),
  ).sort((a, b) => a - b);
}

export function PimpinanKegiatanView() {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0]?.id ?? '');
  const [isDetailExpanded, setIsDetailExpanded] = useState(true);

  const availableYears = useMemo(() => {
    return Array.from(new Set(mockProjects.map((project) => new Date(project.deadline).getFullYear().toString())))
      .sort((a, b) => Number(b) - Number(a));
  }, []);

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const projectDate = new Date(project.deadline);
      const projectYear = projectDate.getFullYear().toString();
      const projectMonth = projectDate.getMonth().toString();

      const matchesYear = yearFilter === 'all' || projectYear === yearFilter;
      const matchesMonth = monthFilter === 'all' || projectMonth === monthFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        project.name.toLowerCase().includes(q) ||
        project.client.toLowerCase().includes(q) ||
        project.workspace.toLowerCase().includes(q);
      return matchesYear && matchesMonth && matchesSearch;
    });
  }, [search, yearFilter, monthFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visiblePages = getAdaptivePages(currentPage, totalPages);
  const startItem = filteredProjects.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredProjects.length);

  const rows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [currentPage, filteredProjects, pageSize]);

  const selectedProject = useMemo(
    () =>
      rows.find((project) => project.id === selectedProjectId) ||
      filteredProjects.find((project) => project.id === selectedProjectId) ||
      rows[0] ||
      filteredProjects[0] ||
      mockProjects[0],
    [rows, filteredProjects, selectedProjectId],
  );

  const selectedProjectDeliverables = useMemo(
    () => mockDeliverables.filter((item) => item.projectId === selectedProject.id),
    [selectedProject.id],
  );

  const selectedProjectTasks = useMemo(
    () => mockTasks.filter((task) => task.projectId === selectedProject.id),
    [selectedProject.id],
  );

  const selectedPercent = selectedProject.progress;
  const selectedDeadline = new Date(selectedProject.deadline).toLocaleDateString('id-ID');
  const selectedDaysRemaining = Math.ceil(
    (new Date(selectedProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Card className="h-[calc(100vh-9.5rem)] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-lg font-extrabold leading-tight text-gray-900">Kegiatan</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-10 w-full items-center gap-2 rounded-xl bg-gray-100 px-3 shadow-sm sm:w-72">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama kegiatan..."
                className="h-10 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <Select
              value={yearFilter}
              onValueChange={(value: string) => {
                setYearFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={monthFilter}
              onValueChange={(value: string) => {
                setMonthFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col pt-0 space-y-4 overflow-y-auto">
        <div className="rounded-md border overflow-hidden">
          <Table className="table-fixed">
              <TableHeader>
                <TableRow className="border-b border-slate-300" style={{ backgroundColor: '#e2e8f0' }}>
                  <TableHead className="w-1/2 text-slate-900 font-bold px-4 py-3" style={{ backgroundColor: '#e2e8f0' }}>
                    Butir Kegiatan
                  </TableHead>
                  <TableHead className="w-1/2 text-slate-900 font-bold px-4 py-3" style={{ backgroundColor: '#e2e8f0' }}>
                    Progress
                  </TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((project) => {
                  const progressPercent = project.progress;
                  const isSelected = selectedProject.id === project.id;

                  return (
                    <TableRow
                      key={project.id}
                      className={`cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setIsDetailExpanded(true);
                      }}
                    >
                      <TableCell className="font-medium px-4 py-3">{project.name}</TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="w-full space-y-1">
                            <div className="text-xs text-gray-600">{progressPercent}%</div>
                            <Progress value={progressPercent} className="h-2 w-full" />
                          </div>
                        </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="py-8 text-center text-gray-500">
                    Data kegiatan tidak ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex flex-col gap-3 text-sm text-gray-600 lg:flex-row lg:items-center lg:justify-between">
          <p>
            Menampilkan {startItem}-{endItem} dari {filteredProjects.length} kegiatan
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / halaman
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>
            {visiblePages.map((pageNumber, idx) => (
              <div key={pageNumber} className="flex items-center gap-2">
                {idx > 0 && pageNumber - visiblePages[idx - 1] > 1 && <span className="px-1 text-gray-400">...</span>}
                <button
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 min-w-9 rounded border px-3 ${
                    pageNumber === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {pageNumber}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>

        {selectedProject && (
          <div className="mt-2">
            <div className="border-t border-gray-200 my-4" />

            <button
              type="button"
              onClick={() => setIsDetailExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-md px-1 py-1 text-left hover:bg-gray-50"
            >
              <h2 className="text-xl font-extrabold text-gray-900">Detail Kegiatan</h2>
              {isDetailExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {isDetailExpanded && (
              <div className="space-y-4 pt-2">

              <div className="flex gap-4 overflow-x-auto pb-1">
                <Card className="min-w-[210px] flex-1">
                  <CardHeader className="pb-2">
                    <CardDescription>Presentase Ketercapaian</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{selectedPercent}%</div>
                  </CardContent>
                </Card>
                <Card className="min-w-[210px] flex-1">
                  <CardHeader className="pb-2">
                    <CardDescription>Jumlah Pegawai</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{selectedProject.assignedTeam.length}</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="ringkasan" className="w-full">
                <TabsList>
                  <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
                  <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
                  <TabsTrigger value="pegawai">Pegawai</TabsTrigger>
                </TabsList>

                <TabsContent value="ringkasan" className="mt-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Butir Kegiatan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{selectedProject.objectives || '—'}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="font-bold">Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-gray-500">Tenggat Waktu</p>
                          <p className="text-lg font-semibold">{selectedDeadline}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-gray-500">Sisa Waktu</p>
                          <p className="text-lg font-semibold">
                            {selectedDaysRemaining >= 0 ? `${selectedDaysRemaining} hari` : `Lewat ${Math.abs(selectedDaysRemaining)} hari`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="dokumen" className="mt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dokumen Bukti Ketercapaian</CardTitle>
                      <CardDescription>Dokumen dan berkas terkait kegiatan SKP</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Dokumen</TableHead>
                            <TableHead>Jenis</TableHead>
                            <TableHead>Diunggah Oleh</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Ukuran</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProjectDeliverables.length > 0 ? (
                            selectedProjectDeliverables.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  {item.name}
                                </TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>{item.uploadedBy}</TableCell>
                                <TableCell>{new Date(item.uploadedDate).toLocaleDateString('id-ID')}</TableCell>
                                <TableCell>{item.size}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                                Belum ada dokumen untuk kegiatan ini
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pegawai" className="mt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pegawai</CardTitle>
                      <CardDescription>Pegawai yang terlibat dalam kegiatan ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedProject.assignedTeam.length > 0 ? (
                          selectedProject.assignedTeam.map((member) => {
                            const memberTasks = selectedProjectTasks.filter((task) => task.assignedTo === member);
                            const completedCount = memberTasks.filter((task) => task.status === 'Completed').length;
                            const totalCount = memberTasks.length;
                            const progressPercent =
                              totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                            return (
                              <div key={member} className="rounded-lg border p-3 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium">{member}</p>
                                    <p className="text-sm text-gray-500">Pegawai</p>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">{progressPercent}%</span>
                                </div>

                                <div className="space-y-1">
                                  <Progress value={progressPercent} className="h-2" />
                                  <p className="text-xs text-gray-500">
                                    {completedCount} dari {totalCount} tugas selesai
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="py-6 text-center text-gray-500">Belum ada pegawai untuk kegiatan ini</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { PimpinanEarlyWarningSystemView } from './PimpinanEarlyWarningSystemView';
