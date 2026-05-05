import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calendar, Check, ChevronsUpDown, Download, Eye, FileText, Pencil, Search, Upload, X, XCircle } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

type Option = { id: string; label: string };
type Employee = {
  id: string;
  nip: string;
  nama: string;
  role: string;
  fungsional: string;
  pangkat: string;
  golongan: string;
};

const maxAssignmentEmployees = 20;

const employees: Employee[] = Array.from({ length: 25 }, (_, index) => {
  const seeds = [
    ['Sarah Johnson', '198801052010012001', 'Admin', 'Pustakawan Ahli Muda', 'Penata', 'III/c'],
    ['Michael Chen', '198709122011011002', 'Pimpinan', 'Pustakawan Ahli Madya', 'Penata Tk. I', 'III/d'],
    ['Emily Davis', '199001182012012003', 'Pegawai', 'Analis SDM Aparatur', 'Penata Muda Tk. I', 'III/b'],
    ['James Wilson', '199103072013012004', 'Pegawai', 'Pustakawan Ahli Pertama', 'Penata Muda', 'III/a'],
    ['Lisa Anderson', '199204222014012005', 'Pegawai', 'Pranata Komputer Ahli Pertama', 'Penata Muda Tk. I', 'III/b'],
  ];
  const seed = seeds[index % seeds.length];
  const sequence = index + 1;

  return {
    id: `pegawai-${sequence}`,
    nama: index < seeds.length ? seed[0] : `${seed[0]} ${Math.floor(index / seeds.length) + 1}`,
    nip: `${seed[1].slice(0, 14)}${sequence.toString().padStart(4, '0')}`,
    role: seed[2],
    fungsional: seed[3],
    pangkat: seed[4],
    golongan: seed[5],
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

const periodeOptions: Option[] = [
  { id: 'periode-2026', label: 'SKP 2026 - 1 Januari 2026 s/d 30 Desember 2026' },
  { id: 'periode-2025', label: 'SKP 2025 - 1 Januari 2025 s/d 30 Desember 2025' },
  { id: 'periode-2024', label: 'SKP 2024 - 1 Januari 2024 s/d 30 Desember 2024' },
];

const assignmentHistory = [
  {
    id: 'pendampingan-akreditasi-mei-2026',
    namaKegiatan: 'Pendampingan penyusunan laporan akreditasi',
    deskripsiKegiatan: 'Mendampingi tim unit dalam melengkapi bukti dukung dan menyusun ringkasan dokumen akreditasi.',
    deadline: '20 Mei 2026',
    tanggalKegiatan: '-',
    suratTugas: 'ST-Akreditasi-Mei-2026.pdf',
    status: 'Aktif',
    assignedEmployees: ['pegawai-1', 'pegawai-4'],
  },
  {
    id: 'rakor-arsip-digital-mei-2026',
    namaKegiatan: 'Rapat koordinasi pengelolaan arsip digital',
    deskripsiKegiatan: 'Koordinasi lintas unit untuk menyamakan format arsip, alur validasi, dan pembagian tanggung jawab.',
    deadline: '-',
    tanggalKegiatan: '24 Mei 2026',
    suratTugas: 'Surat-Tugas-Rakor-Arsip.pdf',
    status: 'Aktif',
    assignedEmployees: ['pegawai-2'],
  },
  {
    id: 'validasi-kinerja-triwulan-mei-2026',
    namaKegiatan: 'Validasi dokumen kinerja triwulan',
    deskripsiKegiatan: 'Memeriksa kelengkapan dokumen kinerja dan menandai catatan perbaikan sebelum proses rekap final.',
    deadline: '31 Mei 2026',
    tanggalKegiatan: '-',
    suratTugas: 'ST-Validasi-Kinerja-TW2.docx',
    status: 'Selesai',
    assignedEmployees: ['pegawai-3', 'pegawai-5'],
  },
];

function RequiredStar() {
  return <span className="admin-required-star">*</span>;
}

function openDatePicker(event: { currentTarget: HTMLInputElement }) {
  const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
  try {
    input.showPicker?.();
  } catch {
    // Native focus/click remains available.
  }
}

function focusFormField(ref: React.RefObject<HTMLDivElement | null>) {
  const element = ref.current;
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = element.querySelector('button, input, textarea') as HTMLElement | null;
  window.setTimeout(() => focusable?.focus(), 250);
}

function getEmployeeName(employeeId: string) {
  return employees.find((employee) => employee.id === employeeId)?.nama ?? employeeId;
}

function SearchableSelect({ label, options, value, onChange }: {
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
        {selected ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Kosongkan ${label}`}
            className="ml-2 flex size-6 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            onClick={(event) => {
              event.stopPropagation();
              onChange('');
              setOpen(false);
              setQuery('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                onChange('');
                setOpen(false);
                setQuery('');
              }
            }}
          >
            <X className="size-4" />
          </span>
        ) : (
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        )}
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

function updateEmployeeSlots(current: string[], index: number, employeeId: string) {
  const next = [...current];
  next[index] = employeeId;
  const compacted = next.filter(Boolean).slice(0, maxAssignmentEmployees);

  if (compacted.length < maxAssignmentEmployees) {
    return [...compacted, ''];
  }

  return compacted;
}

function AssignmentEmployeeFields({ value, onChange, firstFieldRef }: {
  value: string[];
  onChange: (index: number, employeeId: string) => void;
  firstFieldRef: React.RefObject<HTMLDivElement | null>;
}) {
  const selectedIds = value.filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {value.map((employeeId, index) => {
        const availableOptions = employeeOptions.filter((option) => option.id === employeeId || !selectedIds.includes(option.id));
        return (
          <div key={index} ref={index === 0 ? firstFieldRef : undefined} className="space-y-2">
            <Label htmlFor={`pegawai-${index + 1}`}>
              {index === 0 ? 'Nama Pegawai' : `Nama Pegawai ${index + 1}`}
              {index === 0 && <RequiredStar />}
            </Label>
            <SearchableSelect
              label={index === 0 ? 'Pegawai' : `Pegawai ${index + 1}`}
              options={availableOptions}
              value={employeeId}
              onChange={(nextEmployeeId) => onChange(index, nextEmployeeId)}
            />
          </div>
        );
      })}
    </div>
  );
}

function DateInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClick={openDatePicker}
        className="admin-date-input bg-white"
        style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.5rem' }}
      />
      <Calendar className="text-gray-400" style={{ position: 'absolute', right: '0.875rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}

function EmployeeAssignmentTable() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((employee) => [employee.nama, employee.nip, employee.role, employee.fungsional].join(' ').toLowerCase().includes(query));
  }, [search]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Penugasan Butir</CardTitle>
            <CardDescription className="mt-1">Pilih pegawai lalu tetapkan butir kegiatan dan periode SKP.</CardDescription>
          </div>
          <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 lg:w-80">
            <Search className="size-4 shrink-0 text-gray-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, NIP, role..." className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700" style={{ gridTemplateColumns: 'minmax(240px, 1.4fr) minmax(120px, 0.7fr) minmax(180px, 1fr) minmax(140px, 0.75fr) minmax(100px, 0.55fr) 150px' }}>
            <div className="pl-2">Nama / NIP</div>
            <div>Role</div>
            <div>Fungsional</div>
            <div>Pangkat</div>
            <div>Golongan</div>
            <div className="text-center">Aksi</div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredEmployees.slice(0, 8).map((employee) => (
              <div key={employee.id} className="grid items-center px-6 py-4 text-sm" style={{ gridTemplateColumns: 'minmax(240px, 1.4fr) minmax(120px, 0.7fr) minmax(180px, 1fr) minmax(140px, 0.75fr) minmax(100px, 0.55fr) 150px' }}>
                <div className="min-w-0 pl-2">
                  <p className="truncate font-semibold text-gray-900">{employee.nama}</p>
                  <p className="truncate text-xs text-gray-500">NIP {employee.nip}</p>
                </div>
                <div>{employee.role}</div>
                <div>{employee.fungsional}</div>
                <div>{employee.pangkat}</div>
                <div>{employee.golongan}</div>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => navigate(`/admin/penugasan/master-butir/terapkan-ke/${employee.id}`)}>
                    Tetapkan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PenugasanTambahanForm() {
  const navigate = useNavigate();
  const pegawaiRef = useRef<HTMLDivElement>(null);
  const namaKegiatanRef = useRef<HTMLDivElement>(null);
  const [detailItem, setDetailItem] = useState<(typeof assignmentHistory)[number] | null>(null);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>(['']);
  const [form, setForm] = useState({
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

  const updateAssignedEmployee = (index: number, employeeId: string) => {
    setAssignedEmployeeIds((current) => updateEmployeeSlots(current, index, employeeId));
    setError('');
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    updateForm('suratTugas', file.name);
  };

  const isFormValid =
    Boolean(assignedEmployeeIds[0]) &&
    Boolean(form.namaKegiatan.trim()) &&
    (form.tanggalMode === 'deadline' ? Boolean(form.tanggalMulai && form.tanggalSelesai) : Boolean(form.tanggalKegiatan));

  const handleSubmit = () => {
    if (!assignedEmployeeIds[0]) {
      setError('Nama pegawai wajib dipilih.');
      focusFormField(pegawaiRef);
      return;
    }
    if (!form.namaKegiatan.trim()) {
      setError('Nama kegiatan wajib diisi.');
      focusFormField(namaKegiatanRef);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Penugasan Tambahan</CardTitle>
          <CardDescription>Tetapkan penugasan tambahan kepada pegawai beserta jadwal dan surat tugas pendukung.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssignmentEmployeeFields value={assignedEmployeeIds} onChange={updateAssignedEmployee} firstFieldRef={pegawaiRef} />

          <div ref={namaKegiatanRef} className="space-y-2">
            <Label htmlFor="nama-kegiatan">Nama Kegiatan<RequiredStar /></Label>
            <Input id="nama-kegiatan" value={form.namaKegiatan} onChange={(event) => updateForm('namaKegiatan', event.target.value)} placeholder="Masukkan nama kegiatan penugasan tambahan" className="bg-white" style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi-kegiatan">Deskripsi Kegiatan</Label>
            <Textarea id="deskripsi-kegiatan" value={form.deskripsiKegiatan} onChange={(event) => updateForm('deskripsiKegiatan', event.target.value)} placeholder="Tuliskan deskripsi singkat kegiatan penugasan tambahan." rows={4} className="resize-none bg-white" style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>

          <div className="space-y-2">
            <Label>Jenis Tanggal<RequiredStar /></Label>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              {[
                { id: 'deadline', label: 'Deadline' },
                { id: 'kegiatan', label: 'Tanggal Kegiatan' },
              ].map((option) => (
                <button key={option.id} type="button" onClick={() => updateForm('tanggalMode', option.id)} className="rounded-md px-4 py-2 text-sm font-medium transition" style={form.tanggalMode === option.id ? { background: '#ffffff', color: '#111827', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)' } : { color: '#6b7280' }}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {form.tanggalMode === 'deadline' ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tanggal-mulai">Tanggal Mulai<RequiredStar /></Label>
                <DateInput id="tanggal-mulai" value={form.tanggalMulai} onChange={(value) => updateForm('tanggalMulai', value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal-selesai">Tanggal Selesai<RequiredStar /></Label>
                <DateInput id="tanggal-selesai" value={form.tanggalSelesai} onChange={(value) => updateForm('tanggalSelesai', value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="tanggal-kegiatan">Tanggal Kegiatan<RequiredStar /></Label>
              <DateInput id="tanggal-kegiatan" value={form.tanggalKegiatan} onChange={(value) => updateForm('tanggalKegiatan', value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Surat Tugas</Label>
            <input id="surat-tugas" type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
            <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 px-6 py-8 text-center transition hover:bg-gray-100" style={{ borderColor: '#d1d5db' }}>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                {form.suratTugas ? <FileText className="size-5 text-gray-700" /> : <Upload className="size-5 text-gray-500" />}
              </div>
              <p className="text-sm font-semibold text-gray-900">{form.suratTugas || 'Seret surat tugas ke area ini'}</p>
              <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, JPG, atau PNG</p>
              <Button type="button" variant="outline" className="mt-4 h-9 px-3 text-sm" onClick={() => document.getElementById('surat-tugas')?.click()}>
                Cari File Manual
              </Button>
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
            <div className="grid bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700" style={{ gridTemplateColumns: 'minmax(220px, 1.35fr) minmax(120px, 0.7fr) minmax(130px, 0.75fr) minmax(100px, 0.6fr) minmax(150px, 0.9fr) minmax(170px, 0.8fr)' }}>
              <div>Nama Kegiatan</div>
              <div className="text-center">Deadline</div>
              <div className="text-center">Tanggal Kegiatan</div>
              <div className="text-center">Jumlah Pegawai</div>
              <div>Surat Tugas</div>
              <div className="text-center">Aksi</div>
            </div>
            <div className="divide-y divide-gray-200">
              {assignmentHistory.map((item) => (
                <div key={item.id} className="grid items-start px-6 py-4 text-sm" style={{ gridTemplateColumns: 'minmax(220px, 1.35fr) minmax(120px, 0.7fr) minmax(130px, 0.75fr) minmax(100px, 0.6fr) minmax(150px, 0.9fr) minmax(170px, 0.8fr)' }}>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{item.namaKegiatan}</p>
                    <p className="mt-1 text-xs font-normal leading-relaxed text-gray-500">{item.deskripsiKegiatan}</p>
                  </div>
                  <div className="text-center text-gray-700">{item.deadline}</div>
                  <div className="text-center text-gray-700">{item.tanggalKegiatan}</div>
                  <div className="text-center text-gray-700">{item.assignedEmployees.length} pegawai</div>
                  <div className="min-w-0">
                    <p className="truncate text-gray-700">{item.suratTugas}</p>
                    <Button variant="outline" className="admin-download-button mt-2 p-0" aria-label={`Download ${item.suratTugas}`}>
                      <Download className="admin-download-icon" />
                    </Button>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setDetailItem(item)}>
                      <Eye className="size-3.5" />
                      Detail
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => navigate(`/admin/penugasan/edit-penugasan-tambahan/${item.id}`)}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(detailItem)} onOpenChange={(open: boolean) => !open && setDetailItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Penugasan Tambahan</DialogTitle>
            <DialogDescription>Ringkasan data penugasan dan pegawai yang ditugaskan.</DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{detailItem.namaKegiatan}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{detailItem.deskripsiKegiatan}</p>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Deadline</p>
                  <p className="mt-1 text-gray-900">{detailItem.deadline}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Tanggal Kegiatan</p>
                  <p className="mt-1 text-gray-900">{detailItem.tanggalKegiatan}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                  <p className="mt-1 text-gray-900">{detailItem.status}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Surat Tugas</p>
                  <p className="mt-1 text-gray-900">{detailItem.suratTugas}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Pegawai Ditugaskan</p>
                <div className="mt-2 space-y-2">
                  {detailItem.assignedEmployees.map((employeeId, index) => (
                    <div key={employeeId} className="rounded-md border bg-white px-3 py-2 text-sm text-gray-900">
                      {index + 1}. {getEmployeeName(employeeId)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailItem(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PenugasanView() {
  const location = useLocation();
  const defaultTab = (location.state as { tab?: string } | null)?.tab === 'tambahan' ? 'tambahan' : 'butir';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Penugasan</h1>
        <p className="mt-1 text-base text-gray-500">Tetapkan butir kegiatan dan penugasan tambahan kepada pegawai.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2" style={{ maxWidth: '28rem' }}>
          <TabsTrigger value="butir">Penugasan Butir</TabsTrigger>
          <TabsTrigger value="tambahan">Penugasan Tambahan</TabsTrigger>
        </TabsList>
        <TabsContent value="butir" className="mt-6">
          <EmployeeAssignmentTable />
        </TabsContent>
        <TabsContent value="tambahan" className="mt-6">
          <PenugasanTambahanForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function EditPenugasanTambahanView() {
  const navigate = useNavigate();
  const { penugasanId } = useParams();
  const selectedAssignment = assignmentHistory.find((item) => item.id === penugasanId) ?? assignmentHistory[0];
  const pegawaiRef = useRef<HTMLDivElement>(null);
  const namaKegiatanRef = useRef<HTMLDivElement>(null);
  const initialAssignedEmployeeIds = selectedAssignment.assignedEmployees.length < maxAssignmentEmployees ? [...selectedAssignment.assignedEmployees, ''] : selectedAssignment.assignedEmployees;
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>(initialAssignedEmployeeIds);
  const [form, setForm] = useState({
    namaKegiatan: selectedAssignment.namaKegiatan,
    deskripsiKegiatan: selectedAssignment.deskripsiKegiatan,
    tanggalMode: selectedAssignment.deadline === '-' ? 'kegiatan' : 'deadline',
    tanggalMulai: selectedAssignment.deadline === '-' ? '' : '2026-05-01',
    tanggalSelesai: selectedAssignment.deadline === '-' ? '' : '2026-05-20',
    tanggalKegiatan: selectedAssignment.tanggalKegiatan === '-' ? '' : '2026-05-24',
    suratTugas: selectedAssignment.suratTugas,
  });
  const [error, setError] = useState('');

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const updateAssignedEmployee = (index: number, employeeId: string) => {
    setAssignedEmployeeIds((current) => updateEmployeeSlots(current, index, employeeId));
    setError('');
  };

  const isFormValid = Boolean(assignedEmployeeIds[0]) && Boolean(form.namaKegiatan.trim());

  const handleSubmit = () => {
    if (!assignedEmployeeIds[0]) {
      setError('Nama pegawai wajib dipilih.');
      focusFormField(pegawaiRef);
      return;
    }
    if (!form.namaKegiatan.trim()) {
      setError('Nama kegiatan wajib diisi.');
      focusFormField(namaKegiatanRef);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button variant="outline" className="mb-4 h-9 px-3 text-sm" onClick={() => navigate('/admin/penugasan', { state: { tab: 'tambahan' } })}>
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Penugasan Tambahan</h1>
          <p className="mt-1 text-base text-gray-500">Ubah pegawai, jadwal, dan dokumen pendukung penugasan tambahan.</p>
        </div>
        <Button variant="destructive" className="h-10 self-start lg:self-auto">
          <XCircle className="size-4" />
          Batalkan Penugasan
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Form Edit Penugasan Tambahan</CardTitle>
          <CardDescription>Perubahan pada mockup ini belum tersambung ke API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssignmentEmployeeFields value={assignedEmployeeIds} onChange={updateAssignedEmployee} firstFieldRef={pegawaiRef} />
          <div ref={namaKegiatanRef} className="space-y-2">
            <Label htmlFor="edit-nama-kegiatan">Nama Kegiatan<RequiredStar /></Label>
            <Input id="edit-nama-kegiatan" value={form.namaKegiatan} onChange={(event) => updateForm('namaKegiatan', event.target.value)} className="bg-white" style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-deskripsi-kegiatan">Deskripsi Kegiatan</Label>
            <Textarea id="edit-deskripsi-kegiatan" value={form.deskripsiKegiatan} onChange={(event) => updateForm('deskripsiKegiatan', event.target.value)} rows={4} className="resize-none bg-white" style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-tanggal-mulai">Tanggal Mulai</Label>
              <DateInput id="edit-tanggal-mulai" value={form.tanggalMulai} onChange={(value) => updateForm('tanggalMulai', value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tanggal-selesai">Tanggal Selesai</Label>
              <DateInput id="edit-tanggal-selesai" value={form.tanggalSelesai} onChange={(value) => updateForm('tanggalSelesai', value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Surat Tugas</Label>
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-gray-50 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{form.suratTugas || 'Belum ada file'}</p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, atau PNG</p>
              </div>
              <Button type="button" variant="outline" className="h-9 px-3 text-sm">
                Ganti File
              </Button>
            </div>
          </div>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button variant="outline" onClick={() => navigate('/admin/penugasan', { state: { tab: 'tambahan' } })}>
              Batal
            </Button>
            <Button className="admin-proceed-button" disabled={!isFormValid} onClick={handleSubmit}>
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PenugasanButirFormView() {
  const navigate = useNavigate();
  const { pegawaiId } = useParams();
  const selectedEmployee = employees.find((employee) => employee.id === pegawaiId) ?? employees[0];
  const kegiatanRef = useRef<HTMLDivElement>(null);
  const periodeRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ kegiatanId: '', periodeId: '', deskripsi: '', uraian: '' });
  const [error, setError] = useState('');

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const handleSubmit = () => {
    if (!form.kegiatanId) {
      setError('Kegiatan wajib dipilih.');
      focusFormField(kegiatanRef);
      return;
    }
    if (!form.periodeId) {
      setError('Periode wajib dipilih.');
      focusFormField(periodeRef);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" className="mb-4 h-9 px-3 text-sm" onClick={() => navigate('/admin/penugasan')}>
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Terapkan Butir Kegiatan</h1>
        <p className="mt-1 text-base text-gray-500">Tetapkan kegiatan, periode, deskripsi, dan uraian untuk pegawai terpilih.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Form Penugasan Butir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{selectedEmployee.nama}</p>
            <p className="text-xs text-gray-500">NIP {selectedEmployee.nip}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div ref={kegiatanRef} className="space-y-2">
              <Label htmlFor="kegiatan">Kegiatan<RequiredStar /></Label>
              <SearchableSelect label="Kegiatan" options={kegiatanOptions} value={form.kegiatanId} onChange={(value) => updateForm('kegiatanId', value)} />
            </div>
            <div ref={periodeRef} className="space-y-2">
              <Label htmlFor="periode">Periode<RequiredStar /></Label>
              <SearchableSelect label="Periode" options={periodeOptions} value={form.periodeId} onChange={(value) => updateForm('periodeId', value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea id="deskripsi" value={form.deskripsi} onChange={(event) => updateForm('deskripsi', event.target.value)} rows={5} className="resize-none bg-white" style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uraian">Uraian</Label>
            <Textarea id="uraian" value={form.uraian} onChange={(event) => updateForm('uraian', event.target.value)} rows={5} className="resize-none bg-white" style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button variant="outline" onClick={() => navigate('/admin/penugasan')}>Batal</Button>
            <Button className="admin-proceed-button" disabled={!form.kegiatanId || !form.periodeId} onClick={handleSubmit}>Simpan Penugasan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
