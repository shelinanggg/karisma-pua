import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, UserPlus, Shield, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { mockProjects, mockTasks, mockUsers } from '../../data/mockData';

const roleDefinitions = [
  { role: 'Admin', description: 'Koordinasi organisasi dan monitoring capaian' },
  { role: 'Manager', description: 'Mengelola pelaksanaan proyek dan pembagian tugas' },
  { role: 'Analyst', description: 'Menjalankan kegiatan analisis dan eksekusi task' },
  { role: 'Viewer', description: 'Memonitor progres tanpa perubahan data utama' },
] as const;

const employeeProfiles: Record<string, Record<string, string>> = {
  'Sarah Johnson': {
    nip: '198801052010012001',
    tempatLahir: 'Jakarta',
    tanggalLahir: '05 Januari 1988',
    jenisKelamin: 'Perempuan',
    jabatan: 'Admin Organisasi',
    pangkat: 'Penata Muda Tk. I',
    golongan: 'III/b',
    pendidikan: 'S1',
    penempatan: 'Bagian Administrasi',
  },
  'Michael Chen': {
    nip: '198709122011011002',
    tempatLahir: 'Surabaya',
    tanggalLahir: '12 September 1987',
    jenisKelamin: 'Laki-laki',
    jabatan: 'Manajer Program',
    pangkat: 'Penata',
    golongan: 'III/c',
    pendidikan: 'S2',
    penempatan: 'Unit Program',
  },
  'Emily Davis': {
    nip: '199001182012012003',
    tempatLahir: 'Bandung',
    tanggalLahir: '18 Januari 1990',
    jenisKelamin: 'Perempuan',
    jabatan: 'Analis Kinerja',
    pangkat: 'Penata Muda',
    golongan: 'III/a',
    pendidikan: 'S1',
    penempatan: 'Bidang Analisis',
  },
  'James Wilson': {
    nip: '199103072013012004',
    tempatLahir: 'Yogyakarta',
    tanggalLahir: '07 Maret 1991',
    jenisKelamin: 'Laki-laki',
    jabatan: 'Staf Kegiatan',
    pangkat: 'Pengatur Tk. I',
    golongan: 'II/d',
    pendidikan: 'D4',
    penempatan: 'Bidang Operasional',
  },
  'Lisa Anderson': {
    nip: '199204222014012005',
    tempatLahir: 'Malang',
    tanggalLahir: '22 April 1992',
    jenisKelamin: 'Perempuan',
    jabatan: 'Observer',
    pangkat: 'Pengatur',
    golongan: 'II/c',
    pendidikan: 'S1',
    penempatan: 'Monitoring Internal',
  },
};

const employeeFieldLabels = [
  ['nip', 'NIP / NIK'],
  ['tempatLahir', 'Tempat Lahir'],
  ['tanggalLahir', 'Tanggal Lahir'],
  ['jenisKelamin', 'Jenis Kelamin'],
  ['jabatan', 'Jabatan'],
  ['pangkat', 'Pangkat'],
  ['golongan', 'Golongan'],
  ['pendidikan', 'Pendidikan'],
  ['penempatan', 'Penempatan'],
] as const;

