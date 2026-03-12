import { useState, useMemo, useRef } from 'react';
import { Filter, Calendar, Users, FileText, Plus, Pencil, Upload, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { mockProjects, mockDeliverables, mockTasks } from '../../data/mockData';
import type { Project, Task } from '../../types';

type TaskWithSKP = Task & { skpCount?: number; imageUrl?: string };

const getStatusLabel = (status: 'Active' | 'Paused' | 'Completed') => {
  if (status === 'Active') return 'Aktif';
  if (status === 'Paused') return 'Ditunda';
  return 'Selesai';
};

const getBookMetrics = (project: Project) => {
  const targetBooks = Math.max(project.activeTasks, project.completedTasks);
  const uploadedBooks = Math.min(project.completedTasks, targetBooks);
  const completionPercent = targetBooks === 0 ? 100 : Math.round((uploadedBooks / targetBooks) * 100);
  return { targetBooks, uploadedBooks, completionPercent };
};

const EMPTY_NEW_PROJ = {
  name: '',
  client: '',
  workspace: '',
  deadline: '',
  activeTasks: '',
  objectives: '',
};

const EMPTY_TASK_FORM = {
  title: '',
  status: 'Todo' as Task['status'],
  priority: 'Medium' as Task['priority'],
  dueDate: '',
  skpCount: '',
  imageUrl: '',
};

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([...mockProjects]);
  const [tasks, setTasks] = useState<TaskWithSKP[]>([...mockTasks]);
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0].id);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New project dialog
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProj, setNewProj] = useState(EMPTY_NEW_PROJ);

  // Edit task dialog
  const [editingTask, setEditingTask] = useState<TaskWithSKP | null>(null);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  );

  const filteredProjects =
    statusFilter === 'all' ? projects : projects.filter((project) => project.status === statusFilter);

  const filteredTotals = filteredProjects.reduce(
    (acc, project) => {
      const metrics = getBookMetrics(project);
      return { uploaded: acc.uploaded + metrics.uploadedBooks, target: acc.target + metrics.targetBooks };
    },
    { uploaded: 0, target: 0 },
  );

  const filteredProgressPercent =
    filteredTotals.target === 0 ? 0 : Math.round((filteredTotals.uploaded / filteredTotals.target) * 100);

  const projectDeliverables = mockDeliverables.filter((d) => d.projectId === selectedProject.id);

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === selectedProject.id),
    [tasks, selectedProject.id],
  );

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

  // ------ handlers ------
  const handleAddProject = () => {
    if (!newProj.name.trim() || !newProj.deadline) return;
    const id = `p${Date.now()}`;
    const created: Project = {
      id,
      name: newProj.name.trim(),
      client: newProj.client.trim() || '—',
      workspace: newProj.workspace.trim() || '—',
      status: 'Active',
      assignedTeam: [],
      progress: 0,
      deadline: newProj.deadline,
      objectives: newProj.objectives.trim(),
      activeTasks: Number(newProj.activeTasks) || 0,
      completedTasks: 0,
    };
    setProjects((prev) => [created, ...prev]);
    setSelectedProjectId(id);
    setShowNewProject(false);
    setNewProj(EMPTY_NEW_PROJ);
  };

  const openEditTask = (task: TaskWithSKP) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      skpCount: task.skpCount != null ? String(task.skpCount) : '',
      imageUrl: task.imageUrl ?? '',
    });
  };

  const handleSaveTask = () => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: taskForm.title.trim() || t.title,
              status: taskForm.status,
              priority: taskForm.priority,
              dueDate: taskForm.dueDate || t.dueDate,
              skpCount: taskForm.skpCount !== '' ? Number(taskForm.skpCount) : t.skpCount,
              imageUrl: taskForm.imageUrl || t.imageUrl,
            }
          : t,
      ),
    );
    setEditingTask(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTaskForm((prev) => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
  };

  const taskStatusColor = (status: Task['status']) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
    if (status === 'Review') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  const taskStatusLabel = (status: Task['status']) => {
    if (status === 'Todo') return 'Belum Mulai';
    if (status === 'In Progress') return 'Sedang Berjalan';
    if (status === 'Review') return 'Ditinjau';
    return 'Selesai';
  };

  const priorityLabel = (p: Task['priority']) => {
    if (p === 'High') return 'Tinggi';
    if (p === 'Medium') return 'Sedang';
    return 'Rendah';
  };

  return (
    <>
      <div className="grid h-full min-w-0 gap-6 xl:grid-cols-[minmax(52rem,68%)_minmax(0,1fr)]">
        {/* ---- LEFT PANEL ---- */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2>Ketercapaian</h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setNewProj(EMPTY_NEW_PROJ);
                  setShowNewProject(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Kegiatan
              </Button>
              <Button size="sm" variant="ghost">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
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

          <Card>
            <CardHeader className="p-4 pb-3">
              <CardDescription>Ketercapaian keseluruhan</CardDescription>
              <CardTitle className="text-lg">
                {filteredTotals.uploaded} / {filteredTotals.target} buku
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Progress Upload</span>
                <span>{filteredProgressPercent}%</span>
              </div>
              <Progress value={filteredProgressPercent} className="h-2" />
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredProjects.map((project) => {
              const { targetBooks, uploadedBooks, completionPercent } = getBookMetrics(project);
              return (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all ${
                    selectedProject.id === project.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm leading-5 flex-1 min-w-0">{project.name}</CardTitle>
                      <Badge
                        variant={project.status === 'Active' ? 'default' : 'secondary'}
                        className="text-xs shrink-0"
                      >
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Progress</span>
                        <span>{completionPercent}%</span>
                      </div>
                      <Progress value={completionPercent} className="h-2 w-full bg-gray-200 [&>div]:bg-blue-600" />
                      <div className="flex justify-between text-xs text-gray-500 gap-3">
                        <span className="truncate">{uploadedBooks} dari {targetBooks} buku sudah diunggah</span>
                        <span className="shrink-0">Target {targetBooks}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ---- RIGHT PANEL (detail) ---- */}
        <div className="min-w-0 space-y-6">
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
              <TabsTrigger value="tasks">Tugas SKP</TabsTrigger>
              <TabsTrigger value="deliverables">Dokumen</TabsTrigger>
              <TabsTrigger value="team">Pegawai</TabsTrigger>
            </TabsList>

            {/* Ringkasan */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tujuan & Sasaran Kegiatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{selectedProject.objectives || '—'}</p>
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

            {/* Tugas SKP */}
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Pengelolaan Tugas SKP</CardTitle>
                  <CardDescription>Kelola tugas bulanan dan capaian SKP</CardDescription>
                </CardHeader>
                <CardContent>
                  {projectTasks.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Belum ada tugas untuk kegiatan ini</p>
                  ) : (
                    <div className="space-y-3">
                      {projectTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="font-medium text-sm leading-5">{task.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${taskStatusColor(task.status)}`}>
                                {taskStatusLabel(task.status)}
                              </span>
                              <span className="text-xs text-gray-500">Prioritas: {priorityLabel(task.priority)}</span>
                              <span className="text-xs text-gray-500">
                                Tenggat: {new Date(task.dueDate).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            {(task.skpCount != null || task.imageUrl) && (
                              <div className="flex items-center gap-3 mt-1 text-xs">
                                {task.skpCount != null && (
                                  <span className="font-semibold text-blue-600">SKP: {task.skpCount}</span>
                                )}
                                {task.imageUrl && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <ImageIcon className="w-3 h-3" />
                                    Bukti diunggah
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            onClick={() => openEditTask(task)}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dokumen */}
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

            {/* Pegawai */}
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Pegawai yang Terlibat</CardTitle>
                  <CardDescription>Pegawai yang mengerjakan kegiatan ini</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedProject.assignedTeam.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Belum ada pegawai untuk kegiatan ini</p>
                    ) : (
                      selectedProject.assignedTeam.map((member, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('open-organization-member', { detail: { member } }),
                            );
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                              {member.split(' ').map((n) => n[0]).join('')}
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
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ============ DIALOG: Tambah Kegiatan Baru ============ */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Kegiatan Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="np-name">Nama Kegiatan *</Label>
              <Input
                id="np-name"
                placeholder="Contoh: Upload Buku Laporan Kinerja Q1"
                value={newProj.name}
                onChange={(e) => setNewProj((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="np-client">Bidang Pemberi Tugas</Label>
                <Input
                  id="np-client"
                  placeholder="Contoh: Bidang Perencanaan"
                  value={newProj.client}
                  onChange={(e) => setNewProj((prev) => ({ ...prev, client: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-ws">Unit Kerja</Label>
                <Input
                  id="np-ws"
                  placeholder="Contoh: Unit Perencanaan Kinerja"
                  value={newProj.workspace}
                  onChange={(e) => setNewProj((prev) => ({ ...prev, workspace: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="np-deadline">Tenggat Waktu *</Label>
                <Input
                  id="np-deadline"
                  type="date"
                  value={newProj.deadline}
                  onChange={(e) => setNewProj((prev) => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-skp">Target SKP</Label>
                <Input
                  id="np-skp"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newProj.activeTasks}
                  onChange={(e) => setNewProj((prev) => ({ ...prev, activeTasks: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-obj">Tujuan Kegiatan</Label>
              <Textarea
                id="np-obj"
                placeholder="Jelaskan tujuan dan sasaran kegiatan ini..."
                rows={3}
                value={newProj.objectives}
                onChange={(e) => setNewProj((prev) => ({ ...prev, objectives: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProject(false)}>
              Batal
            </Button>
            <Button onClick={handleAddProject} disabled={!newProj.name.trim() || !newProj.deadline}>
              Simpan Kegiatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DIALOG: Edit Tugas SKP ============ */}
      <Dialog open={!!editingTask} onOpenChange={(open: boolean) => { if (!open) setEditingTask(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Tugas SKP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="et-title">Judul Tugas</Label>
              <Input
                id="et-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="et-status">Status</Label>
                <Select
                  value={taskForm.status}
                  onValueChange={(v: string) => setTaskForm((prev) => ({ ...prev, status: v as Task['status'] }))}
                >
                  <SelectTrigger id="et-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">Belum Mulai</SelectItem>
                    <SelectItem value="In Progress">Sedang Berjalan</SelectItem>
                    <SelectItem value="Review">Ditinjau</SelectItem>
                    <SelectItem value="Completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="et-priority">Prioritas</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v: string) => setTaskForm((prev) => ({ ...prev, priority: v as Task['priority'] }))}
                >
                  <SelectTrigger id="et-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">Tinggi</SelectItem>
                    <SelectItem value="Medium">Sedang</SelectItem>
                    <SelectItem value="Low">Rendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="et-due">Tenggat Waktu</Label>
                <Input
                  id="et-due"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="et-skp">Jumlah SKP Dilakukan</Label>
                <Input
                  id="et-skp"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={taskForm.skpCount}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, skpCount: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Upload Bukti Gambar</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                {taskForm.imageUrl ? (
                  <img src={taskForm.imageUrl} alt="Preview bukti" className="max-h-40 rounded object-contain" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Klik untuk unggah gambar bukti SKP</p>
                    <p className="text-xs text-gray-400">PNG, JPG, JPEG (maks. 5 MB)</p>
                  </>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleImageChange}
              />
              {taskForm.imageUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={() => setTaskForm((prev) => ({ ...prev, imageUrl: '' }))}
                >
                  Hapus gambar
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveTask}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
