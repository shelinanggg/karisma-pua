import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ChevronDown, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProfile } from '../hooks/useProfile';
import { logoutService } from '../services/profileService';
import { clearAccessToken, getAccessToken } from '../utils/authToken';
import { getInitials, getRoleLabel } from '../utils/profile';
import { cn } from './ui/utils';

export function TopBar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

  const getTokenRole = () => {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const decoded: { role?: string } = jwtDecode(token);
      return decoded.role || null;
    } catch {
      return null;
    }
  };

  const role = profile?.role || getTokenRole();
  const displayName = profile?.nama || (loading ? 'Memuat...' : 'Pengguna');
  const displayRole = getRoleLabel(role);

  const getProfilePath = () => {
    if (role === 'pegawai') return '/pegawai/account';
    if (role === 'pimpinan') return '/pimpinan/profil';
    return '/admin/profil';
  };

  const getSettingsPath = () => {
    if (role === 'pegawai') return '/pegawai/settings';
    if (role === 'pimpinan') return '/pimpinan/pengaturan';
    return '/admin/pengaturan';
  };

  return (
    <div className={cn(
      "h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6",
      onOpenSidebar ? "justify-between" : "justify-end",
    )}>
      {onOpenSidebar && (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-50"
          aria-label="Buka menu navigasi"
        >
          <Menu className="size-5" />
        </button>
      )}
      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <div className="hidden text-right sm:block">
                <p className="text-sm">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(profile?.nama)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(getProfilePath())}>Profil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(getSettingsPath())}>Pengaturan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                try {
                  await logoutService();
                } catch (e) {
                  // Token lokal tetap dibersihkan meski cookie session gagal dihapus server.
                }
                clearAccessToken();
                navigate('/login');
              }}
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
