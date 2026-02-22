import { Plus, Upload, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

const personalProjects = [
  {
    id: 'pp1',
    name: 'Market Research Prep',
    status: 'In Progress',
    progress: 45,
    lastUpdated: '2025-10-11',
    notes: 'Preliminary research for upcoming client project',
  },
  {
    id: 'pp2',
    name: 'Data Analysis Workshop',
    status: 'Draft',
    progress: 20,
    lastUpdated: '2025-10-09',
    notes: 'Personal learning project on advanced analytics',
  },
];

export function PersonalProjectsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>My Projects</h1>
          <p className="text-gray-600 mt-1">Your personal workspace for prep work and private initiatives</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Publish to Project
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {personalProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{project.notes}</p>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-center">Create New Personal Project</CardTitle>
          <CardDescription className="text-center">
            Use this space for research, prep work, or personal learning
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Start New Project
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
