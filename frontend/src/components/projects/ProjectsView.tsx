import { useState } from 'react';
import { Filter, Calendar, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { mockProjects, mockDeliverables } from '../../data/mockData';

const getStatusLabel = (status: 'Active' | 'Paused' | 'Completed') => {
  if (status === 'Active') return 'Aktif';
  if (status === 'Paused') return 'Ditunda';
  return 'Selesai';
};

const getBookMetrics = (project: (typeof mockProjects)[number]) => {
  const targetBooks = Math.max(project.activeTasks, project.completedTasks);
  const uploadedBooks = Math.min(project.completedTasks, targetBooks);
  const completionPercent = targetBooks === 0 ? 100 : Math.round((uploadedBooks / targetBooks) * 100);

  return { targetBooks, uploadedBooks, completionPercent };
};

export function ProjectsView() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects =
    statusFilter === 'all' ? mockProjects : mockProjects.filter((project) => project.status === statusFilter);

  const projectDeliverables = mockDeliverables.filter((deliverable) => deliverable.projectId === selectedProject.id);

  const {
    targetBooks: selectedTargetBooks,
    uploadedBooks: selectedUploadedBooks,
    completionPercent: selectedCompletionPercent,
  } = getBookMetrics(selectedProject);

  const daysRemaining = Math.ceil(
    (new Date(selectedProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
  const isOverdue = daysRemaining < 0;
  const displayDays = Math.abs(daysRemaining);

  return (
    <div className="flex h-full gap-6 min-w-0">
      <div className="w-[22rem] shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2>Ketercapaian</h2>
          <Button size="sm" variant="ghost">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter berdasarkan status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ketercapaian</SelectItem>
            <SelectItem value="Active">Aktif</SelectItem>
            <SelectItem value="Paused">Ditunda</SelectItem>
            <SelectItem value="Completed">Selesai</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const { targetBooks, uploadedBooks, completionPercent } = getBookMetrics(project);

            return (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all ${
                  selectedProject.id === project.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm leading-5">{project.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {uploadedBooks} dari {targetBooks} buku sudah diunggah
                      </CardDescription>
                    </div>
                    <Badge
                      variant={project.status === 'Active' ? 'default' : 'secondary'}
                      className="text-xs shrink-0"
                    >
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Upload Buku</span>
                      <span>{completionPercent}%</span>
                    </div>
                    <Progress value={completionPercent} className="h-1.5" />
                    <div className="flex justify-between text-xs text-gray-500 mt-2 gap-3">
                      <span className="truncate">{uploadedBooks} buku terunggah</span>
                      <span className="shrink-0">Target {targetBooks} buku</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1>{selectedProject.name}</h1>
            <p className="text-gray-600 mt-1">{selectedProject.client}</p>
          </div>
          <Badge
            variant={
              selectedProject.status === 'Active'
                ? 'default'
                : selectedProject.status === 'Paused'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {getStatusLabel(selectedProject.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Persentase Ketercapaian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{selectedCompletionPercent}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tujuan SKP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{selectedTargetBooks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>SKP Diselesaikan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{selectedUploadedBooks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Jumlah Pegawai</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{selectedProject.assignedTeam.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Ringkasan</TabsTrigger>
            <TabsTrigger value="deliverables">Dokumen</TabsTrigger>
            <TabsTrigger value="team">Pegawai</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tujuan & Sasaran Kegiatan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{selectedProject.objectives}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Jadwal Kegiatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tenggat Waktu</span>
                      <span>{new Date(selectedProject.deadline).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sisa Waktu</span>
                      <span>{isOverdue ? `Lewat ${displayDays} hari` : `${displayDays} hari`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Informasi Unit Kerja
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Kerja</span>
                      <span className="text-sm font-medium">{selectedProject.workspace}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pegawai</span>
                      <span className="text-sm font-medium">{selectedProject.assignedTeam.length} orang</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deliverables">
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
                    {projectDeliverables.length > 0 ? (
                      projectDeliverables.map((deliverable) => (
                        <TableRow key={deliverable.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            {deliverable.name}
                          </TableCell>
                          <TableCell>{deliverable.type}</TableCell>
                          <TableCell>{deliverable.uploadedBy}</TableCell>
                          <TableCell>{new Date(deliverable.uploadedDate).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>{deliverable.size}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Belum ada dokumen untuk kegiatan ini
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Pegawai yang Terlibat</CardTitle>
                <CardDescription>Pegawai yang mengerjakan kegiatan ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProject.assignedTeam.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('open-organization-member', {
                            detail: { member },
                          }),
                        );
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                          {member
                            .split(' ')
                            .map((name) => name[0])
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{member}</p>
                          <p className="text-sm text-gray-500">Pegawai</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">SKP Progress</p>
                          <p className="text-sm font-medium">75%</p>
                        </div>
                        <Progress value={75} className="w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
