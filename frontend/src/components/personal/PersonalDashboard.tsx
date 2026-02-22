import { Folder, CheckSquare, FileText, Clock, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

import { myActiveTasks, myCompletedTasks, assignedByMeTasks } from '../../data/personalTasksData';

const personalStats = {
  projects: 2,
  activeTasks: myActiveTasks.length,
  completedTasks: myCompletedTasks.length,
  tasksIAssigned: assignedByMeTasks.length,
  drafts: 3,
  aiQueriesThisWeek: 47,
  needsAttention: myActiveTasks.filter(t => t.reviewStatus === 'Needs Feedback').length,
};

const upcomingDeadlines = myActiveTasks
  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  .slice(0, 3);

const recentActivity = [
  { action: 'Completed task: Complete data collection', time: '2 hours ago' },
  { action: 'Created new draft: Customer Segmentation Analysis', time: '5 hours ago' },
  { action: 'Updated project: Market Research Prep to 45%', time: '1 day ago' },
];

export function PersonalDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Personal Workspace</h1>
        <p className="text-gray-600 mt-1">Your private space for prep work, research, and personal tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              My Projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{personalStats.projects}</div>
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
            <div className="text-2xl">{personalStats.activeTasks}</div>
            {personalStats.needsAttention > 0 && (
              <p className="text-xs text-orange-600 mt-1">{personalStats.needsAttention} need attention</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{personalStats.completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tasks I Assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{personalStats.tasksIAssigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Drafts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{personalStats.drafts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              AI Queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{personalStats.aiQueriesThisWeek}</div>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={item.priority === 'High' ? 'destructive' : 'default'}
                    className="text-xs ml-2"
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                  <div>
                    <p>{item.action}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Personal initiatives and prep work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p>Market Research Prep</p>
                    <p className="text-sm text-gray-500">In Progress</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p>Data Analysis Workshop</p>
                    <p className="text-sm text-gray-500">Draft</p>
                  </div>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span>20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Drafts</CardTitle>
            <CardDescription>AI-assisted work in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">Customer Segmentation Analysis Draft</p>
                  <p className="text-xs text-gray-500 mt-1">12 AI queries • Modified 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">Market Research Summary</p>
                  <p className="text-xs text-gray-500 mt-1">8 AI queries • Modified 1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">Q4 Campaign Recommendations</p>
                  <p className="text-xs text-gray-500 mt-1">15 AI queries • Modified 2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
