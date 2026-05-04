import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calendar, Check, ChevronsUpDown, Download, FileText, Search, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

type Option = {
  id: string;
  label: string;
};

type Employee = {
  id: string;
  nip: string;
  nama: string;
  role: string;
  fungsional: string;
  pangkat: string;
  golongan: string;
};

function openDatePicker(event: { currentTarget: HTMLInputElement }) {
  const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };

  try {
    input.showPicker?.();
  } catch {
    // Browser fallback: native focus/click behavior remains available.
  }
}

function RequiredStar() {
  return <span className="admin-required-star">*</span>;
}

function focusFormField(ref: React.RefObject<HTMLDivElement | null>) {
  const element = ref.current;
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = element.querySelector('button, input, textarea') as HTMLElement | null;
  window.setTimeout(() => focusable?.focus(), 250);
}

const pageSizeOptions = [5, 10, 20];

const employees: Employee[] = Array.from({ length: 18 }, (_, index) => {
  const seeds = [
    {
      nama: 'Sarah Johnson',
      nip: '198801052010012001',
      role: 'Admin',
      fungsional: 'Pustakawan Ahli Muda',
      pangkat: 'Penata',
      golongan: 'III/c',
    },
    {
      nama: 'Michael Chen',
      nip: '198709122011011002',
      role: 'Pimpinan',
      fungsional: 'Pustakawan Ahli Madya',
      pangkat: 'Penata Tk. I',
      golongan: 'III/d',
    },
    {
      nama: 'Emily Davis',
      nip: '199001182012012003',
      role: 'Pegawai',
      fungsional: 'Analis SDM Aparatur',
      pangkat: 'Penata Muda Tk. I',
      golongan: 'III/b',
    },
    {
      nama: 'James Wilson',
      nip: '199103072013012004',
      role: 'Pegawai',
      fungsional: 'Pustakawan Ahli Pertama',
      pangkat: 'Penata Muda',
      golongan: 'III/a',
    },
    {
      nama: 'Lisa Anderson',
      nip: '199204222014012005',
      role: 'Pegawai',
      fungsional: 'Pranata Komputer Ahli Pertama',
      pangkat: 'Penata Muda Tk. I',
      golongan: 'III/b',
    },
  ];
  const seed = seeds[index % seeds.length];
  const sequence = index + 1;

  return {
    ...seed,
    id: `pegawai-${sequence}`,
    nama: index < seeds.length ? seed.nama : `${seed.nama} ${Math.floor(index / seeds.length) + 1}`,
    nip: `${seed.nip.slice(0, 14)}${sequence.toString().padStart(4, '0')}`,
  };
});

const employeeOptions: Option[] = employees.map((employee) => ({
  id: employee.id,
  label: `${employee.nama} - NIP ${employee.nip}`,
}));

const kegiatanOptions: Option[] = [
  { id: 'keg-1', label: 'Penyusunan rancangan program kerja unit' },
  { id: 'keg-2', label: 'Pelaksanaan koordinasi kegiatan akademik' },
  { id: 'keg-3', label: 'Evaluasi capaian indikator kinerja' },
  { id: 'keg-4', label: 'Pengelolaan dokumen administrasi kepegawaian' },
  { id: 'keg-5', label: 'Monitoring realisasi target kinerja pegawai' },
  { id: 'keg-6', label: 'Validasi bukti dukung kegiatan SKP' },
];

const assignmentHistory = [
  {
    id: 'history-1',
    namaKegiatan: 'Pendampingan penyusunan laporan akreditasi',
    deskripsiKegiatan: 'Mendampingi tim unit dalam melengkapi bukti dukung dan menyusun ringkasan dokumen akreditasi.',
    deadline: '20 Mei 2026',
    tanggalKegiatan: '-',
    suratTugas: 'ST-Akreditasi-Mei-2026.pdf',
  },
  {
    id: 'history-2',
    namaKegiatan: 'Rapat koordinasi pengelolaan arsip digital',
    deskripsiKegiatan: 'Koordinasi lintas unit untuk menyamakan format arsip, alur validasi, dan pembagian tanggung jawab.',
    deadline: '-',
    tanggalKegiatan: '24 Mei 2026',
    suratTugas: 'Surat-Tugas-Rakor-Arsip.pdf',
  },
  {
    id: 'history-3',
    namaKegiatan: 'Validasi dokumen kinerja triwulan',
    deskripsiKegiatan: 'Memeriksa kelengkapan dokumen kinerja dan menandai catatan perbaikan sebelum proses rekap final.',
    deadline: '31 Mei 2026',
    tanggalKegiatan: '-',
    suratTugas: 'ST-Validasi-Kinerja-TW2.docx',
  },
];

