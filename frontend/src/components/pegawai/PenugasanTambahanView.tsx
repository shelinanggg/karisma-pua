import { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  CheckCircle2,
  Bell,
  UserCheck,
  XCircle,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// ─── types & mock data ──────────────────────────────────────────────────────

export type ReviewStatus = 'Baru' | 'Dikonfirmasi' | 'Berlangsung' | 'Selesai' | 'Tidak Hadir';

export interface DokumenTugas {
  id: string;
  nama: string;
  tipe: 'PDF' | 'DOC' | 'XLS' | 'PPT' | 'IMG';
  ukuran: string;
}

export interface PenugasanTambahan {
  id: string;
  judul: string;
  status: ReviewStatus;
  prioritas: 'Penting' | 'Biasa';
  hariNama: string;
  tanggalLabel: string;
  pukul: string;
  tempat: string;
  dariNama: string;
  dariJabatan: string;
  catatan?: string;
  dokumen: DokumenTugas[];
}

const dataPenugasanTambahan: PenugasanTambahan[] = [
  {
    id: 'TGS-001',
    judul: 'Rapat Koordinasi Evaluasi Sistem Keamanan',
    status: 'Baru',
    prioritas: 'Penting',
    hariNama: 'Senin',
    tanggalLabel: '24 Okt 2023',
    pukul: '09:00 - 11:00 WIB',
    tempat: 'Ruang Rapat Utama, Gedung A',
    dariNama: 'Budi Santoso',
    dariJabatan: 'Kepala Divisi Operasional',
    catatan: 'Harap membawa laporan insiden bulan lalu.',
    dokumen: [
      { id: 'D-1', nama: 'Agenda_Rapat_Keamanan.pdf', tipe: 'PDF', ukuran: '1.2 MB' },
    ],
  },
  {
    id: 'TGS-002',
    judul: 'Pelatihan Implementasi Prosedur Baru',
    status: 'Berlangsung',
    prioritas: 'Biasa',
    hariNama: 'Rabu',
    tanggalLabel: '26 Okt 2023',
    pukul: '13:00 - 15:00 WIB',
    tempat: 'Auditorium Lantai 3',
    dariNama: 'Siti Aminah',
    dariJabatan: 'HR Manager',
    catatan: 'Wajib hadir tepat waktu 15 menit sebelum acara dimulai.',
    dokumen: [
      { id: 'D-2', nama: 'Materi_Pelatihan_V2.ppt', tipe: 'PPT', ukuran: '4.5 MB' },
      { id: 'D-3', nama: 'Form_Kehadiran.doc', tipe: 'DOC', ukuran: '200 KB' },
    ],
  },
  {
    id: 'TGS-003',
    judul: 'Audit Lapangan dan Pengecekan Fasilitas',
    status: 'Selesai',
    prioritas: 'Penting',
    hariNama: 'Jumat',
    tanggalLabel: '20 Okt 2023',
    pukul: '08:00 - 12:00 WIB',
    tempat: 'Area Pabrik Sektor B',
    dariNama: 'Agus Wijaya',
    dariJabatan: 'Direktur Kepatuhan',
    dokumen: [
      { id: 'D-4', nama: 'Checklist_Audit_Q3.xls', tipe: 'XLS', ukuran: '850 KB' },
    ],
  },
];

// ─── helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function DocIcon({ tipe }: { tipe: DokumenTugas['tipe'] }) {
  const map: Record<DokumenTugas['tipe'], { icon: React.ReactNode; bg: string; text: string }> = {
    PDF: { icon: <FileText className="w-4 h-4" />, bg: 'bg-red-50', text: 'text-red-600' },
    DOC: { icon: <FileText className="w-4 h-4" />, bg: 'bg-blue-50', text: 'text-blue-600' },
    XLS: { icon: <FileSpreadsheet className="w-4 h-4" />, bg: 'bg-green-50', text: 'text-green-600' },
    PPT: { icon: <Presentation className="w-4 h-4" />, bg: 'bg-orange-50', text: 'text-orange-600' },
    IMG: { icon: <File className="w-4 h-4" />, bg: 'bg-purple-50', text: 'text-purple-600' },
  };
  const { icon, bg, text } = map[tipe];
  return (
    <div className={`w-9 h-9 rounded-lg ${bg} ${text} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { label: string; className: string }> = {
    Baru: { label: 'Baru', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    Dikonfirmasi: { label: 'Dikonfirmasi', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    Berlangsung: { label: 'Berlangsung', className: 'bg-violet-50 text-violet-700 border-violet-200' },
    Selesai: { label: 'Selesai', className: 'bg-green-50 text-green-700 border-green-200' },
    'Tidak Hadir': { label: 'Tidak Hadir', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

// ─── detail modal ────────────────────────────────────────────────────────────

interface DetailModalProps {
  penugasan: PenugasanTambahan | null;
  onClose: () => void;
  onKonfirmasi: (id: string) => void;
  onTolak: (id: string) => void;
}

function DetailModal({ penugasan, onClose, onKonfirmasi, onTolak }: DetailModalProps) {
  if (!penugasan) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* header */}
        <div className="pr-6 mb-5">
          <div className="flex items-start gap-2 mb-2">
            {penugasan.prioritas === 'Penting' && (
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <h2 className="text-base font-semibold text-gray-900 leading-snug">{penugasan.judul}</h2>
          </div>
          <StatusBadge status={penugasan.status} />
        </div>

        {/* info grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: <CalendarDays className="w-3.5 h-3.5" />, label: 'Hari / Tanggal', val: `${penugasan.hariNama}, ${penugasan.tanggalLabel}` },
            { icon: <Clock className="w-3.5 h-3.5" />, label: 'Pukul', val: penugasan.pukul },
            { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Tempat', val: penugasan.tempat },
            { icon: <UserCheck className="w-3.5 h-3.5" />, label: 'Dari', val: penugasan.dariNama },
          ].map(({ icon, label, val }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
                {icon}
                {label}
              </p>
              <p className="text-xs font-medium text-gray-800 leading-snug">{val}</p>
            </div>
          ))}
        </div>

        {/* catatan */}
        {penugasan.catatan && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <p className="font-medium mb-0.5">Catatan:</p>
            <p>{penugasan.catatan}</p>
          </div>
        )}

        {/* dokumen */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Dokumen Terlampir ({penugasan.dokumen.length})
          </p>
          <div className="space-y-2">
            {penugasan.dokumen.map((dok) => (
              <button
                key={dok.id}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left"
              >
                <DocIcon tipe={dok.tipe} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{dok.nama}</p>
                  <p className="text-[11px] text-gray-400">{dok.ukuran}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* actions — only for new assignments */}
        {penugasan.status === 'Baru' && (
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <Button
              className="flex-1"
              onClick={() => { onKonfirmasi(penugasan.id); onClose(); }}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Konfirmasi Hadir
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { onTolak(penugasan.id); onClose(); }}
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Tidak Bisa Hadir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── task card ───────────────────────────────────────────────────────────────

interface TaskCardProps {
  item: PenugasanTambahan;
  onClick: () => void;
  onKonfirmasi?: (id: string) => void;
  onTolak?: (id: string) => void;
}

function TaskCard({ item, onClick, onKonfirmasi, onTolak }: TaskCardProps) {
  const isNew = item.status === 'Baru';

  return (
    <Card
      className={`cursor-pointer hover:shadow-sm transition-all ${isNew ? 'border-l-4 border-l-blue-500' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {item.prioritas === 'Penting' && (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm font-medium leading-snug ${item.status === 'Selesai' || item.status === 'Tidak Hadir' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {item.judul}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
            {item.hariNama}, {item.tanggalLabel}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {item.pukul}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {item.tempat}
          </span>
        </div>

        {/* dokumen chips */}
        {item.dokumen.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.dokumen.map((dok) => (
              <span
                key={dok.id}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-600"
              >
                <FileText className="w-3 h-3" />
                {dok.nama.length > 32 ? dok.nama.slice(0, 32) + '…' : dok.nama}
              </span>
            ))}
          </div>
        )}

        {/* from row */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
            {getInitials(item.dariNama)}
          </div>
          <span className="text-xs text-gray-500">
            Dari <span className="font-medium text-gray-700">{item.dariNama}</span>
            {' · '}
            <span className="text-gray-400">{item.dariJabatan}</span>
          </span>
        </div>

        {/* inline actions for new */}
        {isNew && onKonfirmasi && onTolak && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onKonfirmasi(item.id)}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Konfirmasi Hadir
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onTolak(item.id)}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Tidak Bisa Hadir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── main view ───────────────────────────────────────────────────────────────

export function PenugasanTambahanView() {
  const [penugasanList, setPenugasanList] = useState<PenugasanTambahan[]>(dataPenugasanTambahan);
  const [selectedItem, setSelectedItem] = useState<PenugasanTambahan | null>(null);

  const jumlahBaru = penugasanList.filter((p) => p.status === 'Baru').length;
  const listBaru = penugasanList.filter((p) => p.status === 'Baru');
  const listBerlangsung = penugasanList.filter((p) => p.status === 'Berlangsung' || p.status === 'Dikonfirmasi');
  const listSelesai = penugasanList.filter((p) => p.status === 'Selesai' || p.status === 'Tidak Hadir');

  const handleKonfirmasi = (id: string) => {
    setPenugasanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Dikonfirmasi' as ReviewStatus } : p))
    );
  };

  const handleTolak = (id: string) => {
    setPenugasanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Tidak Hadir' as ReviewStatus } : p))
    );
  };

  const handleSelesai = (id: string) => {
    setPenugasanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Selesai' as ReviewStatus } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* header — no add button, assignments come from admin only */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Penugasan Tambahan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Penugasan khusus yang diberikan oleh atasan atau admin
        </p>
      </div>

      {/* notification banner */}
      {jumlahBaru > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">
              {jumlahBaru} penugasan baru menunggu konfirmasi Anda
            </p>
            <p className="text-xs text-blue-600 mt-0.5">Segera konfirmasi kehadiran Anda</p>
          </div>
          <span className="text-xs font-semibold bg-blue-500 text-white px-2.5 py-1 rounded-full">
            {jumlahBaru} baru
          </span>
        </div>
      )}

      {/* summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Penugasan Baru', value: jumlahBaru, sub: 'Menunggu konfirmasi' },
          { label: 'Sedang Berjalan', value: listBerlangsung.length, sub: 'Sudah dikonfirmasi' },
          { label: 'Selesai', value: listSelesai.length, sub: 'Bulan ini' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* tabs */}
      <Tabs defaultValue="baru" className="w-full">
        <TabsList>
          <TabsTrigger value="baru">
            Baru
            {jumlahBaru > 0 && (
              <span className="ml-1.5 text-[10px] bg-blue-500 text-white rounded-full px-1.5 py-0.5 font-semibold">
                {jumlahBaru}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="berlangsung">
            Sedang Berjalan ({listBerlangsung.length})
          </TabsTrigger>
          <TabsTrigger value="selesai">
            Selesai ({listSelesai.length})
          </TabsTrigger>
        </TabsList>

        {/* tab: baru */}
        <TabsContent value="baru" className="mt-4 space-y-3">
          {listBaru.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Semua penugasan sudah dikonfirmasi</p>
            </div>
          ) : (
            listBaru.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                onKonfirmasi={handleKonfirmasi}
                onTolak={handleTolak}
              />
            ))
          )}
        </TabsContent>

        {/* tab: berlangsung */}
        <TabsContent value="berlangsung" className="mt-4 space-y-3">
          {listBerlangsung.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Belum ada penugasan yang sedang berjalan</p>
            </div>
          ) : (
            listBerlangsung.map((item) => (
              <div key={item.id}>
                <TaskCard
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
                {/* mark complete action */}
                <div className="flex justify-end mt-1 pr-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-gray-500 hover:text-green-600"
                    onClick={() => handleSelesai(item.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Tandai Selesai
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* tab: selesai */}
        <TabsContent value="selesai" className="mt-4 space-y-3">
          {listSelesai.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Belum ada penugasan yang selesai</p>
            </div>
          ) : (
            listSelesai.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* detail modal */}
      <DetailModal
        penugasan={selectedItem}
        onClose={() => setSelectedItem(null)}
        onKonfirmasi={handleKonfirmasi}
        onTolak={handleTolak}
      />
    </div>
  );
}