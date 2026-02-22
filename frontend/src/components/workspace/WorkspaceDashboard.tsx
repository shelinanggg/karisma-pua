import { useState } from 'react';
import { ArrowLeft, Users, FolderKanban, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { mockProjects, mockTasks, mockUsers } from '../../data/mockData';
import { Workspace } from '../../types';

interface WorkspaceDashboardProps {
  workspace: Workspace;
  onBack: () => void;
}

export function WorkspaceDashboard({ workspace, onBack }: WorkspaceDashboardProps) {
  const workspaceProjects = mockProjects.filter(p => p.workspace === workspace.name);
  const allWorkspaceTasks = workspaceProjects.flatMap(project => 
    mockTasks.filter(task => task.projectId === project.id)
  );
  
  const activeTasks = allWorkspaceTasks.filter(t => t.status !== 'Completed');
  const completedTasks = allWorkspaceTasks.filter(t => t.status === 'Completed');
  const highPriorityTasks = activeTasks.filter(t => t.priority === 'High');
  
  const activeProjects = workspaceProjects.filter(p => p.status === 'Active');
  const completedProjects = workspaceProjects.filter(p => p.status === 'Completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1>{workspace.name}</h1>
          <p className="text-gray-600 mt-1">Workspace Dashboard</p>
        </div>
        <Badge variant={workspace.isPrivate ? 'secondary' : 'default'}>
          {workspace.isPrivate ? 'Private' : 'Organization'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              Total Projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{workspaceProjects.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {activeProjects.length} active, {completedProjects.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Active Tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeTasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {highPriorityTasks.length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed Tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{completedTasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((completedTasks.length / allWorkspaceTasks.length) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{workspace.members}</div>
            <p className="text-xs text-gray-500 mt-1">
              Active contributors
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects in this Workspace</CardTitle>
            <CardDescription>All projects and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workspaceProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p>{project.name}</p>
                      <p className="text-sm text-gray-500">{project.client}</p>
                    </div>
                    <Badge
                      variant={
                        project.status === 'Active' ? 'default' :
                        project.status === 'Paused' ? 'secondary' : 'outline'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                    <span>{project.activeTasks} active tasks</span>
                    <span>{project.assignedTeam.length} members</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Tasks</CardTitle>
              <CardDescription>Tasks requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highPriorityTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{task.assignedTo}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs ml-2">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
                {highPriorityTasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No high priority tasks
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates in this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                  <div>
                    <p>Task completed: "Data collection from Google Analytics"</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                  <div>
                    <p>New task assigned: "Analyze conversion funnel"</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                  <div>
                    <p>Project updated: Q4 Campaign Analysis progress to 65%</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Complete task list across all projects in this workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allWorkspaceTasks.map((task) => {
                const project = workspaceProjects.find(p => p.id === task.projectId);
                return (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{project?.name || 'Unknown'}</TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
