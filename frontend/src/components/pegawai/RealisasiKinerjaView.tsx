import { useMemo, useRef, useState } from 'react';


import { Calendar, Check, ChevronsUpDown, Download, FileText, Plus, Search, Target, TrendingUp, Upload } from 'lucide-react';


import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

type Option = { id: string; label: string };

type Penugasan = {
  id: string;
  namaKegiatan: string;
  deskripsi: string;
  jenis: 'Butir Kegiatan' | 'Penugasan Tambahan';
  periode: string;
  deadline: string;
  target: number;
  realisasi: number;
  status: 'Belum Dimulai' | 'Sedang Berjalan' | 'Selesai' | 'Terlambat';
};

type RealisasiHistory = {
  id: string;
  tanggal: string;
  namaKegiatan: string;
  deskripsi: string;
  jumlah: number;
  bukti: string;
  status: 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak';
};

const pageSizeOptions = [5, 10, 20];

const penugasanList: Penugasan[] = [
  {
    id: 'pen-1',
    namaKegiatan: 'Penyusunan rancangan program kerja unit',
    deskripsi:
      'Menyiapkan dokumen rancangan program kerja tahunan unit kerja beserta indikator capaiannya.',
    jenis: 'Butir Kegiatan',
    periode: '01 Jan 2026 - 30 Jun 2026',
    deadline: '30 Jun 2026',
    target: 4,
    realisasi: 2,
    status: 'Sedang Berjalan',
  },
  {
    id: 'pen-2',
    namaKegiatan: 'Validasi bukti dukung kegiatan SKP',
    deskripsi: 'Melakukan validasi atas bukti dukung kegiatan SKP pegawai pada unit kerja.',
    jenis: 'Butir Kegiatan',
    periode: '01 Jan 2026 - 31 Des 2026',
    deadline: '31 Des 2026',
    target: 12,
    realisasi: 5,
    status: 'Sedang Berjalan',
  },
  {
    id: 'pen-3',
    namaKegiatan: 'Pendampingan penyusunan laporan akreditasi',
    deskripsi:
      'Mendampingi tim unit dalam melengkapi bukti dukung dan menyusun ringkasan dokumen akreditasi.',
    jenis: 'Penugasan Tambahan',
    periode: '01 Mei 2026 - 20 Mei 2026',
    deadline: '20 Mei 2026',
    target: 1,
    realisasi: 0,
    status: 'Belum Dimulai',
  },
  {
    id: 'pen-4',
    namaKegiatan: 'Monitoring realisasi target kinerja pegawai',
    deskripsi: 'Memantau realisasi target kinerja bulanan dan menyusun rekap untuk laporan pimpinan.',
    jenis: 'Butir Kegiatan',
    periode: '01 Jan 2026 - 31 Des 2026',
    deadline: '31 Des 2026',
    target: 12,
    realisasi: 4,
    status: 'Sedang Berjalan',
  },
  {
    id: 'pen-5',
    namaKegiatan: 'Rapat koordinasi pengelolaan arsip digital',
    deskripsi: 'Koordinasi lintas unit untuk menyamakan format arsip dan alur validasi dokumen.',
    jenis: 'Penugasan Tambahan',
    periode: '24 Mei 2026',
    deadline: '24 Mei 2026',
    target: 1,
    realisasi: 1,
    status: 'Selesai',
  },
];

