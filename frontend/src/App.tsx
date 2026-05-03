import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { SidebarPimpinan } from './components/SidebarPimpinan';
import { SidebarAdmin } from './components/SidebarAdmin';
import { SidebarPegawai } from './components/pegawai/SidebarPegawai';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/overview/OverviewView';
import { PimpinanOverview } from './components/pimpinan/PimpinanOverview';
import { PegawaiOverview } from './components/pegawai/PegawaiOverview';
import { ProjectsView } from './components/projects/ProjectsView';
import { OrganizationView } from './components/organization/OrganizationView';
import { AccountView } from './components/account/AccountView';
import { ProfilPegawaiView } from './components/pegawai/ProfilPegawaiView';
import { SettingsView } from './components/settings';
import { PegawaiSettingsView } from './components/pegawai/PegawaiSettingsView';
import { PersonalDashboard } from './components/personal/PersonalDashboard';
import { PersonalProjectsView } from './components/personal/PersonalProjectsView';
import { PersonalTasksView } from './components/personal/PersonalTasksView';
import { PersonalDraftsView } from './components/personal/PersonalDraftsView';
import { PimpinanKegiatanView } from './components/pimpinan/PimpinanKegiatanView';
import { LoginPage } from './components/login/LoginPage';
import {PenugasanTambahanView} from './components/pegawai/PenugasanTambahanView';
import { SystemSecurityView } from './components/admin/system/SystemSecurityView';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminKegiatanView } from './components/admin/AdminKegiatanView';
import { AdminOrganizationView } from './components/admin/AdminOrganizationView';
import { AdminProfilView } from './components/admin/AdminProfilView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { AdminNotificationView } from './components/admin/AdminNotificationView';
import { AdminMasterButirView } from './components/admin/AdminMasterButirView';
import {TargetKinerjaView} from './components/pegawai/TargetKinerjaView';
import {RealisasiKinerjaView} from './components/pegawai/RealisasiKinerjaView';

function getUserRole(): string | null {
  const token = sessionStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const decoded: { role?: string } = jwtDecode(token);
    return decoded.role || null;
  } catch (e) {
    return null;
  }
}

function getDefaultRouteByRole(role: string | null): string {
  if (role === 'pimpinan') return 'dashboard-utama';
  if (role === 'admin') return 'dashboard-utama';
  return 'overview';
}

function CommonLayout({ SidebarComponent, allowedRole }: { SidebarComponent: React.ElementType, allowedRole: string }) {
  const token = sessionStorage.getItem('accessToken');
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to={`/${userRole}/${getDefaultRouteByRole(userRole)}`} replace />;
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
  const token = sessionStorage.getItem('accessToken');
  const userRole = getUserRole();

  if (token && userRole) {
    return <Navigate to={`/${userRole}/${getDefaultRouteByRole(userRole)}`} replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const token = sessionStorage.getItem('accessToken');
  const userRole = getUserRole();

  if (token && userRole) {
    return <Navigate to={`/${userRole}/${getDefaultRouteByRole(userRole)}`} replace />;
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
        <Route index element={<Navigate to="dashboard-utama" replace />} />
        <Route path="dashboard-utama" element={<PimpinanOverview />} />
        <Route path="kegiatan" element={<PimpinanKegiatanView />} />
        <Route path="data-kepegawaian" element={<OrganizationView detailPlacement="bottom" />} />
        <Route path="profil" element={<AccountView />} />
        <Route path="pengaturan" element={<SettingsView />} />
        <Route path="overview" element={<Navigate to="/pimpinan/dashboard-utama" replace />} />
        <Route path="projects" element={<Navigate to="/pimpinan/kegiatan" replace />} />
        <Route path="organization" element={<Navigate to="/pimpinan/data-kepegawaian" replace />} />
        <Route path="account" element={<Navigate to="/pimpinan/profil" replace />} />
        <Route path="settings" element={<Navigate to="/pimpinan/pengaturan" replace />} />
        <Route path="personal-dashboard" element={<PersonalDashboard />} />
        <Route path="personal-projects" element={<PersonalProjectsView />} />
        <Route path="personal-tasks" element={<PersonalTasksView />} />
        <Route path="personal-drafts" element={<PersonalDraftsView />} />
      </Route>

      {/* Role: admin */}
      <Route path="/admin" element={<CommonLayout SidebarComponent={SidebarAdmin} allowedRole="admin" />}>
        <Route index element={<Navigate to="dashboard-utama" replace />} />
        <Route path="dashboard-utama" element={<AdminOverview />} />
        <Route path="kegiatan" element={<AdminKegiatanView />} />
        <Route path="master-butir" element={<AdminMasterButirView />} />
        <Route path="data-kepegawaian" element={<AdminOrganizationView />} />
        <Route path="notifikasi" element={<AdminNotificationView />} />
        <Route path="sistem" element={<SystemSecurityView />} />
        <Route path="profil" element={<AdminProfilView />} />
        <Route path="pengaturan" element={<AdminSettingsView />} />
        <Route path="overview" element={<Navigate to="/admin/dashboard-utama" replace />} />
        <Route path="projects" element={<Navigate to="/admin/kegiatan" replace />} />
        <Route path="organization" element={<Navigate to="/admin/data-kepegawaian" replace />} />
        <Route path="account" element={<Navigate to="/admin/profil" replace />} />
        <Route path="settings" element={<Navigate to="/admin/pengaturan" replace />} />
        <Route path="personal-dashboard" element={<PersonalDashboard />} />
        <Route path="personal-projects" element={<PersonalProjectsView />} />
        <Route path="personal-tasks" element={<PersonalTasksView />} />
        <Route path="personal-drafts" element={<PersonalDraftsView />} />
      </Route>

      {/* Role: pegawai */}
      <Route path="/pegawai" element={<CommonLayout SidebarComponent={SidebarPegawai} allowedRole="pegawai" />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<PegawaiOverview />} />
        <Route path="target-kinerja" element={<TargetKinerjaView />} />
        <Route path="projects" element={<RealisasiKinerjaView />} />
        <Route path="organization" element={<PenugasanTambahanView />} />
        <Route path="account" element={<ProfilPegawaiView />} />
        <Route path="settings" element={<PegawaiSettingsView />} />
        <Route path="personal-dashboard" element={<PersonalDashboard />} />
        <Route path="personal-projects" element={<PersonalProjectsView />} />
        <Route path="personal-tasks" element={<PersonalTasksView />} />
        <Route path="personal-drafts" element={<PersonalDraftsView />} />
      </Route>
    </Routes>
  );
}