export function OrganizationView() {
  const [selectedUserId, setSelectedUserId] = useState(mockUsers[0]?.id ?? '');
  const [expandedUserId, setExpandedUserId] = useState(mockUsers[0]?.id ?? '');

  const selectedUser = useMemo(
    () => mockUsers.find((user) => user.id === selectedUserId) ?? mockUsers[0],
    [selectedUserId],
  );

  const selectedUserTasks = useMemo(
    () => mockTasks.filter((task) => task.assignedTo === selectedUser?.name),
    [selectedUser],
  );

  const selectedUserProjectIds = useMemo(
    () => Array.from(new Set(selectedUserTasks.map((task) => task.projectId))),
    [selectedUserTasks],
  );

  const roleSummary = useMemo(
    () =>
      roleDefinitions.map((item) => ({
        ...item,
        count: mockUsers.filter((user) => user.role === item.role).length,
      })),
    [],
  );

  const completedCount = selectedUserTasks.filter((task) => task.status === 'Completed').length;
  const activeCount = selectedUserTasks.filter((task) => task.status !== 'Completed').length;
  const selectedUserRoleDescription = roleDefinitions.find((item) => item.role === selectedUser?.role)?.description;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Organization</h1>
          <p className="text-gray-600 mt-1">Daftar pegawai dan aktivitas pekerjaan berdasarkan user</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>List Pegawai</CardTitle>
          <CardDescription>Klik baris user untuk menampilkan atau menyembunyikan detail kepegawaian dan kegiatan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nama User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kegiatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => {
                  const userTaskCount = mockTasks.filter((task) => task.assignedTo === user.name).length;
                  const isSelected = user.id === selectedUser?.id;
                  const isExpanded = expandedUserId === user.id;
                  const profile = employeeProfiles[user.name];

                  return (
                    <>
                      <TableRow
                        key={user.id}
                        className={`cursor-pointer ${isSelected ? 'bg-blue-50/60' : ''}`}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setExpandedUserId((current) => (current === user.id ? '' : user.id));
                        }}
                      >
                        <TableCell>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span>{user.name}</span>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'Active' ? 'default' : 'outline'}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>{userTaskCount} kegiatan</TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50/80 p-0">
                            <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                              <Card className="shadow-none">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Detail Kepegawaian
                                  </CardTitle>
                                  <CardDescription>{selectedUser?.name}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="rounded-xl border bg-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900">{selectedUser?.name}</p>
                                        <p className="text-xs text-gray-500">{selectedUser?.email}</p>
                                      </div>
                                      <Badge variant={selectedUser?.role === 'Admin' ? 'default' : 'secondary'}>
                                        {selectedUser?.role}
                                      </Badge>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600">{selectedUserRoleDescription ?? 'Belum ada deskripsi role.'}</p>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {employeeFieldLabels.map(([key, label]) => (
                                      <div key={key} className="rounded-lg border bg-white p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
                                        <p className="mt-1 text-sm font-medium text-gray-900">{profile?.[key] ?? '-'}</p>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-3 border rounded-lg bg-white">
                                      <p className="text-xs text-gray-500">Total Kegiatan</p>
                                      <p className="text-xl mt-1">{selectedUserTasks.length}</p>
                                    </div>
                                    <div className="p-3 border rounded-lg bg-white">
                                      <p className="text-xs text-gray-500">Kegiatan Aktif</p>
                                      <p className="text-xl mt-1">{activeCount}</p>
                                    </div>
                                    <div className="p-3 border rounded-lg bg-white">
                                      <p className="text-xs text-gray-500">Kegiatan Selesai</p>
                                      <p className="text-xl mt-1">{completedCount}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="shadow-none">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" />
                                    Data Kegiatan Pegawai
                                  </CardTitle>
                                  <CardDescription>Seluruh kegiatan milik user yang dipilih</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="overflow-x-auto">
                                    <Table className="min-w-[640px]">
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Kegiatan</TableHead>
                                          <TableHead>Proyek</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead>Prioritas</TableHead>
                                          <TableHead>Due Date</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedUserTasks.map((task) => {
                                          const project = mockProjects.find((item) => item.id === task.projectId);

                                          return (
                                            <TableRow key={task.id}>
                                              <TableCell className="font-medium">{task.title}</TableCell>
                                              <TableCell>{project?.name ?? '-'}</TableCell>
                                              <TableCell>
                                                <Badge variant="outline">{task.status}</Badge>
                                              </TableCell>
                                              <TableCell>
                                                <Badge
                                                  variant={
                                                    task.priority === 'High'
                                                      ? 'destructive'
                                                      : task.priority === 'Medium'
                                                        ? 'default'
                                                        : 'secondary'
                                                  }
                                                >
                                                  {task.priority}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                          );
                                        })}
                                        {selectedUserTasks.length === 0 && (
                                          <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                                              Belum ada kegiatan untuk user ini.
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
