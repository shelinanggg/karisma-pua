import { User, Project, Task, Workspace, Deliverable, KPIMetric } from '../types';

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Michael Chen', email: 'michael.c@company.com', role: 'Manager', status: 'Active' },
  { id: '3', name: 'Emily Davis', email: 'emily.d@company.com', role: 'Analyst', status: 'Active' },
  { id: '4', name: 'James Wilson', email: 'james.w@company.com', role: 'Analyst', status: 'Active' },
  { id: '5', name: 'Lisa Anderson', email: 'lisa.a@company.com', role: 'Viewer', status: 'Inactive' },
];

export const mockWorkspaces: Workspace[] = [
  { id: 'w1', name: 'Marketing Analytics', type: 'Organization', projectCount: 5, members: 8, isPrivate: false },
  { id: 'w2', name: 'Product Development', type: 'Organization', projectCount: 3, members: 6, isPrivate: false },
  { id: 'w3', name: 'Client Services', type: 'Organization', projectCount: 7, members: 12, isPrivate: false },
  { id: 'w4', name: 'My Personal Workspace', type: 'Personal', projectCount: 2, members: 1, isPrivate: true },
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Q4 Campaign Analysis',
    client: 'Acme Corp',
    status: 'Active',
    assignedTeam: ['Sarah Johnson', 'Emily Davis'],
    workspace: 'Marketing Analytics',
    progress: 65,
    deadline: '2025-11-15',
    objectives: 'Analyze Q4 marketing campaign performance and ROI across all channels',
    activeTasks: 8,
    completedTasks: 12,
  },
  {
    id: 'p2',
    name: 'Customer Segmentation',
    client: 'TechStart Inc',
    status: 'Active',
    assignedTeam: ['Michael Chen', 'James Wilson'],
    workspace: 'Marketing Analytics',
    progress: 40,
    deadline: '2025-12-01',
    objectives: 'Develop advanced customer segmentation model using behavioral data',
    activeTasks: 15,
    completedTasks: 8,
  },
  {
    id: 'p3',
    name: 'Product Launch Dashboard',
    client: 'InnovateCo',
    status: 'Paused',
    assignedTeam: ['Sarah Johnson'],
    workspace: 'Product Development',
    progress: 30,
    deadline: '2025-11-30',
    objectives: 'Create real-time dashboard for product launch metrics',
    activeTasks: 5,
    completedTasks: 3,
  },
  {
    id: 'p4',
    name: 'Sales Performance Report',
    client: 'Global Sales Ltd',
    status: 'Completed',
    assignedTeam: ['Emily Davis', 'James Wilson'],
    workspace: 'Client Services',
    progress: 100,
    deadline: '2025-10-05',
    objectives: 'Monthly sales performance analysis and forecasting',
    activeTasks: 0,
    completedTasks: 20,
  },
  {
    id: 'p5',
    name: 'Market Research Study',
    client: 'RetailMax',
    status: 'Active',
    assignedTeam: ['Michael Chen', 'Emily Davis', 'James Wilson'],
    workspace: 'Client Services',
    progress: 55,
    deadline: '2025-11-20',
    objectives: 'Comprehensive market research for new product line',
    activeTasks: 12,
    completedTasks: 10,
  },
];

