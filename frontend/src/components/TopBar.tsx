import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Bell, ChevronDown, AlertCircle, AlertTriangle, Info, CheckCircle2, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useProfile } from '../hooks/useProfile';
import { logoutService } from '../services/profileService';
import { clearAccessToken, getAccessToken } from '../utils/authToken';
import { getInitials, getRoleLabel } from '../utils/profile';
import { cn } from './ui/utils';

// ── Notification data ─────────────────────────────────────────────────────────

const mockNotifications = [
  {
    id: 1,
    type: 'critical' as const,
    title: 'Deadline Terlewat',
    message: 'Kegiatan "Penyusunan Laporan Evaluasi Kinerja Q1" melewati batas waktu 3 hari yang lalu.',
    time: '2 jam lalu',
    read: false,
  },
  {
    id: 2,
    type: 'warning' as const,
    title: 'Progress Tertinggal',
    message: 'Kegiatan "Pengembangan Sistem Informasi Kepegawaian" hanya mencapai 62% dari target 80%.',
    time: '5 jam lalu',
    read: false,
  },
  {
    id: 3,
    type: 'warning' as const,
    title: 'SKP Belum Diselesaikan',
    message: '3 pegawai di Bidang Diklat belum menyelesaikan SKP bulan ini.',
    time: '1 hari lalu',
    read: false,
  },
  {
    id: 4,
    type: 'info' as const,
    title: 'Review Dijadwalkan',
    message: 'Evaluasi kinerja triwulan dijadwalkan besok pukul 10:00.',
    time: '1 hari lalu',
    read: true,
  },
  {
    id: 5,
    type: 'success' as const,
    title: 'SKP Tercapai',
    message: 'Kegiatan "Pembaruan Regulasi Administrasi Umum" berhasil menyelesaikan semua tujuan SKP.',
    time: '2 hari lalu',
    read: true,
  },
];

type NotifType = 'critical' | 'warning' | 'info' | 'success';

const notifConfig: Record<NotifType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
  dot: string;
  label: string;
}> = {
  critical: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    dot: 'bg-red-500',
    label: 'Kritis',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    dot: 'bg-amber-500',
    label: 'Peringatan',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    dot: 'bg-blue-400',
    label: 'Info',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    dot: 'bg-green-500',
    label: 'Selesai',
  },
};

// ── Main component ────────────────────────────────────────────────────────────

export function TopBar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    if (showNotif) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotif]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
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

        {/* ── Notification Bell ── */}
        <div className="relative" ref={panelRef}>
          <button
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setShowNotif((v) => !v)}
          >
            <Bell className={`w-5 h-5 ${showNotif ? 'text-blue-600' : 'text-gray-600'}`} />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </button>

          {/* ── Early Warning Panel ── */}
          {showNotif && (
            <div className="fixed left-3 right-3 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden md:left-auto md:right-0 md:w-[480px]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-700" />
                  <span className="font-semibold text-sm text-gray-800">Peringatan Dini</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotif(false)}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                {notifications.map((notif) => {
                  const cfg = notifConfig[notif.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-white' : 'bg-gray-50/50 opacity-70'
                        }`}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-800">{notif.title}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.iconColor}`}>
                            {cfg.label}
                          </span>
                          {!notif.read && (
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ml-auto flex-shrink-0`} />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                <button className="w-full text-xs text-center text-blue-600 hover:text-blue-700 font-medium">
                  Lihat semua notifikasi →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200" />

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
                } catch(e) {
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
