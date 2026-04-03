import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { SidebarPimpinan } from './components/SidebarPimpinan';
import { SidebarAdmin } from './components/SidebarAdmin';
import { SidebarPegawai } from './components/SidebarPegawai';
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

function getUserRole(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded: { role?: string } = jwtDecode(token);
    return decoded.role || null;
  } catch (e) {
    return null;
  }
}

function CommonLayout({ SidebarComponent, allowedRole }: { SidebarComponent: React.ElementType, allowedRole: string }) {
  const token = localStorage.getItem('token');
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to={`/${userRole}/overview`} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarComponent />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PublicLayout() {
  const token = localStorage.getItem('token');
  const userRole = getUserRole();

  if (token && userRole) {
    return <Navigate to={`/${userRole}/overview`} replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const token = localStorage.getItem('token');
  const userRole = getUserRole();

  if (token && userRole) {
    return <Navigate to={`/${userRole}/overview`} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      
      <Route path="/" element={<RootRedirect />} />

      {/* Role: pimpinan */}
      <Route path="/pimpinan" element={<CommonLayout SidebarComponent={SidebarPimpinan} allowedRole="pimpinan" />}>
        <Route index element={<Navigate to="overview" replace />} />
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

      {/* Role: admin */}
      <Route path="/admin" element={<CommonLayout SidebarComponent={SidebarAdmin} allowedRole="admin" />}>
        <Route index element={<Navigate to="overview" replace />} />
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

      {/* Role: pegawai */}
      <Route path="/pegawai" element={<CommonLayout SidebarComponent={SidebarPegawai} allowedRole="pegawai" />}>
        <Route index element={<Navigate to="overview" replace />} />
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