export const mockTasks: Task[] = [
  { id: 't1', title: 'Data collection from Google Analytics', projectId: 'p1', assignedTo: 'Emily Davis', status: 'Completed', priority: 'High', dueDate: '2025-10-10' },
  { id: 't2', title: 'Create visualization templates', projectId: 'p1', assignedTo: 'Sarah Johnson', status: 'In Progress', priority: 'Medium', dueDate: '2025-10-16' },
  { id: 't3', title: 'Analyze conversion funnel', projectId: 'p1', assignedTo: 'Emily Davis', status: 'Todo', priority: 'High', dueDate: '2025-10-18' },
  { id: 't4', title: 'Prepare client presentation', projectId: 'p1', assignedTo: 'Sarah Johnson', status: 'Todo', priority: 'Medium', dueDate: '2025-10-20' },
  { id: 't8', title: 'Set up Google Analytics tracking', projectId: 'p1', assignedTo: 'Emily Davis', status: 'Completed', priority: 'High', dueDate: '2025-10-08' },
  { id: 't9', title: 'Initial data audit', projectId: 'p1', assignedTo: 'Sarah Johnson', status: 'Completed', priority: 'Medium', dueDate: '2025-10-09' },
  { id: 't5', title: 'Customer data preprocessing', projectId: 'p2', assignedTo: 'James Wilson', status: 'In Progress', priority: 'High', dueDate: '2025-10-15' },
  { id: 't6', title: 'Build clustering model', projectId: 'p2', assignedTo: 'Michael Chen', status: 'Todo', priority: 'High', dueDate: '2025-10-22' },
  { id: 't7', title: 'Validate segment definitions', projectId: 'p2', assignedTo: 'James Wilson', status: 'Todo', priority: 'Medium', dueDate: '2025-10-25' },
  { id: 't10', title: 'Data source identification', projectId: 'p2', assignedTo: 'Michael Chen', status: 'Completed', priority: 'High', dueDate: '2025-10-05' },
  { id: 't11', title: 'Define segmentation criteria', projectId: 'p2', assignedTo: 'James Wilson', status: 'Completed', priority: 'Medium', dueDate: '2025-10-07' },
  { id: 't12', title: 'Dashboard wireframes', projectId: 'p3', assignedTo: 'Sarah Johnson', status: 'Completed', priority: 'Medium', dueDate: '2025-09-28' },
  { id: 't13', title: 'Finalize sales metrics', projectId: 'p4', assignedTo: 'Emily Davis', status: 'Completed', priority: 'High', dueDate: '2025-10-02' },
  { id: 't14', title: 'Generate forecast models', projectId: 'p4', assignedTo: 'James Wilson', status: 'Completed', priority: 'High', dueDate: '2025-10-04' },
  { id: 't15', title: 'Survey design and distribution', projectId: 'p5', assignedTo: 'Michael Chen', status: 'Completed', priority: 'High', dueDate: '2025-10-06' },
  { id: 't16', title: 'Competitor analysis', projectId: 'p5', assignedTo: 'Emily Davis', status: 'In Progress', priority: 'High', dueDate: '2025-10-14' },
  { id: 't17', title: 'Focus group scheduling', projectId: 'p5', assignedTo: 'James Wilson', status: 'Todo', priority: 'Medium', dueDate: '2025-10-17' },
];

export const mockDeliverables: Deliverable[] = [
  { id: 'd1', name: 'Q4_Campaign_Analysis_Final.xlsx', type: 'Excel', projectId: 'p1', uploadedBy: 'Emily Davis', uploadedDate: '2025-10-10', size: '2.4 MB' },
  { id: 'd2', name: 'Campaign_Dashboard.pbix', type: 'Power BI', projectId: 'p1', uploadedBy: 'Sarah Johnson', uploadedDate: '2025-10-11', size: '5.1 MB' },
  { id: 'd3', name: 'Segmentation_Model_v2.py', type: 'Python', projectId: 'p2', uploadedBy: 'Michael Chen', uploadedDate: '2025-10-08', size: '128 KB' },
  { id: 'd4', name: 'Customer_Segments_Report.pdf', type: 'PDF', projectId: 'p2', uploadedBy: 'James Wilson', uploadedDate: '2025-10-12', size: '1.8 MB' },
];

export const mockKPIs: KPIMetric[] = [
  { label: 'Active Tasks', value: 40, change: '+12%', trend: 'up' },
  { label: 'Completed Tasks', value: 156, change: '+8%', trend: 'up' },
  { label: 'Avg. Delivery Time', value: '4.2 days', change: '-0.5 days', trend: 'up' },
  { label: 'AI Usage (This Month)', value: '234 queries', change: '+45%', trend: 'up' },
];

export const currentUser: User = mockUsers[0]; // Sarah Johnson as current user
