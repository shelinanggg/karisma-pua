import { useEffect, useMemo, useRef, useState } from 'react';

import { Check, ChevronsUpDown, FileText, Plus, Search, Upload } from 'lucide-react';

import {
  createMyRealisasiKegiatan,
  getMyPenugasanButir,
  getMyRealisasiKegiatan,
  updateMyPenugasanButirTarget,
  type MyPenugasanButir,
  type MyRealisasiKegiatan,
} from '../../api/penugasanApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

type Option = { id: string; label: string };
type AssignmentStatus = 'Belum Ditetapkan' | 'Belum Ada Realisasi' | 'Sedang Berjalan' | 'Selesai' | 'Terlambat';
type RealisasiStatus = MyRealisasiKegiatan['status'];

const pageSizeOptions = [5, 10, 20];

function RequiredStar() {
  return <span className="ml-0.5 text-red-500">*</span>;
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

function formatTanggal(iso: string): string {
  if (!iso) return '-';
  const [year, month, day] = iso.slice(0, 10).split('-');
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${monthNames[Number(month)] ?? month} ${year}`;
}

function formatPeriode(item: MyPenugasanButir): string {
  if (!item.tanggalMulai && !item.tanggalSelesai) return `Tahun ${item.tahun}`;
  return `${formatTanggal(item.tanggalMulai)} - ${formatTanggal(item.tanggalSelesai)}`;
}

function getAssignmentTarget(item: MyPenugasanButir): number {
  return toNumber(item.targetKetercapaian);
}

function hasTarget(item: MyPenugasanButir): boolean {
  return getAssignmentTarget(item) > 0;
}

function getAssignmentStatus(item: MyPenugasanButir): AssignmentStatus {
  const target = getAssignmentTarget(item);
  const realisasi = item.realisasiTotal;

  if (target <= 0) return 'Belum Ditetapkan';
  if (realisasi >= target) return 'Selesai';

  const deadline = item.tanggalSelesai ? new Date(`${item.tanggalSelesai}T23:59:59`) : null;
  if (deadline && deadline.getTime() < Date.now()) return 'Terlambat';
  if (realisasi > 0) return 'Sedang Berjalan';
  return 'Belum Ada Realisasi';
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
  if (currentPage >= totalPages - 1) return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return Array.from(
    new Set([currentPage - 1, currentPage, currentPage + 1, totalPages].filter((page) => page >= 1 && page <= totalPages)),
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
            {idx > 0 && page - visiblePages[idx - 1] > 1 && <span className="px-1 text-xs text-gray-500">...</span>}
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
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()));

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
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="h-9 border-gray-300 bg-white text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
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
                  <Check className={cn('size-4', value === option.id ? 'opacity-100' : 'opacity-0')} />
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

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const styleMap: Record<AssignmentStatus, string> = {
    'Belum Ditetapkan': 'bg-gray-100 text-gray-700',
    'Belum Ada Realisasi': 'bg-slate-100 text-slate-700',
    'Sedang Berjalan': 'bg-blue-50 text-blue-700',
    Selesai: 'bg-green-50 text-green-700',
    Terlambat: 'bg-red-50 text-red-700',
  };

  return (
    <span className={cn('inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', styleMap[status])}>
      {status}
    </span>
  );
}

function RealisasiStatusBadge({ status }: { status: RealisasiStatus }) {
  const styleMap: Record<RealisasiStatus, string> = {
    diajukan: 'bg-amber-50 text-amber-700',
    disetujui: 'bg-green-50 text-green-700',
  };

  const labelMap: Record<RealisasiStatus, string> = {
    diajukan: 'Diajukan',
    disetujui: 'Disetujui',
  };

  return (
    <span className={cn('inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', styleMap[status])}>
      {labelMap[status]}
    </span>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>
          {formatNumber(value)} / {formatNumber(max)}
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

function ProgressTab({ assignments, isLoading }: { assignments: MyPenugasanButir[]; isLoading: boolean }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assignments;
    return assignments.filter((item) =>
      [item.namaKegiatan, item.deskripsi, item.uraian, getAssignmentStatus(item), formatPeriode(item)]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [assignments, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const targeted = assignments.filter(hasTarget);
  const totalTarget = targeted.reduce((acc, item) => acc + getAssignmentTarget(item), 0);
  const totalRealisasi = targeted.reduce((acc, item) => acc + item.realisasiTotal, 0);
  const capaianPct = totalTarget === 0 ? 0 : Math.min(100, Math.round((totalRealisasi / totalTarget) * 100));

  const summaryCards = [
    { label: 'Total Penugasan', value: assignments.length },
    { label: 'Target Ditetapkan', value: targeted.length },
    { label: 'Total Realisasi', value: formatNumber(totalRealisasi) },
    { label: 'Capaian Total', value: `${capaianPct}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center gap-2 px-6 py-6 text-center">
              <p className="mt-1 text-xs font-medium leading-tight text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold leading-none text-gray-900">{card.value}</p>
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
                Butir kegiatan periode tahun berjalan dan progres terhadap target yang Anda tetapkan.
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
              <table className="w-full min-w-[960px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="w-[30%] px-6 py-3">Nama Kegiatan</th>
                    <th className="w-[16%] px-6 py-3">Periode</th>
                    <th className="w-[34%] px-6 py-3">Progress</th>
                    <th className="w-[20%] px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                        Memuat progress pekerjaan...
                      </td>
                    </tr>
                  ) : paginated.length > 0 ? (
                    paginated.map((item) => {
                      const target = getAssignmentTarget(item);
                      return (
                        <tr key={item.id} className="align-middle transition hover:bg-gray-50">
                          <td className="px-6 py-4 pr-8">
                            <p className="text-sm font-semibold text-gray-900">{item.namaKegiatan}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                              {item.deskripsi || item.uraian || '-'}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{formatPeriode(item)}</td>
                          <td className="min-w-[320px] px-6 py-4 pr-8">
                            <ProgressBar value={item.realisasiTotal} max={target} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={getAssignmentStatus(item)} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                        Tidak ada butir kegiatan pada periode tahun ini.
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

function TargetTab({
  assignments,
  onSaved,
}: {
  assignments: MyPenugasanButir[];
  onSaved: () => Promise<void>;
}) {
  const penugasanRef = useRef<HTMLDivElement>(null);
  const targetJumlahRef = useRef<HTMLDivElement>(null);
  const uraianRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    penugasanId: '',
    target: '',
    uraian: '',
    deskripsi: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = useMemo(
    () => assignments.map((item) => ({ id: item.id, label: item.namaKegiatan })),
    [assignments],
  );

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const handleSelectAssignment = (id: string) => {
    const assignment = assignments.find((item) => item.id === id);
    setForm({
      penugasanId: id,
      target: assignment?.targetKetercapaian ?? '',
      uraian: assignment?.uraian ?? '',
      deskripsi: assignment?.deskripsi ?? '',
    });
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.penugasanId) {
      setError('Penugasan wajib dipilih.');
      focusFormField(penugasanRef);
      return;
    }
    if (!form.target || Number(form.target) <= 0) {
      setError('Jumlah target wajib diisi lebih dari 0.');
      focusFormField(targetJumlahRef);
      return;
    }
    if (!form.uraian.trim()) {
      setError('Uraian pekerjaan wajib diisi.');
      focusFormField(uraianRef);
      return;
    }

    try {
      setIsSubmitting(true);
      await updateMyPenugasanButirTarget(form.penugasanId, {
        targetKetercapaian: form.target,
        uraian: form.uraian,
        deskripsi: form.deskripsi,
      });
      await onSaved();
      setForm({ penugasanId: '', target: '', uraian: '', deskripsi: '' });
    } catch {
      setError('Gagal menyimpan target kinerja.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Tetapkan Target Kinerja</CardTitle>
          <CardDescription>
            Pilih butir kegiatan yang sudah di-assign admin, lalu tetapkan target, uraian, dan deskripsi pekerjaan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div ref={penugasanRef} className="space-y-2">
            <Label>
              Butir Kegiatan
              <RequiredStar />
            </Label>
            <SearchableSelect
              label="Butir Kegiatan"
              options={options}
              value={form.penugasanId}
              onChange={handleSelectAssignment}
            />
          </div>

          <div ref={targetJumlahRef} className="space-y-2">
            <Label htmlFor="target-jumlah">
              Jumlah Target
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
              value={form.uraian}
              onChange={(event) => updateForm('uraian', event.target.value)}
              placeholder="Tuliskan uraian pekerjaan untuk mencapai target ini."
              rows={4}
              className="resize-none border-gray-300 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi-target">Deskripsi</Label>
            <Textarea
              id="deskripsi-target"
              value={form.deskripsi}
              onChange={(event) => updateForm('deskripsi', event.target.value)}
              placeholder="Tuliskan deskripsi tambahan bila diperlukan."
              rows={3}
              className="resize-none border-gray-300 bg-white"
            />
          </div>

          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={() => setForm({ penugasanId: '', target: '', uraian: '', deskripsi: '' })}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Target'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar Target Kinerja</CardTitle>
          <CardDescription>Target, uraian, dan deskripsi yang tersimpan pada butir kegiatan tahun berjalan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="w-[30%] px-6 py-3">Butir Kegiatan</th>
                    <th className="w-[12%] px-6 py-3">Target</th>
                    <th className="w-[28%] px-6 py-3">Uraian</th>
                    <th className="w-[30%] px-6 py-3">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.length > 0 ? (
                    assignments.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="px-6 py-4 pr-8">
                          <p className="font-medium text-gray-900">{item.namaKegiatan}</p>
                          <p className="mt-1 text-xs text-gray-500">{formatPeriode(item)}</p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 pr-8 font-medium text-gray-700">
                          {hasTarget(item) ? item.targetKetercapaian : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-6 py-4 pr-8 text-gray-700">
                          {item.uraian || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {item.deskripsi || <span className="text-gray-400">-</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                        Belum ada butir kegiatan yang di-assign pada periode tahun ini.
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

function RealisasiTab({
  assignments,
  history,
  onSaved,
}: {
  assignments: MyPenugasanButir[];
  history: MyRealisasiKegiatan[];
  onSaved: () => Promise<void>;
}) {
  const penugasanRef = useRef<HTMLDivElement>(null);
  const tanggalRef = useRef<HTMLDivElement>(null);
  const jumlahRef = useRef<HTMLDivElement>(null);
  const keteranganRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    penugasanId: '',
    tanggal: '',
    jumlah: '',
    keterangan: '',
    dokumenPendukung: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const targetAssignments = useMemo(() => assignments.filter(hasTarget), [assignments]);
  const options = useMemo(
    () => targetAssignments.map((item) => ({ id: item.id, label: item.namaKegiatan })),
    [targetAssignments],
  );

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    updateForm('dokumenPendukung', file.name);
  };

  const handleSubmit = async () => {
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
      setError('Jumlah realisasi wajib diisi lebih dari 0.');
      focusFormField(jumlahRef);
      return;
    }
    if (!form.keterangan.trim()) {
      setError('Keterangan realisasi wajib diisi.');
      focusFormField(keteranganRef);
      return;
    }

    try {
      setIsSubmitting(true);
      await createMyRealisasiKegiatan({
        idPenggunaKegiatan: form.penugasanId,
        tanggalRealisasi: form.tanggal,
        realisasiTarget: form.jumlah,
        keterangan: form.keterangan,
      });
      await onSaved();
      setForm({ penugasanId: '', tanggal: '', jumlah: '', keterangan: '', dokumenPendukung: '' });
    } catch {
      setError('Gagal menyimpan realisasi kegiatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return history;
    return history.filter((item) =>
      [item.namaKegiatan, item.keterangan, item.realisasiTarget, item.tanggalRealisasi, item.status]
        .join(' ')
        .toLowerCase()
        .includes(query),
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
          <CardDescription>Catat realisasi untuk butir kegiatan yang targetnya sudah Anda tetapkan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div ref={penugasanRef} className="space-y-2">
            <Label>
              Butir Kegiatan
              <RequiredStar />
            </Label>
            <SearchableSelect
              label="Butir Kegiatan"
              options={options}
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
              <Input
                id="tanggal-realisasi"
                type="date"
                value={form.tanggal}
                onChange={(event) => updateForm('tanggal', event.target.value)}
                className="h-11 border-gray-300 bg-white"
              />
            </div>

            <div ref={jumlahRef} className="space-y-2">
              <Label htmlFor="jumlah-realisasi">
                Jumlah Realisasi
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

          <div ref={keteranganRef} className="space-y-2">
            <Label htmlFor="keterangan-realisasi">
              Keterangan Realisasi
              <RequiredStar />
            </Label>
            <Textarea
              id="keterangan-realisasi"
              value={form.keterangan}
              onChange={(event) => updateForm('keterangan', event.target.value)}
              placeholder="Jelaskan realisasi kegiatan yang sudah dilakukan."
              rows={4}
              className="resize-none border-gray-300 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Dokumen Pendukung</Label>
            <input
              id="dokumen-pendukung-realisasi"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
            <div
              className="flex min-h-44 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 px-6 py-8 text-center transition hover:bg-gray-100"
              style={{ borderColor: '#d1d5db' }}
            >
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                {form.dokumenPendukung ? <FileText className="size-5 text-gray-700" /> : <Upload className="size-5 text-gray-500" />}
              </div>
              <p className="text-sm font-semibold text-gray-900">{form.dokumenPendukung || 'Seret dokumen pendukung ke area ini'}</p>
              <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, JPG, atau PNG</p>
              <Button type="button" variant="outline" className="mt-4 h-9 px-3 text-sm" onClick={() => document.getElementById('dokumen-pendukung-realisasi')?.click()}>
                Cari File Manual
              </Button>
            </div>
          </div>

          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={() => setForm({ penugasanId: '', tanggal: '', jumlah: '', keterangan: '', dokumenPendukung: '' })}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              <Plus className="size-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Realisasi'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Riwayat Realisasi Kegiatan</CardTitle>
              <CardDescription className="mt-1">Realisasi kegiatan yang sudah Anda catat pada periode tahun berjalan.</CardDescription>
            </div>
            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 lg:w-80">
              <Search className="size-4 shrink-0 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari kegiatan, tanggal, status..."
                className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="w-[12%] px-6 py-3">Tanggal</th>
                    <th className="w-[26%] px-6 py-3">Kegiatan</th>
                    <th className="w-[12%] px-6 py-3">Realisasi</th>
                    <th className="w-[12%] px-6 py-3">Status</th>
                    <th className="w-[20%] px-6 py-3">Keterangan</th>
                    <th className="w-[18%] px-6 py-3">Dokumen Pendukung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.length > 0 ? (
                    paginated.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="whitespace-nowrap px-6 py-4 pr-6 text-gray-700">
                          {formatTanggal(item.tanggalRealisasi)}
                        </td>
                        <td className="px-6 py-4 pr-8 font-medium text-gray-900">{item.namaKegiatan}</td>
                        <td className="whitespace-nowrap px-6 py-4 pr-6 font-medium text-gray-700">
                          {item.realisasiTarget}
                        </td>
                        <td className="px-6 py-4 pr-6">
                          <RealisasiStatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 pr-8 text-gray-700">{item.keterangan || '-'}</td>
                        <td className="px-6 py-4 text-gray-500">Tidak ada dokumen</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                        Belum ada riwayat realisasi.
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
  const [assignments, setAssignments] = useState<MyPenugasanButir[]>([]);
  const [history, setHistory] = useState<MyRealisasiKegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAssignments = async () => {
    const data = await getMyPenugasanButir();
    setAssignments(data);
  };

  const loadHistory = async () => {
    const data = await getMyRealisasiKegiatan();
    setHistory(data);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [assignmentData, historyData] = await Promise.all([
        getMyPenugasanButir(),
        getMyRealisasiKegiatan(),
      ]);
      setAssignments(assignmentData);
      setHistory(historyData);
    } catch {
      setError('Gagal memuat data realisasi kinerja.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshAfterRealisasi = async () => {
    await Promise.all([loadAssignments(), loadHistory()]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Realisasi Kinerja</h1>
        <p className="mt-1 text-base text-gray-500">
          Pantau progress pekerjaan, tetapkan target kinerja, dan catat realisasi kegiatan Anda.
        </p>
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="progress">Progress Pekerjaan</TabsTrigger>
          <TabsTrigger value="target">Target Kinerja</TabsTrigger>
          <TabsTrigger value="realisasi">Realisasi Kegiatan</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <ProgressTab assignments={assignments} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="target" className="mt-6">
          <TargetTab assignments={assignments} onSaved={loadAssignments} />
        </TabsContent>

        <TabsContent value="realisasi" className="mt-6">
          <RealisasiTab assignments={assignments} history={history} onSaved={refreshAfterRealisasi} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RealisasiKinerjaView;
