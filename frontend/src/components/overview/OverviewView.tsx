import { useState } from 'react';
import { Plus, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { mockWorkspaces, mockProjects, mockKPIs } from '../../data/mockData';
import { WorkspaceDashboard } from '../workspace/WorkspaceDashboard';
import { Workspace } from '../../types';

export function OverviewView() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  if (selectedWorkspace) {
    return <WorkspaceDashboard workspace={selectedWorkspace} onBack={() => setSelectedWorkspace(null)} />;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Dashboard
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKPIs.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl">{kpi.value}</div>
                  {kpi.change && (
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.change}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2>Active Workspaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {mockWorkspaces.map((workspace) => (
            <Card 
              key={workspace.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedWorkspace(workspace)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                    {workspace.name.charAt(0)}
                  </div>
                  {workspace.isPrivate && (
                    <Badge variant="secondary" className="text-xs">Private</Badge>
                  )}
                </div>
                <CardTitle className="mt-3">{workspace.name}</CardTitle>
                <CardDescription>{workspace.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{workspace.projectCount} projects</span>
                  <span className="text-gray-600">{workspace.members} members</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2>Recent Projects</h2>
          <Button variant="link">View All Projects →</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockProjects.slice(0, 4).map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {project.client} • {project.workspace}
                    </CardDescription>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-600">{project.activeTasks} active</span>
                    <span className="text-gray-600">{project.completedTasks} completed</span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.assignedTeam.slice(0, 3).map((member, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs border-2 border-white"
                        title={member}
                      >
                        {member.split(' ').map(n => n[0]).join('')}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
