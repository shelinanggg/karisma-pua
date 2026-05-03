import { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  Bell,
  AlertCircle,
} from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type ReviewStatus =
  | 'Baru'
  | 'Dikonfirmasi'
  | 'Berlangsung'
  | 'Selesai'
  | 'Tidak Hadir';

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

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

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
      {
        id: 'D-1',
        nama: 'Agenda_Rapat_Keamanan.pdf',
        tipe: 'PDF',
        ukuran: '1.2 MB',
      },
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
    catatan: 'Wajib hadir 15 menit sebelum acara dimulai.',
    dokumen: [
      {
        id: 'D-2',
        nama: 'Materi_Pelatihan_V2.ppt',
        tipe: 'PPT',
        ukuran: '4.5 MB',
      },
      {
        id: 'D-3',
        nama: 'Form_Kehadiran.doc',
        tipe: 'DOC',
        ukuran: '200 KB',
      },
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
      {
        id: 'D-4',
        nama: 'Checklist_Audit_Q3.xls',
        tipe: 'XLS',
        ukuran: '850 KB',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase();
}

function SoftBadge({
  children,
  tone = 'gray',
}: {
  children: React.ReactNode;
  tone?: 'gray' | 'green' | 'amber' | 'red';
}) {
  const map = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const style: Record<ReviewStatus, { tone: any; label: string }> = {
    Baru: { tone: 'amber', label: 'Baru' },
    Dikonfirmasi: { tone: 'gray', label: 'Dikonfirmasi' },
    Berlangsung: { tone: 'gray', label: 'Berlangsung' },
    Selesai: { tone: 'green', label: 'Selesai' },
    'Tidak Hadir': { tone: 'red', label: 'Tidak Hadir' },
  };

  return <SoftBadge tone={style[status].tone}>{style[status].label}</SoftBadge>;
}

function SmallIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-7 w-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 shrink-0">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TASK CARD (Modal Logic Removed)
// ─────────────────────────────────────────────────────────────

interface TaskCardProps {
  item: PenugasanTambahan;
  onKonfirmasi?: (id: string) => void;
  onTolak?: (id: string) => void;
}

function TaskCard({
  item,
  onKonfirmasi,
  onTolak,
}: TaskCardProps) {
  const isNew = item.status === 'Baru';

  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {/* {item.prioritas === 'Penting' && (
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            )} */}

            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {item.judul}
            </p>
          </div>

          <StatusBadge status={item.status} />
        </div>

        <div className="grid gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <SmallIcon>
              <CalendarDays className="h-3.5 w-3.5" />
            </SmallIcon>
            {item.hariNama}, {item.tanggalLabel}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <SmallIcon>
              <Clock className="h-3.5 w-3.5" />
            </SmallIcon>
            {item.pukul}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <SmallIcon>
              <MapPin className="h-3.5 w-3.5" />
            </SmallIcon>
            {item.tempat}
          </div>
        </div>

        {/* Dokumen yang bisa di-klik untuk preview */}
        {item.dokumen.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {item.dokumen.map((dok) => (
              <button
                key={dok.id}
                onClick={() => alert(`Menampilkan preview untuk dokumen: ${dok.nama}`)} // Placeholder aksi
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                title="Klik untuk membuka dokumen"
              >
                <FileText className="h-3 w-3 text-gray-500 shrink-0" />
                <span className="text-[11px] text-gray-700 font-medium">
                  {dok.nama.length > 28
                    ? dok.nama.slice(0, 28) + '...'
                    : dok.nama}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-900 text-white text-[10px] font-semibold flex items-center justify-center">
            {getInitials(item.dariNama)}
          </div>

          <div className="text-xs text-gray-600">
            <span className="font-medium text-gray-800">{item.dariNama}</span>
            <span className="mx-1">•</span>
            {item.dariJabatan}
          </div>
        </div>

        {isNew && onKonfirmasi && onTolak && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
              onClick={() => onKonfirmasi(item.id)}
            >
              Konfirmasi
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => onTolak(item.id)}
            >
              Tolak
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN VIEW
// ─────────────────────────────────────────────────────────────

export function PenugasanTambahanView() {
  const [penugasanList, setPenugasanList] =
    useState<PenugasanTambahan[]>(dataPenugasanTambahan);

  const jumlahBaru = penugasanList.filter(
    (item) => item.status === 'Baru'
  ).length;

  const listBaru = penugasanList.filter(
    (item) => item.status === 'Baru'
  );

  const listBerlangsung = penugasanList.filter((item) =>
    ['Dikonfirmasi', 'Berlangsung'].includes(item.status)
  );

  const listSelesai = penugasanList.filter((item) =>
    ['Selesai', 'Tidak Hadir'].includes(item.status)
  );

  const handleKonfirmasi = (id: string) => {
    setPenugasanList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Dikonfirmasi' }
          : item
      )
    );
  };

  const handleTolak = (id: string) => {
    setPenugasanList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Tidak Hadir' }
          : item
      )
    );
  };

  const handleSelesai = (id: string) => {
    setPenugasanList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'Selesai' }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Penugasan Tambahan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Penugasan khusus dari admin atau atasan
        </p>
      </div>

      {/* KPI MENGGUNAKAN KOMPONEN CARD AGAR LENGKUNGAN KONSISTEN */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Penugasan Baru',
            value: jumlahBaru,
            sub: 'Menunggu konfirmasi',
          },
          {
            label: 'Sedang Berjalan',
            value: listBerlangsung.length,
            sub: 'Aktif saat ini',
          },
          {
            label: 'Selesai',
            value: listSelesai.length,
            sub: 'Total selesai',
          },
        ].map((item) => (
          <Card key={item.label} className="rounded-xl border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {item.value}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notification Banner MENGGUNAKAN CARD */}
      {jumlahBaru > 0 && (
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
              <Bell className="h-4 w-4" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {jumlahBaru} penugasan baru menunggu konfirmasi
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Segera lakukan tindakan
              </p>
            </div>

            <SoftBadge tone="amber">{jumlahBaru} Baru</SoftBadge>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="baru">
        <TabsList className="grid grid-cols-3 w-full rounded-xl bg-gray-100 p-1">
          <TabsTrigger value="baru" className="rounded-lg">Baru</TabsTrigger>
          <TabsTrigger value="berlangsung" className="rounded-lg">Berjalan</TabsTrigger>
          <TabsTrigger value="selesai" className="rounded-lg">Selesai</TabsTrigger>
        </TabsList>

        <TabsContent value="baru" className="mt-4 space-y-3">
          {listBaru.length === 0 ? (
            <EmptyState text="Tidak ada penugasan baru" />
          ) : (
            listBaru.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onKonfirmasi={handleKonfirmasi}
                onTolak={handleTolak}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="berlangsung" className="mt-4 space-y-3">
          {listBerlangsung.length === 0 ? (
            <EmptyState text="Belum ada penugasan berjalan" />
          ) : (
            listBerlangsung.map((item) => (
              <div key={item.id}>
                <TaskCard item={item} />

                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => handleSelesai(item.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Tandai Selesai
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="selesai" className="mt-4 space-y-3">
          {listSelesai.length === 0 ? (
            <EmptyState text="Belum ada data selesai" />
          ) : (
            listSelesai.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
      <CheckCircle2 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}