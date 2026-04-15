import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Search } from 'lucide-react';
import { mockDeliverables, mockProjects, mockTasks } from '../../data/mockData';
import type { Project } from '../../types';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const PAGE_SIZE = 8;

const getStatusLabel = (status: Project['status']) => {
  if (status === 'Active') return 'Aktif';
  return 'Selesai';
};

const getStatusClassName = (status: Project['status']) => {
  if (status === 'Active') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export function PimpinanKegiatanView() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Completed'>('all');
  const [page, setPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0]?.id ?? '');
  const [isDetailExpanded, setIsDetailExpanded] = useState(true);

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'Active' && project.status === 'Active') ||
        (statusFilter === 'Completed' && project.status !== 'Active');
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        project.name.toLowerCase().includes(q) ||
        project.client.toLowerCase().includes(q) ||
        project.workspace.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProjects.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredProjects]);

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

  const selectedTarget = selectedProject.activeTasks;
  const selectedRealization = selectedProject.completedTasks;
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
              value={statusFilter}
              onValueChange={(value: 'all' | 'Active' | 'Completed') => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Active">Aktif</SelectItem>
                <SelectItem value="Completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col pt-0 space-y-4 overflow-y-auto">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Nama Kegiatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
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
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusClassName(project.status)}>{getStatusLabel(project.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">{progressPercent}%</div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-gray-500">
                    Data kegiatan tidak ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <p>
            Menampilkan {rows.length} dari {filteredProjects.length} kegiatan
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span>
              Halaman {currentPage} / {totalPages}
            </span>
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
                    <CardDescription>Target Kinerja</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{selectedTarget}</div>
                  </CardContent>
                </Card>
                <Card className="min-w-[210px] flex-1">
                  <CardHeader className="pb-2">
                    <CardDescription>Realisasi Kinerja</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{selectedRealization}</div>
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