const initialHistory: RealisasiHistory[] = [
  {
    id: 'hist-1',
    tanggal: '02 Mei 2026',
    namaKegiatan: 'Penyusunan rancangan program kerja unit',
    deskripsi: 'Menyusun draft awal program kerja triwulan kedua dan diskusi internal tim.',
    jumlah: 1,
    bukti: 'Draft-Program-Kerja-TW2.pdf',
    status: 'Disetujui',
  },
  {
    id: 'hist-2',
    tanggal: '10 Mei 2026',
    namaKegiatan: 'Validasi bukti dukung kegiatan SKP',
    deskripsi: 'Memvalidasi bukti dukung 5 pegawai untuk periode April 2026.',
    jumlah: 5,
    bukti: 'Rekap-Validasi-SKP-April.xlsx',
    status: 'Menunggu Verifikasi',
  },
  {
    id: 'hist-3',
    tanggal: '18 Mei 2026',
    namaKegiatan: 'Monitoring realisasi target kinerja pegawai',
    deskripsi: 'Membuat laporan monitoring kinerja pegawai bulan April 2026.',
    jumlah: 1,
    bukti: 'Laporan-Monitoring-April-2026.pdf',
    status: 'Disetujui',
  },
];

const targetPenugasanOptions: Option[] = penugasanList.map((p) => ({
  id: p.id,
  label: p.namaKegiatan,
}));

function RequiredStar() {
  return <span className="ml-0.5 text-red-500">*</span>;
}

function openDatePicker(event: { currentTarget: HTMLInputElement }) {
  const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
  try {
    input.showPicker?.();
  } catch {
    /* noop */
  }
}

