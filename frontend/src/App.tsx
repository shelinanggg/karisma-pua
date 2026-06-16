import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { SidebarPimpinan } from './components/SidebarPimpinan';
import { SidebarAdmin } from './components/SidebarAdmin';
import { SidebarPegawai } from './components/pegawai/SidebarPegawai';
import { TopBar } from './components/TopBar';
import { refreshApi } from './api/authApi';
import { clearAccessToken, getAccessToken, setAccessToken, shouldRememberAuth } from './utils/authToken';
import { useIsMobile } from './components/ui/use-mobile';

const LoginPage = lazy(() => import('./components/login/LoginPage').then((module) => ({ default: module.LoginPage })));
const PersonalDashboard = lazy(() => import('./components/personal/PersonalDashboard').then((module) => ({ default: module.PersonalDashboard })));
const PersonalProjectsView = lazy(() => import('./components/personal/PersonalProjectsView').then((module) => ({ default: module.PersonalProjectsView })));
const PersonalTasksView = lazy(() => import('./components/personal/PersonalTasksView').then((module) => ({ default: module.PersonalTasksView })));
const PersonalDraftsView = lazy(() => import('./components/personal/PersonalDraftsView').then((module) => ({ default: module.PersonalDraftsView })));

const PimpinanOverview = lazy(() => import('./components/pimpinan/PimpinanOverview').then((module) => ({ default: module.PimpinanOverview })));
const PimpinanEarlyWarningSystemView = lazy(() => import('./components/pimpinan/PimpinanEarlyWarningSystemView').then((module) => ({ default: module.PimpinanEarlyWarningSystemView })));
const PimpinanKegiatanView = lazy(() => import('./components/pimpinan/PimpinanKegiatanView').then((module) => ({ default: module.PimpinanKegiatanView })));
const PimpinanApprovalPegawaiView = lazy(() => import('./components/pimpinan/PimpinanApprovalPegawaiView').then((module) => ({ default: module.PimpinanApprovalPegawaiView })));
const PimpinanApprovalSKPDetailView = lazy(() => import('./components/pimpinan/PimpinanApprovalSKPView').then((module) => ({ default: module.PimpinanApprovalSKPDetailView })));
const PimpinanDataKepegawaianView = lazy(() => import('./components/pimpinan/PimpinanDataKepegawaianView').then((module) => ({ default: module.PimpinanDataKepegawaianView })));
const PimpinanPenugasanTambahanView = lazy(() => import('./components/pimpinan/PimpinanPenugasanTambahanView').then((module) => ({ default: module.PimpinanPenugasanTambahanView })));
const PimpinanProfilView = lazy(() => import('./components/pimpinan/PimpinanProfilView').then((module) => ({ default: module.PimpinanProfilView })));
const PimpinanPengaturanView = lazy(() => import('./components/pimpinan/PimpinanPengaturanView').then((module) => ({ default: module.PimpinanPengaturanView })));

const DashboardUtamaView = lazy(() => import('./components/admin/DashboardUtamaView').then((module) => ({ default: module.DashboardUtamaView })));
const DashboardKegiatanView = lazy(() => import('./components/admin/DashboardKegiatanView').then((module) => ({ default: module.DashboardKegiatanView })));
const AdminKegiatanEditorView = lazy(() => import('./components/admin/AdminKegiatanEditorView').then((module) => ({ default: module.AdminKegiatanEditorView })));
const MasterButirView = lazy(() => import('./components/admin/MasterButirView').then((module) => ({ default: module.MasterButirView })));
const PeriodeSkpView = lazy(() => import('./components/admin/PeriodeSkpView').then((module) => ({ default: module.PeriodeSkpView })));
const PenugasanView = lazy(() => import('./components/admin/PenugasanView').then((module) => ({ default: module.PenugasanView })));
const EditPenugasanTambahanView = lazy(() => import('./components/admin/PenugasanView').then((module) => ({ default: module.EditPenugasanTambahanView })));
const EditPenugasanButirView = lazy(() => import('./components/admin/PenugasanView').then((module) => ({ default: module.EditPenugasanButirView })));
const PenugasanButirFormView = lazy(() => import('./components/admin/PenugasanView').then((module) => ({ default: module.PenugasanButirFormView })));
const DataKepegawaianView = lazy(() => import('./components/admin/DataKepegawaianView').then((module) => ({ default: module.DataKepegawaianView })));
const EarlyWarningSystemView = lazy(() => import('./components/admin/EarlyWarningSystemView').then((module) => ({ default: module.EarlyWarningSystemView })));
const SistemView = lazy(() => import('./components/admin/SistemView').then((module) => ({ default: module.SistemView })));
const ProfilView = lazy(() => import('./components/admin/ProfilView').then((module) => ({ default: module.ProfilView })));
const PengaturanView = lazy(() => import('./components/admin/PengaturanView').then((module) => ({ default: module.PengaturanView })));

