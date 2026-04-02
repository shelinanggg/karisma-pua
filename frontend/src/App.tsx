import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/overview/OverviewView';
import { ProjectsView } from './components/projects/ProjectsView';
import { OrganizationView } from './components/organization/OrganizationView';
import { AccountView } from './components/account/AccountView';
import { SettingsView } from './components/settings/SettingsView';
import { PersonalDashboard } from './components/personal/PersonalDashboard';
import { PersonalProjectsView } from './components/personal/PersonalProjectsView';
import { PersonalTasksView } from './components/personal/PersonalTasksView';
import { PersonalDraftsView } from './components/personal/PersonalDraftsView';
import { LoginPage } from './components/login/LoginPage';

function ProtectedLayout() {
  const isLoggedIn = !!localStorage.getItem('token');
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewView />} />
        <Route path="projects" element={<ProjectsView />} />
        <Route path="organization" element={<OrganizationView />} />
        <Route path="account" element={<AccountView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="personal-dashboard" element={<PersonalDashboard />} />
        <Route path="personal-projects" element={<PersonalProjectsView />} />
        <Route path="personal-tasks" element={<PersonalTasksView />} />
        <Route path="personal-drafts" element={<PersonalDraftsView />} />
      </Route>
    </Routes>
  );
}