function focusFormField(ref: React.RefObject<HTMLDivElement | null>) {
  const element = ref.current;
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = element.querySelector('button, input, textarea') as HTMLElement | null;
  window.setTimeout(() => focusable?.focus(), 250);
}

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage === 1) return [1, 2, 3, totalPages];
  if (currentPage >= totalPages - 1)
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return Array.from(
    new Set(
      [currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (page) => page >= 1 && page <= totalPages,
      ),
    ),
  ).sort((a, b) => a - b);
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const visiblePages = getAdaptivePages(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col items-start gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
          <span className="text-xs text-gray-500">Tampilkan</span>
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value));
              onPageChange(1);
            }}
            className="bg-transparent text-xs font-medium outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition disabled:opacity-40"
        >
          Sebelumnya
        </button>
        {visiblePages.map((page, idx) => (
          <span key={page} className="flex items-center gap-2">
            {idx > 0 && page - visiblePages[idx - 1] > 1 && (
              <span className="px-1 text-xs text-gray-500">...</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-8 rounded-lg border px-2 py-1 text-xs font-medium transition',
                page === currentPage
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {page}
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

function SearchableSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.id === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="h-11 w-full justify-between border-gray-300 bg-white px-3 text-left font-normal"
        onClick={() => {
          setOpen((current) => !current);
          setQuery('');
        }}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected?.label ?? `Pilih ${label}`}
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="h-9 border-gray-300 bg-white text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <Check
                    className={cn('size-4', value === option.id ? 'opacity-100' : 'opacity-0')}
                  />
                  <span>{option.label}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-center text-sm text-gray-500">Data tidak ditemukan.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Penugasan['status'] | RealisasiHistory['status'] }) {
  const styleMap: Record<string, { bg: string; color: string }> = {
    'Belum Dimulai': { bg: '#f3f4f6', color: '#374151' },
    'Sedang Berjalan': { bg: '#dbeafe', color: '#1d4ed8' },
    Selesai: { bg: '#dcfce7', color: '#166534' },
    Terlambat: { bg: '#fee2e2', color: '#b91c1c' },
    'Menunggu Verifikasi': { bg: '#fef3c7', color: '#92400e' },
    Disetujui: { bg: '#dcfce7', color: '#166534' },
    Ditolak: { bg: '#fee2e2', color: '#b91c1c' },
  };
  const s = styleMap[status] ?? { bg: '#f3f4f6', color: '#374151' };
  return (
    <span
      className="inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>
          {value} / {max} SKP
        </span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: pct >= 100 ? '#16a34a' : '#2563eb' }}
        />
      </div>
    </div>
  );
}

function ProgressTab() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return penugasanList;
    return penugasanList.filter((p) =>
      [p.namaKegiatan, p.deskripsi, p.status].join(' ').toLowerCase().includes(q),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalTarget = penugasanList.reduce((acc, p) => acc + p.target, 0);
  const totalRealisasi = penugasanList.reduce((acc, p) => acc + p.realisasi, 0);
  const capaianPct = totalTarget === 0 ? 0 : Math.round((totalRealisasi / totalTarget) * 100);
  const selesai = penugasanList.filter((p) => p.status === 'Selesai').length;
  const berjalan = penugasanList.filter((p) => p.status === 'Sedang Berjalan').length;

  const summaryCards = [
    { label: 'Total Penugasan', value: penugasanList.length, icon: Target, color: '#2563eb' },
    { label: 'Sedang Berjalan', value: berjalan, icon: TrendingUp, color: '#1d4ed8' },
    { label: 'Selesai', value: selesai, icon: Check, color: '#16a34a' },
    { label: 'Capaian Total', value: `${capaianPct}%`, icon: FileText, color: '#9333ea' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${card.color}1a`, color: card.color }}
              >
                <card.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">{card.label}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Progress Pekerjaan</CardTitle>
              <CardDescription className="mt-1">
                Pantau kemajuan setiap penugasan butir maupun penugasan tambahan yang menjadi
                tanggung jawab Anda.
              </CardDescription>
            </div>
            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 lg:w-80">
              <Search className="size-4 shrink-0 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari kegiatan, status..."
                className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="px-6 py-3 w-[36%]">Nama Kegiatan</th>
                    <th className="px-6 py-3 w-[20%]">Periode / Deadline</th>
                    <th className="px-6 py-3 w-[28%]">Progress</th>
                    <th className="px-6 py-3 w-[16%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.length > 0 ? (
                    paginated.map((p) => (
                      <tr key={p.id} className="align-middle transition hover:bg-gray-50">
                        <td className="px-6 py-4 pr-8">
                          <p className="text-sm font-semibold text-gray-900">{p.namaKegiatan}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs font-normal text-gray-500">
                            {p.deskripsi}
                          </p>
                        </td>
                        <td className="px-6 py-4 pr-8 text-sm text-gray-700 whitespace-nowrap">
                          <p>{p.periode}</p>
                          <p className="text-xs text-gray-500">Deadline: {p.deadline}</p>
                        </td>
                        <td className="px-6 py-4 pr-8 min-w-[220px]">
                          <ProgressBar value={p.realisasi} max={p.target} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                        Tidak ada penugasan ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type TargetItem = {
  id: string;
  penugasanId: string;
  target: number;
  uraianPekerjaan: string;
  keterangan: string;
};

function TargetTab() {
  const penugasanRef = useRef<HTMLDivElement>(null);
  const targetJumlahRef = useRef<HTMLDivElement>(null);
  const uraianRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    penugasanId: '',
    target: '',
    uraianPekerjaan: '',
    keterangan: '',
  });
  const [error, setError] = useState('');
  const [targets, setTargets] = useState<TargetItem[]>([
    {
      id: 'tgt-1',
      penugasanId: 'pen-1',
      target: 4,
      uraianPekerjaan:
        'Menyusun dokumen rancangan program kerja tahunan unit beserta indikator capaian dan rencana anggaran.',
      keterangan: 'Target capaian semester pertama.',
    },
    {
      id: 'tgt-2',
      penugasanId: 'pen-2',
      target: 12,
      uraianPekerjaan:
        'Validasi berkas SKP pegawai tiap bulan, mencakup kelengkapan dokumen dan kesesuaian dengan indikator kinerja.',
      keterangan: 'Target validasi bulanan sepanjang tahun.',
    },
  ]);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const isFormValid =
    Boolean(form.penugasanId) &&
    Boolean(form.target) &&
    Number(form.target) > 0 &&
    Boolean(form.uraianPekerjaan.trim());

  const handleSubmit = () => {
    if (!form.penugasanId) {
      setError('Penugasan wajib dipilih.');
      focusFormField(penugasanRef);
      return;
    }
    if (!form.target || Number(form.target) <= 0) {
      setError('Jumlah target wajib diisi (> 0).');
      focusFormField(targetJumlahRef);
      return;
    }
    if (!form.uraianPekerjaan.trim()) {
      setError('Uraian pekerjaan wajib diisi.');
      focusFormField(uraianRef);
      return;
    }

    const newItem: TargetItem = {
      id: `tgt-${Date.now()}`,
      penugasanId: form.penugasanId,
      target: Number(form.target),
      uraianPekerjaan: form.uraianPekerjaan.trim(),
      keterangan: form.keterangan.trim(),
    };
    setTargets((prev) => [newItem, ...prev]);
    setForm({ penugasanId: '', target: '', uraianPekerjaan: '', keterangan: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Tetapkan Target Kinerja</CardTitle>
          <CardDescription>
            Tentukan target capaian SKP untuk setiap penugasan yang Anda terima.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div ref={penugasanRef} className="space-y-2">
            <Label>
              Penugasan
              <RequiredStar />
            </Label>
            <SearchableSelect
              label="Penugasan"
              options={targetPenugasanOptions}
              value={form.penugasanId}
              onChange={(value) => updateForm('penugasanId', value)}
            />
          </div>

          <div ref={targetJumlahRef} className="space-y-2">
            <Label htmlFor="target-jumlah">
              Jumlah Target SKP
              <RequiredStar />
            </Label>
            <Input
              id="target-jumlah"
              type="number"
              min={1}
              value={form.target}
              onChange={(event) => updateForm('target', event.target.value)}
              placeholder="Contoh: 12"
              className="h-11 border-gray-300 bg-white"
            />
          </div>

          <div ref={uraianRef} className="space-y-2">
            <Label htmlFor="uraian-pekerjaan">
              Uraian Pekerjaan
              <RequiredStar />
            </Label>
            <Textarea
              id="uraian-pekerjaan"
              value={form.uraianPekerjaan}
              onChange={(event) => updateForm('uraianPekerjaan', event.target.value)}
              placeholder="Tuliskan uraian pekerjaan yang akan dilakukan untuk mencapai target SKP ini."
              rows={4}
              className="resize-none border-gray-300 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan-target">Keterangan</Label>
            <Textarea
              id="keterangan-target"
              value={form.keterangan}
              onChange={(event) => updateForm('keterangan', event.target.value)}
              placeholder="Tuliskan keterangan tambahan terkait target kinerja yang akan dicapai."
              rows={3}
              className="resize-none border-gray-300 bg-white"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={() =>
                setForm({ penugasanId: '', target: '', uraianPekerjaan: '', keterangan: '' })
              }
            >
              Reset
            </Button>
            <Button disabled={!isFormValid} onClick={handleSubmit}>
              Simpan Target
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar Target Kinerja</CardTitle>
          <CardDescription>
            Target kinerja SKP yang sudah Anda tetapkan untuk setiap penugasan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="px-6 py-3 w-[34%]">Penugasan</th>
                    <th className="px-6 py-3 w-[14%]">Target SKP</th>
                    <th className="px-6 py-3 w-[30%]">Uraian Pekerjaan</th>
                    <th className="px-6 py-3 w-[22%]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {targets.length > 0 ? (
                    targets.map((t) => {
                      const pen = penugasanList.find((p) => p.id === t.penugasanId);
                      return (
                        <tr key={t.id} className="align-top">
                          <td className="px-6 py-4 pr-8">
                            <p className="font-medium text-gray-900">{pen?.namaKegiatan ?? '-'}</p>
                            <p className="mt-1 text-xs text-gray-500">{pen?.jenis}</p>
                          </td>
                          <td className="px-6 py-4 pr-8 font-medium text-gray-700 whitespace-nowrap">
                            {t.target} SKP
                          </td>
                          <td className="px-6 py-4 pr-8 text-gray-700">
                            {t.uraianPekerjaan || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {t.keterangan || <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                        Belum ada target ditetapkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RealisasiTab() {
  const penugasanRef = useRef<HTMLDivElement>(null);
  const tanggalRef = useRef<HTMLDivElement>(null);
  const jumlahRef = useRef<HTMLDivElement>(null);
  const deskripsiRef = useRef<HTMLDivElement>(null);
  const buktiRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    penugasanId: '',
    tanggal: '',
    jumlah: '',
    deskripsi: '',
    bukti: '',
  });
  const [error, setError] = useState('');
  const [history, setHistory] = useState<RealisasiHistory[]>(initialHistory);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    updateForm('bukti', file.name);
  };

  const isFormValid =
    Boolean(form.penugasanId) &&
    Boolean(form.tanggal) &&
    Boolean(form.jumlah) &&
    Number(form.jumlah) > 0 &&
    Boolean(form.deskripsi.trim()) &&
    Boolean(form.bukti);

  const handleSubmit = () => {
    if (!form.penugasanId) {
      setError('Penugasan wajib dipilih.');
      focusFormField(penugasanRef);
      return;
    }
    if (!form.tanggal) {
      setError('Tanggal realisasi wajib diisi.');
      focusFormField(tanggalRef);
      return;
    }
    if (!form.jumlah || Number(form.jumlah) <= 0) {
      setError('Jumlah realisasi wajib diisi (> 0).');
      focusFormField(jumlahRef);
      return;
    }
    if (!form.deskripsi.trim()) {
      setError('Deskripsi realisasi wajib diisi.');
      focusFormField(deskripsiRef);
      return;
    }
    if (!form.bukti) {
      setError('Dokumen bukti wajib diunggah.');
      focusFormField(buktiRef);
      return;
    }

    const pen = penugasanList.find((p) => p.id === form.penugasanId);
    const newItem: RealisasiHistory = {
      id: `hist-${Date.now()}`,
      tanggal: form.tanggal,
      namaKegiatan: pen?.namaKegiatan ?? '-',
      deskripsi: form.deskripsi.trim(),
      jumlah: Number(form.jumlah),
      bukti: form.bukti,
      status: 'Menunggu Verifikasi',
    };
    setHistory((prev) => [newItem, ...prev]);
    setForm({ penugasanId: '', tanggal: '', jumlah: '', deskripsi: '', bukti: '' });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter((h) =>
      [h.namaKegiatan, h.deskripsi, h.bukti, h.status, h.tanggal]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [history, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Update Realisasi Kegiatan</CardTitle>
          <CardDescription>
            Catatkan realisasi kegiatan yang sudah Anda capai beserta dokumen bukti pendukung.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div ref={penugasanRef} className="space-y-2">
            <Label>
              Penugasan
              <RequiredStar />
            </Label>
            <SearchableSelect
              label="Penugasan"
              options={targetPenugasanOptions}
              value={form.penugasanId}
              onChange={(value) => updateForm('penugasanId', value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div ref={tanggalRef} className="space-y-2">
              <Label htmlFor="tanggal-realisasi">
                Tanggal Realisasi
                <RequiredStar />
              </Label>
              <div className="relative">
                <Input
                  id="tanggal-realisasi"
                  type="date"
                  value={form.tanggal}
                  onChange={(event) => updateForm('tanggal', event.target.value)}
                  onClick={openDatePicker}
                  className="h-11 border-gray-300 bg-white pr-10"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div ref={jumlahRef} className="space-y-2">
              <Label htmlFor="jumlah-realisasi">
                Jumlah Realisasi SKP
                <RequiredStar />
              </Label>
              <Input
                id="jumlah-realisasi"
                type="number"
                min={1}
                value={form.jumlah}
                onChange={(event) => updateForm('jumlah', event.target.value)}
                placeholder="Contoh: 1"
                className="h-11 border-gray-300 bg-white"
              />
            </div>
          </div>

          <div ref={deskripsiRef} className="space-y-2">
            <Label htmlFor="deskripsi-realisasi">
              Deskripsi Realisasi
              <RequiredStar />
            </Label>
            <Textarea
              id="deskripsi-realisasi"
              value={form.deskripsi}
              onChange={(event) => updateForm('deskripsi', event.target.value)}
              placeholder="Jelaskan secara singkat realisasi kegiatan yang sudah dilakukan, hasil yang dicapai, dan catatan penting lainnya."
              rows={4}
              className="resize-none border-gray-300 bg-white"
            />
          </div>

          <div ref={buktiRef} className="space-y-2">
            <Label>
              Dokumen Bukti
              <RequiredStar />
            </Label>
            <input
              id="bukti-realisasi"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0] ?? null);
              }}
              className="flex min-h-44 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:bg-gray-100"
            >
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                {form.bukti ? (
                  <FileText className="size-5 text-gray-700" />
                ) : (
                  <Upload className="size-5 text-gray-500" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {form.bukti || 'Seret dokumen bukti ke area ini'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, DOC, DOCX, XLS, XLSX, JPG, atau PNG
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-9 px-3 text-sm"
                onClick={() => document.getElementById('bukti-realisasi')?.click()}
              >
                Cari File Manual
              </Button>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={() =>
                setForm({ penugasanId: '', tanggal: '', jumlah: '', deskripsi: '', bukti: '' })
              }
            >
              Reset
            </Button>
            <Button disabled={!isFormValid} onClick={handleSubmit}>
              <Plus className="size-4" />
              Simpan Realisasi
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>History Realisasi Kegiatan</CardTitle>
              <CardDescription className="mt-1">
                Riwayat realisasi yang Anda input beserta status verifikasi pimpinan.
              </CardDescription>
            </div>
            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 lg:w-80">
              <Search className="size-4 shrink-0 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari kegiatan, status, tanggal..."
                className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="px-6 py-3 w-[12%]">Tanggal</th>
                    <th className="px-6 py-3 w-[34%]">Kegiatan</th>
                    <th className="px-6 py-3 w-[12%]">Jumlah SKP</th>
                    <th className="px-6 py-3 w-[24%]">Bukti</th>
                    <th className="px-6 py-3 w-[18%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.length > 0 ? (
                    paginated.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="px-6 py-4 pr-6 text-gray-700 whitespace-nowrap">
                          {item.tanggal}
                        </td>
                        <td className="px-6 py-4 pr-8">
                          <p className="font-medium text-gray-900">{item.namaKegiatan}</p>
                          <p className="mt-1 text-xs font-normal leading-relaxed text-gray-500">
                            {item.deskripsi}
                          </p>
                        </td>
                        <td className="px-6 py-4 pr-6 font-medium text-gray-700 whitespace-nowrap">
                          {item.jumlah} SKP
                        </td>
                        <td className="px-6 py-4 pr-6">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-gray-700" title={item.bukti}>
                              {item.bukti}
                            </p>
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 shrink-0"
                              aria-label={`Download ${item.bukti}`}
                            >
                              <Download className="size-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                        Belum ada history realisasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RealisasiKinerjaView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Realisasi Kinerja</h1>
        <p className="mt-1 text-base text-gray-500">
          Pantau progress pekerjaan, tetapkan target kinerja, dan catat realisasi kegiatan Anda
          beserta dokumen bukti.
        </p>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="progress">Progress Pekerjaan</TabsTrigger>
          <TabsTrigger value="target">Target Kinerja</TabsTrigger>
          <TabsTrigger value="realisasi">Realisasi Kegiatan</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <ProgressTab />
        </TabsContent>

        <TabsContent value="target" className="mt-6">
          <TargetTab />
        </TabsContent>

        <TabsContent value="realisasi" className="mt-6">
          <RealisasiTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RealisasiKinerjaView;
