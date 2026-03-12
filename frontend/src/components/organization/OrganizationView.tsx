import { useMemo, useState } from 'react';
import { UserPlus, Shield, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { mockProjects, mockTasks, mockUsers } from '../../data/mockData';

const roleDefinitions = [
  { role: 'Admin', description: 'Koordinasi organisasi dan monitoring capaian' },
  { role: 'Manager', description: 'Mengelola pelaksanaan proyek dan pembagian tugas' },
  { role: 'Analyst', description: 'Menjalankan kegiatan analisis dan eksekusi task' },
  { role: 'Viewer', description: 'Memonitor progres tanpa perubahan data utama' },
] as const;

export function OrganizationView() {
  const [selectedUserId, setSelectedUserId] = useState(mockUsers[0]?.id ?? '');

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

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] gap-6 min-w-0">
            <div className="space-y-3 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto pr-1">
              <h2>List Pegawai</h2>
              {mockUsers.map((user) => {
                const userTaskCount = mockTasks.filter((task) => task.assignedTo === user.name).length;
                const isSelected = user.id === selectedUser?.id;

                return (
                  <Card
                    key={user.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm shrink-0">
                            {user.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <Badge
                          variant={user.status === 'Active' ? 'default' : 'outline'}
                          className="text-xs shrink-0"
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 pb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{user.role}</span>
                        <span>{userTaskCount} kegiatan</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex-1 space-y-4 min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Pegawai</CardTitle>
                  <CardDescription>Ringkasan user yang dipilih</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>{selectedUser?.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedUser?.email}</p>
                    </div>
                    <Badge variant={selectedUser?.role === 'Admin' ? 'default' : 'secondary'}>
                      <Shield className="w-3 h-3 mr-1" />
                      {selectedUser?.role}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-gray-500">Total Kegiatan</p>
                      <p className="text-xl mt-1">{selectedUserTasks.length}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-gray-500">Kegiatan Aktif</p>
                      <p className="text-xl mt-1">{activeCount}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-gray-500">Kegiatan Selesai</p>
                      <p className="text-xl mt-1">{completedCount}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">Terlibat di {selectedUserProjectIds.length} proyek</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Data Kegiatan
                  </CardTitle>
                  <CardDescription>Aktivitas user yang dipilih (tanpa team size)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table className="min-w-[760px]">
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
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleSummary.map((item) => (
              <Card key={item.role}>
                <CardHeader className="pb-2">
                  <CardDescription>{item.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{item.count}</div>
                  <p className="text-xs text-gray-500 mt-1">pegawai</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Role Directory</CardTitle>
              <CardDescription>Ringkasan peran pegawai dalam organisasi</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Jumlah User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleSummary.map((item) => (
                    <TableRow key={item.role}>
                      <TableCell>{item.role}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
