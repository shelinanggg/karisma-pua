import { UserPlus, Shield, BarChart3, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { mockUsers } from '../../data/mockData';

export function OrganizationView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Organization</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and organizational settings</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="connectors">Connectors</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage user access and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Active' ? 'default' : 'outline'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Configure what each role can access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <p>Admin</p>
                    <p className="text-sm text-gray-500">Full access to all features</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Manage Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Edit Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">View Analytics</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <p>Manager</p>
                    <p className="text-sm text-gray-500">Can manage projects and teams</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">Manage Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">Edit Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">View Analytics</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <p>Analyst</p>
                    <p className="text-sm text-gray-500">Can work on assigned tasks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">Manage Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <span className="text-sm">Edit Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <span className="text-sm">View Analytics</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Team Utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">78%</div>
                <p className="text-sm text-gray-500 mt-1">Average across all members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Projects Delivered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">24</div>
                <p className="text-sm text-gray-500 mt-1">This quarter</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Completion Time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">18 days</div>
                <p className="text-sm text-gray-500 mt-1">Per project</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>Team performance and bottleneck analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Task Completion Rate</span>
                    <span className="text-sm">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">On-Time Delivery</span>
                    <span className="text-sm">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Resource Utilization</span>
                    <span className="text-sm">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Flow Bottlenecks</CardTitle>
              <CardDescription>Identify areas slowing down project delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Data Collection Phase</p>
                      <p className="text-sm text-gray-600">Average delay: 2.3 days</p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100">Medium Risk</Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Client Review Process</p>
                      <p className="text-sm text-gray-600">Average delay: 4.1 days</p>
                    </div>
                    <Badge variant="destructive">High Risk</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Integration Connectors
              </CardTitle>
              <CardDescription>Manage connections to external services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span>MS</span>
                    </div>
                    <div>
                      <p>Microsoft Teams</p>
                      <p className="text-sm text-gray-500">Integrated communication platform</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span>SP</span>
                    </div>
                    <div>
                      <p>SharePoint</p>
                      <p className="text-sm text-gray-500">Document storage and collaboration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span>OD</span>
                    </div>
                    <div>
                      <p>OneDrive</p>
                      <p className="text-sm text-gray-500">Cloud file storage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Not Connected</Badge>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
