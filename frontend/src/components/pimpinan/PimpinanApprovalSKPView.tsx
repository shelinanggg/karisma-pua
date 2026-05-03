import { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type Status = 'pending' | 'in-progress' | 'completed';

interface Kegiatan {
  id: number;
  butir: string;
  uraian: string;
  status: Status;
  progress: number;
  bukti?: string;
}

interface Pegawai {
  id: number;
  nama: string;
  nip: string;
  bidang: string;
  uploadedDate: string;
  kegiatan: Kegiatan[];
}

const MOCK: Pegawai[] = [
  {
    id: 1,
    nama: 'Dr. Siti Rahayu',
    nip: '19850515 1212345',
    bidang: 'Bidang Referensi',
    uploadedDate: '2025-05-01',
    kegiatan: [
      { id: 11, butir: 'I.B.1', uraian: 'Memberikan layanan referensi kepada pemustaka', status: 'completed', progress: 100, bukti: 'referensi.pdf' },
      { id: 12, butir: 'I.B.3', uraian: 'Bimbingan pemustaka untuk penggunaan layanan', status: 'pending', progress: 85, bukti: 'bimbingan.pdf' },
      { id: 13, butir: 'I.C.1', uraian: 'Narasumber seminar literasi informasi', status: 'pending', progress: 70 },
      { id: 14, butir: 'I.C.4', uraian: 'Penyusunan laporan kegiatan bulanan', status: 'in-progress', progress: 55 },
    ],
  },
  {
    id: 2,
    nama: 'Andi Kurniawan',
    nip: '19860720 1212346',
    bidang: 'Bidang Diklat',
    uploadedDate: '2025-05-02',
    kegiatan: [
      { id: 21, butir: 'II.A.1', uraian: 'Pengembangan modul pelatihan', status: 'in-progress', progress: 60 },
      { id: 22, butir: 'II.B.1', uraian: 'Penyelenggaraan pelatihan', status: 'pending', progress: 95, bukti: 'laporan.pdf' },
      { id: 23, butir: 'II.B.2', uraian: 'Evaluasi hasil pelatihan', status: 'pending', progress: 80 },
    ],
  },
];

function StatusBadge({ status }: { status: Status }) {
  const config = {
    pending: { label: 'Menunggu', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100', icon: Clock },
    'in-progress': { label: 'Sedang Dikerjakan', className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100', icon: Loader2 },
    completed: { label: 'Selesai', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100', icon: CheckCircle2 },
  }[status];

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const tone = value >= 100 ? 'bg-emerald-500' : value >= 70 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="space-y-1">
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <div className="text-xs text-slate-500">{value}%</div>
    </div>
  );
}

export function PimpinanApprovalSKPView() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selectedByPegawai, setSelectedByPegawai] = useState<Record<number, Set<number>>>({});

  const list = MOCK.filter((pegawai) => {
    const q = query.toLowerCase();
    return (
      pegawai.nama.toLowerCase().includes(q) ||
      pegawai.nip.includes(query) ||
      pegawai.bidang.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (pegawaiId: number, kegiatanId: number) => {
    setSelectedByPegawai((current) => {
      const next = { ...current };
      const existing = new Set(next[pegawaiId] ?? []);
      if (existing.has(kegiatanId)) existing.delete(kegiatanId);
      else existing.add(kegiatanId);
      next[pegawaiId] = existing;
      return next;
    });
  };

  const selectAllPending = (pegawai: Pegawai) => {
    const pendingIds = pegawai.kegiatan
      .filter((k) => k.status === 'pending')
      .map((k) => k.id);
    setSelectedByPegawai((current) => ({
      ...current,
      [pegawai.id]: new Set(pendingIds),
    }));
  };

  const clearSelected = (pegawaiId: number) => {
    setSelectedByPegawai((current) => ({ ...current, [pegawaiId]: new Set() }));
  };

  const approveSelected = (pegawai: Pegawai) => {
    const selectedCount = selectedByPegawai[pegawai.id]?.size ?? 0;
    window.alert(`Menyetujui ${selectedCount} kegiatan untuk ${pegawai.nama}`);
    clearSelected(pegawai.id);
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
          <ShieldCheck className="h-3 w-3" />
          Approval Center
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Persetujuan SKP</h1>
        <p className="mt-0.5 max-w-3xl text-sm text-slate-500">
          Tinjau SKP yang telah diunggah pegawai, cek rincian butir kegiatan, lalu setujui kegiatan
          yang sudah selesai dari panel yang rapi dan cepat.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="h-9 rounded-lg border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:ring-blue-200"
          placeholder="Cari nama, NIP, atau bidang..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Employee cards */}
      <div className="space-y-2">
        {list.map((pegawai) => {
          const selectedSet = selectedByPegawai[pegawai.id] ?? new Set<number>();
          const pendingCount = pegawai.kegiatan.filter((k) => k.status === 'pending').length;
          const isExpanded = expanded === pegawai.id;

          return (
            <Card key={pegawai.id} className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
              {/* Card header — minimal three-column: Nama | SKP Menunggu | Aksi (approve outside detail) */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 py-3">
                {/* Left: nama (judul) */}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900">{pegawai.nama}</div>
                </div>

                {/* Middle: pending count only */}
                <div className="flex items-center justify-center px-2">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-amber-100">
                    {pendingCount} SKP menunggu
                  </span>
                </div>

                {/* Right: actions (Batch select + Approve selected + Detail) - outside detail */}
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      selectAllPending(pegawai);
                      setExpanded(pegawai.id);
                    }}
                    disabled={pendingCount === 0}
                  >
                    Pilih semua pending
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg border-emerald-200 bg-emerald-50 px-3 text-xs text-emerald-700 hover:bg-emerald-100"
                    onClick={() => approveSelected(pegawai)}
                    disabled={(selectedSet.size ?? 0) === 0}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Approve Terpilih
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => setExpanded(isExpanded ? null : pegawai.id)}
                  >
                    {isExpanded ? 'Tutup' : 'Detail'}
                    {isExpanded ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Detail panel */}
              {isExpanded && (
                <div>
                  {/* Toolbar atas detail: keep select/clear controls, but no approve here */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-600">Butir Kegiatan</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">Centang untuk approval sekaligus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-md border-slate-200 bg-white px-2.5 text-xs text-slate-600"
                        onClick={() => selectAllPending(pegawai)}
                      >
                        Pilih semua pending
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 rounded-md px-2.5 text-xs text-slate-500"
                        onClick={() => clearSelected(pegawai.id)}
                      >
                        Bersihkan
                      </Button>
                    </div>
                  </div>

                  {/* Tabel kegiatan (HTML table untuk tata letak rapi) */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr className="text-xs font-medium text-slate-400 uppercase">
                          <th className="w-12 p-3" />
                          <th className="p-3 text-left">Butir</th>
                          <th className="p-3 text-left">Uraian</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="w-40 p-3 text-left">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-50">
                        {pegawai.kegiatan.map((kegiatan) => {
                          const isPending = kegiatan.status === 'pending';
                          return (
                            <tr key={kegiatan.id} className="hover:bg-slate-50">
                              <td className="p-3 align-top">
                                {isPending ? (
                                  <input
                                    type="checkbox"
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    checked={selectedSet.has(kegiatan.id)}
                                    onChange={() => toggleSelect(pegawai.id, kegiatan.id)}
                                  />
                                ) : (
                                  <div className="h-3.5 w-3.5 rounded border border-slate-200 bg-slate-100" />
                                )}
                              </td>

                              <td className="p-3 align-top">
                                <div className="text-sm font-semibold text-slate-800">{kegiatan.butir}</div>
                                {kegiatan.bukti && (
                                  <div className="text-xs text-slate-400">Bukti: {kegiatan.bukti}</div>
                                )}
                              </td>

                              <td className="p-3 text-sm text-slate-600 align-top">{kegiatan.uraian}</td>

                              <td className="p-3 align-top">
                                <StatusBadge status={kegiatan.status} />
                              </td>

                              <td className="p-3 align-top">
                                <div className="w-full">
                                  <ProgressBar value={kegiatan.progress} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer aksi: only close */}
                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-2.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg border-slate-200 bg-white px-3 text-xs text-slate-600"
                      onClick={() => setExpanded(null)}
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <div className="text-sm font-medium text-slate-600">Tidak ada pegawai yang cocok</div>
            <div className="mt-0.5 text-xs text-slate-400">Coba ubah kata kunci pencarian Anda.</div>
          </div>
        )}
      </div>
    </div>
  );
}