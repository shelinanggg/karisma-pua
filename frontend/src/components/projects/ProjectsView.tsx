import { useState } from 'react';
import { Filter, Calendar, Users, FileText, Zap, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { mockProjects, mockTasks, mockDeliverables } from '../../data/mockData';

export function ProjectsView() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredProjects = statusFilter === 'all' 
    ? mockProjects 
    : mockProjects.filter(p => p.status === statusFilter);
  
  const projectTasks = mockTasks.filter(t => t.projectId === selectedProject.id);
  const projectDeliverables = mockDeliverables.filter(d => d.projectId === selectedProject.id);

  return (
    <div className="flex h-full gap-6">
      <div className="w-80 space-y-4">
        <div className="flex items-center justify-between">
          <h2>Projects</h2>
          <Button size="sm" variant="ghost">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="space-y-2">
          {filteredProjects.map((project) => (
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
                    <CardTitle className="text-sm truncate">{project.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{project.client}</CardDescription>
                  </div>
                  <Badge
                    variant={project.status === 'Active' ? 'default' : 'secondary'}
                    className="text-xs shrink-0"
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1>{selectedProject.name}</h1>
              <p className="text-gray-600 mt-1">{selectedProject.client}</p>
            </div>
            <Badge
              variant={
                selectedProject.status === 'Active' ? 'default' :
                selectedProject.status === 'Paused' ? 'secondary' : 'outline'
              }
            >
              {selectedProject.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{selectedProject.progress}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{selectedProject.activeTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{selectedProject.completedTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Team Size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{selectedProject.assignedTeam.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="ai">AI Agent</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Objectives</CardTitle>
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
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline</span>
                      <span>{new Date(selectedProject.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Remaining</span>
                      <span>
                        {Math.ceil((new Date(selectedProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Connectors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs">MS</div>
                      <span className="text-sm">Microsoft Teams</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center text-xs">SP</div>
                      <span className="text-sm">SharePoint</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Active Tasks</CardTitle>
                <CardDescription>Active and pending tasks for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTasks.filter(t => t.status !== 'Completed').map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.priority === 'High' ? 'destructive' :
                              task.priority === 'Medium' ? 'default' : 'secondary'
                            }
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Tasks</CardTitle>
                <CardDescription>Successfully completed tasks for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Completed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTasks.filter(t => t.status === 'Completed').length > 0 ? (
                      projectTasks.filter(t => t.status === 'Completed').map((task) => (
                        <TableRow key={task.id} className="opacity-75">
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{task.assignedTo}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                task.priority === 'High' ? 'destructive' :
                                task.priority === 'Medium' ? 'default' : 'secondary'
                              }
                            >
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No completed tasks yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="deliverables">
            <Card>
              <CardHeader>
                <CardTitle>Project Deliverables</CardTitle>
                <CardDescription>Files linked to SharePoint/OneDrive</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectDeliverables.map((deliverable) => (
                      <TableRow key={deliverable.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {deliverable.name}
                        </TableCell>
                        <TableCell>{deliverable.type}</TableCell>
                        <TableCell>{deliverable.uploadedBy}</TableCell>
                        <TableCell>{new Date(deliverable.uploadedDate).toLocaleDateString()}</TableCell>
                        <TableCell>{deliverable.size}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Team Members</CardTitle>
                <CardDescription>Team members working on this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedProject.assignedTeam.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                          {member.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p>{member}</p>
                          <p className="text-sm text-gray-500">Analyst</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Bandwidth</p>
                          <p className="text-sm">75%</p>
                        </div>
                        <Progress value={75} className="w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Project AI Assistant
                </CardTitle>
                <CardDescription>Get AI-powered insights and assistance for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm">💡 <strong>AI Suggestion:</strong> Based on current progress and deadlines, consider prioritizing the "Analyze conversion funnel" task to stay on track.</p>
                  </div>
                  
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                        AI
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">Hello! I'm your project AI assistant. I can help you with:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                          <li>Analyzing project data and trends</li>
                          <li>Generating reports and summaries</li>
                          <li>Suggesting task priorities</li>
                          <li>Answering questions about deliverables</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask me anything about this project..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button>Send</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
