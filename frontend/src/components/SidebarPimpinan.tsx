import { LayoutDashboard, FolderKanban, Building2, User, Settings, ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';

import { useLocation, Link } from 'react-router-dom';

const UNAIR_LOGO_URL = 'https://arsip.unair.ac.id/wp-content/uploads/2019/01/logo-unair.png';

const navItems = [
  { id: 'dashboard-utama', label: 'Dashboard Utama', icon: LayoutDashboard },
  { id: 'kegiatan', label: 'Kegiatan', icon: FolderKanban },
  { id: 'data-kepegawaian', label: 'Data Kepegawaian', icon: Building2 },
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

export function SidebarPimpinan() {
  const location = useLocation();
  const segments = location.pathname.split('/');
  const activeView = segments[2] || 'dashboard-utama';

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#003DA5] rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={UNAIR_LOGO_URL}
              alt="Logo UNAIR"
              className="w-7 h-7 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 leading-tight">Karisma PUA</span>
            <span className="text-xs text-gray-500">Universitas Airlangga</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={`/pimpinan/${item.id}`}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    activeView === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {activeView === item.id && <ChevronRight className="w-4 h-4" />}
                </Link>
              </li>
            );
          })}
        </ul>

      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">Need help?</p>
          <button className="text-blue-600 text-sm mt-1 hover:underline">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
