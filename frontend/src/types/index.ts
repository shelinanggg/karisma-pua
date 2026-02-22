export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'Admin' | 'Manager' | 'Analyst' | 'Viewer';
  status: 'Active' | 'Inactive';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'Active' | 'Paused' | 'Completed';
  assignedTeam: string[];
  workspace: string;
  progress: number;
  deadline: string;
  objectives: string;
  activeTasks: number;
  completedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assignedTo: string;
  assignedBy?: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Completed';
  reviewStatus?: 'Draft' | 'Sent for Review' | 'Needs Feedback' | 'Approved' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  feedback?: string;
  lastReviewUpdate?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'Organization' | 'Personal';
  projectCount: number;
  members: number;
  isPrivate: boolean;
}

export interface Deliverable {
  id: string;
  name: string;
  type: string;
  projectId: string;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}
