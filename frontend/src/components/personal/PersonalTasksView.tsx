import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Send, MessageCircle, XCircle, ThumbsUp, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { myActiveTasks, myCompletedTasks, assignedByMeTasks } from '../../data/personalTasksData';
import { Task } from '../../types';

export function PersonalTasksView() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReviewAction = (task: Task, action: string) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
    // In a real app, this would update the task status
    console.log(`${action} for task:`, task.title);
  };

  const submitFeedback = () => {
    console.log('Feedback submitted:', feedbackText);
    setIsDialogOpen(false);
    setFeedbackText('');
    setSelectedTask(null);
  };

  const getReviewStatusBadge = (reviewStatus?: string) => {
    if (!reviewStatus) return null;
    
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      'Draft': { variant: 'secondary', icon: Circle, color: 'text-gray-500' },
      'Sent for Review': { variant: 'default', icon: Send, color: 'text-blue-500' },
      'Needs Feedback': { variant: 'destructive', icon: AlertCircle, color: 'text-orange-500' },
      'Approved': { variant: 'default', icon: ThumbsUp, color: 'text-green-500' },
      'Rejected': { variant: 'destructive', icon: XCircle, color: 'text-red-500' },
    };

    const config = variants[reviewStatus] || variants['Draft'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="w-3 h-3 mr-1" />
        {reviewStatus}
      </Badge>
    );
  };

  const renderTaskCard = (task: Task, showActions: boolean = true) => (
    <Card key={task.id} className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {task.status !== 'Completed' && (
            <Checkbox className="mt-1" />
          )}
          {task.status === 'Completed' && (
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className={task.status === 'Completed' ? 'line-through text-gray-500' : ''}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    variant={
                      task.priority === 'High' ? 'destructive' :
                      task.priority === 'Medium' ? 'default' : 'outline'
                    }
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                  {getReviewStatusBadge(task.reviewStatus)}
                  {task.assignedBy && task.assignedBy !== 'Self' && (
                    <span className="text-xs text-gray-500">Assigned by: {task.assignedBy}</span>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
                {task.feedback && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                    <p className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <strong>Feedback:</strong>
                    </p>
                    <p className="mt-1 text-gray-700">{task.feedback}</p>
                  </div>
                )}
              </div>
            </div>
            
            {showActions && task.status !== 'Completed' && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                {task.reviewStatus === 'Draft' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReviewAction(task, 'Send for Review')}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send for Review
                  </Button>
                )}
                {task.reviewStatus === 'Needs Feedback' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReviewAction(task, 'Update & Resubmit')}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Resubmit
                  </Button>
                )}
                {task.reviewStatus === 'Sent for Review' && (
                  <Badge variant="outline" className="text-xs">
                    Awaiting review...
                  </Badge>
                )}
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleReviewAction(task, 'Mark Complete')}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Complete
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAssignedTaskCard = (task: Task) => (
    <Card key={task.id} className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
            {task.assignedTo.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className={task.status === 'Completed' ? 'line-through text-gray-500' : ''}>
                  {task.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">Assigned to: {task.assignedTo}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    variant={
                      task.priority === 'High' ? 'destructive' :
                      task.priority === 'Medium' ? 'default' : 'outline'
                    }
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                  {getReviewStatusBadge(task.reviewStatus)}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {task.status !== 'Completed' && (task.reviewStatus === 'Sent for Review' || task.reviewStatus === 'Needs Feedback') && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsDialogOpen(true);
                  }}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsDialogOpen(true);
                  }}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Request Changes
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsDialogOpen(true);
                  }}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your tasks and review cycles</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myActiveTasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {myActiveTasks.filter(t => t.reviewStatus === 'Needs Feedback').length} need attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{myCompletedTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasks I Assigned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{assignedByMeTasks.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {assignedByMeTasks.filter(t => t.reviewStatus === 'Sent for Review').length} awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active Tasks ({myActiveTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Tasks ({myCompletedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Tasks I Assigned ({assignedByMeTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          <div className="space-y-2">
            {myActiveTasks.map((task) => renderTaskCard(task))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          <div className="space-y-2">
            {myCompletedTasks.map((task) => renderTaskCard(task, false))}
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4 mt-4">
          <div className="space-y-2">
            {assignedByMeTasks.map((task) => renderAssignedTaskCard(task))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              {selectedTask && `Task: ${selectedTask.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="feedback">Feedback or Comments</Label>
              <Textarea
                id="feedback"
                placeholder="Enter your feedback, suggestions, or approval notes..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="mt-2 min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitFeedback}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