const employeeGridStyle = {
  minWidth: '1080px',
  gridTemplateColumns: 'minmax(240px, 1.35fr) minmax(120px, 0.7fr) minmax(180px, 1fr) minmax(140px, 0.75fr) minmax(100px, 0.55fr) 150px',
};

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
    <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
      <p className="text-xs text-gray-500">
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
          <span className="text-xs text-gray-500">Tampilkan</span>
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value));
              onPageChange(1);
            }}
            className="text-xs font-medium outline-none"
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
              className="rounded-lg border py-1 text-xs font-medium transition"
              style={{
                minWidth: '2rem',
                paddingLeft: '0.1rem',
                paddingRight: '0.1rem',
                ...(page === currentPage
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' }
                  : { background: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }),
              }}
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
    <div>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="h-11 w-full justify-between bg-white px-3 text-left font-normal"
        style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
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
        <div className="mt-1 rounded-md border bg-white shadow-md" style={{ borderColor: '#d1d5db', maxHeight: '14rem', overflow: 'hidden' }}>
          <div className="border-b p-2" style={{ borderColor: '#e5e7eb' }}>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="bg-white"
              style={{ height: '2.25rem', fontSize: '0.875rem', borderColor: '#d1d5db' }}
              autoFocus
            />
          </div>
          <div style={{ maxHeight: '10rem', overflowY: 'auto' }}>
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