const PegawaiOverview = lazy(() => import('./components/pegawai/PegawaiOverview').then((module) => ({ default: module.PegawaiOverview })));
const PegawaiKegiatanView = lazy(() => import('./components/pegawai/PegawaiKegiatanView').then((module) => ({ default: module.PegawaiKegiatanView })));
const TargetKinerjaView = lazy(() => import('./components/pegawai/TargetKinerjaView').then((module) => ({ default: module.TargetKinerjaView })));
const RealisasiKinerjaView = lazy(() => import('./components/pegawai/RealisasiKinerjaView').then((module) => ({ default: module.RealisasiKinerjaView })));
const PenugasanTambahanView = lazy(() => import('./components/pegawai/PenugasanTambahanView').then((module) => ({ default: module.PenugasanTambahanView })));
const ProfilPegawaiView = lazy(() => import('./components/pegawai/ProfilPegawaiView').then((module) => ({ default: module.ProfilPegawaiView })));
const PegawaiSettingsView = lazy(() => import('./components/pegawai/PegawaiSettingsView').then((module) => ({ default: module.PegawaiSettingsView })));

function PageLoader() {
  return (
    <div className="flex min-h-[12rem] items-center justify-center text-sm text-gray-500">
      Memuat halaman...
    </div>
  );
}

function getUserRole(): string | null {
  const token = getAccessToken();
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const token = getAccessToken();
  const userRole = getUserRole();

  useEffect(() => {
    if (!isMobile) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobile]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to={`/${userRole}/${getDefaultRouteByRole(userRole)}`} replace />;
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${allowedRole === 'admin' ? 'admin-layout' : ''}`}>
      {!isMobile && (
        <SidebarComponent />
      )}
      {isMobile && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <SidebarComponent onNavigate={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onOpenSidebar={isMobile ? () => setIsMobileSidebarOpen(true) : undefined} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function PublicLayout() {
  const token = getAccessToken();
  const userRole = getUserRole();

  if (token && userRole) {
    return <Navigate to={`/${userRole}/${getDefaultRouteByRole(userRole)}`} replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

function RootRedirect() {
  const token = getAccessToken();
  const userRole = getUserRole();

  if (token && userRole) {
    return <Navigate to={`/${userRole}/${getDefaultRouteByRole(userRole)}`} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let ignore = false;

    const bootstrapAuth = async () => {
      if (getAccessToken()) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const data = await refreshApi(shouldRememberAuth());
        if (!ignore) setAccessToken(data.accessToken, shouldRememberAuth());
      } catch {
        if (!ignore) clearAccessToken();
      } finally {
        if (!ignore) setIsCheckingAuth(false);
      }
    };

    bootstrapAuth();

    return () => {
      ignore = true;
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Memeriksa sesi...
      </div>
    );
  }

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
        <Route path="early-warning-system" element={<PimpinanEarlyWarningSystemView />} />
        <Route path="kegiatan" element={<PimpinanKegiatanView />} />
        <Route path="approval-pegawai" element={<PimpinanApprovalPegawaiView />} />
        <Route path="approval-pegawai/realisasi/:pegawaiId" element={<PimpinanApprovalSKPDetailView />} />
        <Route path="approval-skp" element={<Navigate to="/pimpinan/approval-pegawai" replace />} />
        <Route path="approval-kegiatan" element={<Navigate to="/pimpinan/approval-pegawai" replace />} />
        <Route path="penugasan-tambahan" element={<PimpinanPenugasanTambahanView />} />
        <Route path="data-kepegawaian" element={<PimpinanDataKepegawaianView />} />
        <Route path="profil" element={<PimpinanProfilView />} />
        <Route path="pengaturan" element={<PimpinanPengaturanView />} />
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
        <Route path="dashboard-utama" element={<DashboardUtamaView />} />
        <Route path="kegiatan" element={<DashboardKegiatanView />} />
        <Route path="kelola-kegiatan" element={<AdminKegiatanEditorView />} />
        <Route path="master-butir" element={<MasterButirView />} />
        <Route path="master-periode" element={<PeriodeSkpView />} />
        <Route path="penugasan" element={<PenugasanView />} />
        <Route path="penugasan/edit-penugasan-tambahan/:penugasanId" element={<EditPenugasanTambahanView />} />
        <Route path="penugasan/master-butir/ubah/:pegawaiId" element={<EditPenugasanButirView />} />
        <Route path="penugasan/master-butir/terapkan-ke/:pegawaiId" element={<PenugasanButirFormView />} />
        <Route path="data-kepegawaian" element={<DataKepegawaianView />} />
        <Route path="early-warning-system" element={<EarlyWarningSystemView />} />
        <Route path="sistem" element={<SistemView />} />
        <Route path="profil" element={<ProfilView />} />
        <Route path="pengaturan" element={<PengaturanView />} />
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
        <Route path="kegiatan" element={<PegawaiKegiatanView />} />
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