function EmployeeAssignmentTable({ mode }: { mode: 'butir' | 'tambahan' }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) =>
      [employee.nama, employee.nip, employee.role, employee.fungsional, employee.pangkat, employee.golongan]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const description =
    mode === 'butir'
      ? 'Pilih pegawai lalu tetapkan butir kegiatan, periode, deskripsi, dan uraian penugasan.'
      : 'Daftar pegawai untuk alur penugasan tambahan. Detail formulir dapat disesuaikan pada tahap berikutnya.';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{mode === 'butir' ? 'Penugasan Butir' : 'Penugasan Tambahan'}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 lg:w-80">
            <Search className="size-4 shrink-0 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, NIP, role..."
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div
            className="grid items-center bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-700"
            style={{
              ...employeeGridStyle,
              minWidth: `calc(${employeeGridStyle.minWidth} + 2rem)`,
              paddingLeft: '2.25rem',
              paddingRight: '2.25rem',
            }}
          >
            <div>Nama / NIP</div>
            <div>Role</div>
            <div>Fungsional</div>
            <div>Pangkat</div>
            <div>Golongan</div>
            <div className="text-center">Aksi</div>
          </div>

          <div className="overflow-x-auto" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
            <div className="divide-y divide-gray-200" style={{ minWidth: employeeGridStyle.minWidth }}>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="grid items-center px-5 py-4 transition hover:bg-gray-50"
                    style={employeeGridStyle}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{employee.nama}</p>
                      <p className="truncate text-xs font-normal text-gray-500">NIP {employee.nip}</p>
                    </div>
                    <div className="text-sm text-gray-700">{employee.role}</div>
                    <div className="text-sm text-gray-700">{employee.fungsional}</div>
                    <div className="text-sm text-gray-700">{employee.pangkat}</div>
                    <div className="text-sm text-gray-700">{employee.golongan}</div>
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() =>
                          navigate(
                            mode === 'butir'
                              ? `/admin/penugasan/master-butir/terapkan-ke/${employee.id}`
                              : `/admin/penugasan/master-butir/terapkan-ke/${employee.id}`,
                          )
                        }
                      >
                        Tetapkan
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-10 text-center text-sm text-gray-500">Data pegawai tidak ditemukan.</div>
              )}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredEmployees.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PenugasanTambahanForm() {
  const pegawaiRef = useRef<HTMLDivElement>(null);
  const namaKegiatanRef = useRef<HTMLDivElement>(null);
  const tanggalMulaiRef = useRef<HTMLDivElement>(null);
  const tanggalSelesaiRef = useRef<HTMLDivElement>(null);
  const tanggalKegiatanRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    pegawaiId: '',
    namaKegiatan: '',
    deskripsiKegiatan: '',
    tanggalMode: 'deadline',
    tanggalMulai: '',
    tanggalSelesai: '',
    tanggalKegiatan: '',
    suratTugas: '',
  });
  const [error, setError] = useState('');

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    updateForm('suratTugas', file.name);
  };

  const isFormValid =
    Boolean(form.pegawaiId) &&
    Boolean(form.namaKegiatan.trim()) &&
    (form.tanggalMode === 'deadline'
      ? Boolean(form.tanggalMulai && form.tanggalSelesai)
      : Boolean(form.tanggalKegiatan));

  const handleSubmit = () => {
    if (!form.pegawaiId) {
      setError('Nama pegawai wajib dipilih.');
      focusFormField(pegawaiRef);
      return;
    }
    if (!form.namaKegiatan.trim()) {
      setError('Nama kegiatan wajib diisi.');
      focusFormField(namaKegiatanRef);
      return;
    }
    if (form.tanggalMode === 'deadline' && !form.tanggalMulai) {
      setError('Tanggal mulai wajib diisi.');
      focusFormField(tanggalMulaiRef);
      return;
    }
    if (form.tanggalMode === 'deadline' && !form.tanggalSelesai) {
      setError('Tanggal selesai wajib diisi.');
      focusFormField(tanggalSelesaiRef);
      return;
    }
    if (form.tanggalMode === 'kegiatan' && !form.tanggalKegiatan) {
      setError('Tanggal kegiatan wajib diisi.');
      focusFormField(tanggalKegiatanRef);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Penugasan Tambahan</CardTitle>
          <CardDescription>
            Tetapkan penugasan tambahan kepada pegawai beserta jadwal dan surat tugas pendukung.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div ref={pegawaiRef} className="space-y-2">
              <Label htmlFor="pegawai">Nama Pegawai<RequiredStar /></Label>
              <SearchableSelect
                label="Pegawai"
                options={employeeOptions}
                value={form.pegawaiId}
                onChange={(value) => updateForm('pegawaiId', value)}
              />
            </div>

          <div ref={namaKegiatanRef} className="space-y-2">
            <Label htmlFor="nama-kegiatan">Nama Kegiatan<RequiredStar /></Label>
            <Input
              id="nama-kegiatan"
              value={form.namaKegiatan}
              onChange={(event) => updateForm('namaKegiatan', event.target.value)}
              placeholder="Masukkan nama kegiatan penugasan tambahan"
              className="bg-white"
              style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi-kegiatan">Deskripsi Kegiatan</Label>
            <Textarea
              id="deskripsi-kegiatan"
              value={form.deskripsiKegiatan}
              onChange={(event) => updateForm('deskripsiKegiatan', event.target.value)}
              placeholder="Tuliskan deskripsi singkat kegiatan penugasan tambahan."
              rows={4}
              className="resize-none bg-white"
              style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
            />
          </div>

          <div className="space-y-2">
            <Label>Jenis Tanggal<RequiredStar /></Label>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              {[
                { id: 'deadline', label: 'Deadline' },
                { id: 'kegiatan', label: 'Tanggal Kegiatan' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateForm('tanggalMode', option.id)}
                  className="rounded-md px-4 py-2 text-sm font-medium transition"
                  style={
                    form.tanggalMode === option.id
                      ? { background: '#ffffff', color: '#111827', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)' }
                      : { color: '#6b7280' }
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {form.tanggalMode === 'deadline' ? (
            <div
              className="grid grid-cols-1 lg:grid-cols-2"
              style={{ columnGap: '1.5rem', rowGap: '1rem' }}
            >
              <div ref={tanggalMulaiRef} className="space-y-2">
                <Label htmlFor="tanggal-mulai">Tanggal Mulai<RequiredStar /></Label>
                <div className="relative">
                  <Input
                    id="tanggal-mulai"
                    type="date"
                    value={form.tanggalMulai}
                    onChange={(event) => updateForm('tanggalMulai', event.target.value)}
                    onClick={openDatePicker}
                    className="admin-date-input bg-white"
                    style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.5rem' }}
                  />
                  <Calendar className="text-gray-400" style={{ position: 'absolute', right: '0.875rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div ref={tanggalSelesaiRef} className="space-y-2">
                <Label htmlFor="tanggal-selesai">Tanggal Selesai<RequiredStar /></Label>
                <div className="relative">
                  <Input
                    id="tanggal-selesai"
                    type="date"
                    value={form.tanggalSelesai}
                    onChange={(event) => updateForm('tanggalSelesai', event.target.value)}
                    onClick={openDatePicker}
                    className="admin-date-input bg-white"
                    style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.5rem' }}
                  />
                  <Calendar className="text-gray-400" style={{ position: 'absolute', right: '0.875rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
          ) : (
            <div ref={tanggalKegiatanRef} className="space-y-2">
              <Label htmlFor="tanggal-kegiatan">Tanggal Kegiatan<RequiredStar /></Label>
              <div className="relative">
                <Input
                  id="tanggal-kegiatan"
                  type="date"
                  value={form.tanggalKegiatan}
                  onChange={(event) => updateForm('tanggalKegiatan', event.target.value)}
                  onClick={openDatePicker}
                  className="admin-date-input bg-white"
                  style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.5rem' }}
                />
                <Calendar className="text-gray-400" style={{ position: 'absolute', right: '0.875rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Surat Tugas</Label>
            <input
              id="surat-tugas"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0] ?? null);
              }}
              className="flex min-h-44 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 px-6 py-8 text-center transition hover:bg-gray-100"
              style={{ borderColor: '#d1d5db' }}
            >
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                {form.suratTugas ? <FileText className="size-5 text-gray-700" /> : <Upload className="size-5 text-gray-500" />}
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {form.suratTugas || 'Seret surat tugas ke area ini'}
              </p>
              <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, JPG, atau PNG</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-9 px-3 text-sm"
                onClick={() => document.getElementById('surat-tugas')?.click()}
              >
                Cari File Manual
              </Button>
            </div>
          </div>
        </div>

          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button variant="outline">Batal</Button>
            <Button className="admin-proceed-button" disabled={!isFormValid} onClick={handleSubmit}>
              Simpan Penugasan Tambahan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>History Penugasan Tambahan</CardTitle>
          <CardDescription>Daftar penugasan tambahan yang pernah dicatat untuk pegawai.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
          <div className="overflow-hidden rounded-md border">
            <div
              className="grid bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700"
              style={{ gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(130px, 0.8fr) minmax(130px, 0.8fr) minmax(180px, 1fr)' }}
            >
              <div>Nama Kegiatan</div>
              <div>Deadline</div>
              <div>Tanggal Kegiatan</div>
              <div>Surat Tugas</div>
            </div>
            <div className="divide-y divide-gray-200">
              {assignmentHistory.length > 0 ? (
                assignmentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="grid items-start px-6 py-4 text-sm"
                    style={{ gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(130px, 0.8fr) minmax(130px, 0.8fr) minmax(180px, 1fr)' }}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{item.namaKegiatan}</p>
                      <p className="mt-1 text-xs font-normal leading-relaxed text-gray-500">{item.deskripsiKegiatan}</p>
                    </div>
                    <div className="text-gray-700">{item.deadline}</div>
                    <div className="text-gray-700">{item.tanggalKegiatan}</div>
                    <div className="min-w-0">
                      <p className="truncate text-gray-700">{item.suratTugas}</p>
                      <Button variant="outline" className="admin-download-button mt-2 p-0" aria-label={`Download ${item.suratTugas}`}>
                        <Download className="admin-download-icon" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-sm text-gray-500">
                  Belum ada history penugasan tambahan.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PenugasanView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Penugasan</h1>
        <p className="mt-1 text-base text-gray-500">Tetapkan butir kegiatan dan penugasan tambahan kepada pegawai.</p>
      </div>

      <Tabs defaultValue="butir" className="w-full">
        <TabsList className="grid w-full grid-cols-2" style={{ maxWidth: '28rem' }}>
          <TabsTrigger value="butir">Penugasan Butir</TabsTrigger>
          <TabsTrigger value="tambahan">Penugasan Tambahan</TabsTrigger>
        </TabsList>

        <TabsContent value="butir" className="mt-6">
          <EmployeeAssignmentTable mode="butir" />
        </TabsContent>

        <TabsContent value="tambahan" className="mt-6">
          <PenugasanTambahanForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function PenugasanButirFormView() {
  const navigate = useNavigate();
  const { pegawaiId } = useParams();
  const selectedEmployee = employees.find((employee) => employee.id === pegawaiId) ?? employees[0];
  const kegiatanRef = useRef<HTMLDivElement>(null);
  const periodeMulaiRef = useRef<HTMLDivElement>(null);
  const periodeSelesaiRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    kegiatanId: '',
    periodeMulai: '',
    periodeSelesai: '',
    deskripsi: '',
    uraian: '',
  });
  const [error, setError] = useState('');

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const isFormValid = Boolean(form.kegiatanId && form.periodeMulai && form.periodeSelesai);

  const handleSubmit = () => {
    if (!form.kegiatanId) {
      setError('Kegiatan wajib dipilih.');
      focusFormField(kegiatanRef);
      return;
    }
    if (!form.periodeMulai) {
      setError('Periode mulai wajib diisi.');
      focusFormField(periodeMulaiRef);
      return;
    }
    if (!form.periodeSelesai) {
      setError('Periode selesai wajib diisi.');
      focusFormField(periodeSelesaiRef);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button variant="outline" className="mb-4 h-9 px-3 text-sm" onClick={() => navigate('/admin/penugasan')}>
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Terapkan Butir Kegiatan</h1>
          <p className="mt-1 text-base text-gray-500">
            Tetapkan kegiatan, periode, deskripsi, dan uraian untuk pegawai terpilih.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Form Penugasan Butir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{selectedEmployee.nama}</p>
            <p className="text-xs text-gray-500">NIP {selectedEmployee.nip}</p>
            <p className="mt-1 text-xs text-gray-500">
              {selectedEmployee.fungsional} - {selectedEmployee.pangkat} / {selectedEmployee.golongan}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1" style={{ gap: '1rem', gridTemplateColumns: 'minmax(0, 3fr) minmax(10rem, 1fr) minmax(10rem, 1fr)' }}>
              <div ref={kegiatanRef} className="space-y-2">
                <Label htmlFor="kegiatan">Kegiatan<RequiredStar /></Label>
                <SearchableSelect
                  label="Kegiatan"
                  options={kegiatanOptions}
                  value={form.kegiatanId}
                  onChange={(value) => updateForm('kegiatanId', value)}
                />
              </div>

              <div ref={periodeMulaiRef} className="space-y-2">
                <Label htmlFor="periode-mulai">Periode Mulai<RequiredStar /></Label>
                <div className="relative">
                  <Input
                    id="periode-mulai"
                    type="date"
                    value={form.periodeMulai}
                    onChange={(event) => updateForm('periodeMulai', event.target.value)}
                    onClick={openDatePicker}
                    className="admin-date-input bg-white"
                    style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.5rem' }}
                  />
                  <Calendar className="text-gray-400" style={{ position: 'absolute', right: '0.875rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div ref={periodeSelesaiRef} className="space-y-2">
                <Label htmlFor="periode-selesai">Periode Selesai<RequiredStar /></Label>
                <div className="relative">
                  <Input
                    id="periode-selesai"
                    type="date"
                    value={form.periodeSelesai}
                    onChange={(event) => updateForm('periodeSelesai', event.target.value)}
                    onClick={openDatePicker}
                    className="admin-date-input bg-white"
                    style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.5rem' }}
                  />
                  <Calendar className="text-gray-400" style={{ position: 'absolute', right: '0.875rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(event) => updateForm('deskripsi', event.target.value)}
                placeholder="Tuliskan deskripsi singkat sekitar 40 kata mengenai konteks, tujuan, dan hasil yang diharapkan dari penugasan butir kegiatan ini."
                rows={5}
                className="resize-none bg-white"
                style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uraian">Uraian</Label>
              <Textarea
                id="uraian"
                value={form.uraian}
                onChange={(event) => updateForm('uraian', event.target.value)}
                placeholder="Tuliskan uraian pekerjaan sekitar 40 kata, termasuk ruang lingkup aktivitas, tanggung jawab pegawai, indikator penyelesaian, serta catatan pelaksanaan yang perlu diperhatikan."
                rows={5}
                className="resize-none bg-white"
                style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
              />
            </div>
          </div>

          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button variant="outline" onClick={() => navigate('/admin/penugasan')}>
              Batal
            </Button>
            <Button className="admin-proceed-button" disabled={!isFormValid} onClick={handleSubmit}>
              Simpan Penugasan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
