import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Calendar,
  Check,
  ChevronsUpDown,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  createPegawai,
  deletePegawai,
  getPegawaiList,
  getPegawaiReferences,
  updatePegawai,
  type Pegawai as Employee,
  type PegawaiPayload,
  type PegawaiReferences,
  type RelationOption,
} from '../../api/pegawaiApi';
import { Button } from '../ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
import { Skeleton } from '../ui/skeleton';
import { cn } from '../ui/utils';

type DataKepegawaianViewProps = {
  detailPlacement?: 'row' | 'bottom';
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

function focusEmployeeField(ref: React.RefObject<HTMLDivElement>) {
  const element = ref.current;
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = element.querySelector('button, input, textarea') as HTMLElement | null;
  window.setTimeout(() => focusable?.focus(), 250);
}

const jabatanOptions: RelationOption[] = [
  { id: '1', label: 'Pustakawan Ahli Madya' },
  { id: '2', label: 'Pustakawan Ahli Muda' },
  { id: '3', label: 'Pustakawan Penyelia' },
  { id: '4', label: 'Pustakawan Ahli Pertama' },
  { id: '5', label: 'Pustakawan Terampil' },
  { id: '6', label: 'Pelaksana' },
];

const pangkatOptions: RelationOption[] = [
  { id: '1', label: 'Pembina Tk I' },
  { id: '2', label: 'Pembina' },
  { id: '3', label: 'Penata Tk I' },
  { id: '4', label: 'Penata' },
  { id: '5', label: 'Pegawai Tetap' },
  { id: '6', label: 'Penata Muda Tk I' },
  { id: '7', label: 'Penata Muda' },
  { id: '8', label: 'Pengatur' },
  { id: '9', label: 'Pengatur Muda' },
  { id: '10', label: 'Pegawai Tidak Tetap' },
];

const golonganOptions: RelationOption[] = [
  { id: '1', label: 'IV/b' },
  { id: '2', label: 'IV/a' },
  { id: '3', label: 'III/d' },
  { id: '4', label: 'III/c' },
  { id: '5', label: 'III/b' },
  { id: '6', label: 'III/a' },
  { id: '7', label: 'II/c' },
  { id: '8', label: 'II/a' },
  { id: '9', label: 'setara III/b' },
  { id: '10', label: 'setara II/d' },
  { id: '11', label: 'setara III/a' },
];

const penempatanOptions: RelationOption[] = [
  { id: '1', label: 'Hubungan Masyarakat' },
  { id: '2', label: 'Pembinaan Koleksi' },
  { id: '3', label: 'KK, Referensi, Koleksi A' },
  { id: '4', label: 'Pelatihan dan Pengembangan' },
  { id: '5', label: 'Referensi & Repository Kampus C' },
  { id: '6', label: 'Pengolahan Informasi & Data Perpustakaan' },
  { id: '7', label: 'Kasubag Tata Usaha' },
  { id: '8', label: 'Kepegawaian' },
  { id: '9', label: 'Kasie Kepustakawanan' },
  { id: '10', label: 'Ruang Baca Umum B, Podcast, Movio' },
  { id: '11', label: 'RBU, Terbitan Berkala C' },
  { id: '12', label: 'Layanan Sirkulasi C' },
  { id: '13', label: 'Layanan E-Lib Kampus C' },
  { id: '14', label: 'Layanan Repository Kampus B' },
  { id: '15', label: 'Layanan Sirkulasi B' },
  { id: '16', label: 'Layanan RBU B' },
  { id: '17', label: 'Sarana dan Prasarana' },
  { id: '18', label: 'Sekretariat' },
  { id: '19', label: 'Teknologi Informasi' },
  { id: '20', label: 'Keuangan' },
];

const sertifikasiOptions: RelationOption[] = [
  { id: '1', label: 'Pemasyarakatan Perpustakaan' },
  { id: '2', label: 'Pengembangan Bahan Pustaka' },
  { id: '3', label: 'Pengolahan Bahan Pustaka' },
  { id: '4', label: 'Layanan Perpustakaan' },
];

const roleOptions: RelationOption[] = [
  { id: '1', label: 'Admin' },
  { id: '2', label: 'Pimpinan' },
  { id: '3', label: 'Pegawai' },
];

const employeeSeeds: Employee[] = [
  {
    id: 1,
    nip: '198801052010012001',
    nama: 'Sarah Johnson',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1988-01-05',
    role_id: '1',
    fungsional: 'Pustakawan Ahli Muda',
    tmt_golongan: '2022-04-01',
    pendidikan: 'S2 Ilmu Perpustakaan',
    kualifikasi: 'Manajemen perpustakaan digital',
    tmt_kgb: '2025-04-01',
    tmt_jabatan: '2021-08-01',
    tmt_pensiun: '2048-01-05',
    jabatan_id: '2',
    pangkat_id: '4',
    golongan_id: '4',
    penempatan_id: '1',
    sertifikasi_id: '1',
  },
  {
    id: 2,
    nip: '198709122011011002',
    nama: 'Michael Chen',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '1987-09-12',
    role_id: '2',
    fungsional: 'Pustakawan Ahli Madya',
    tmt_golongan: '2023-10-01',
    pendidikan: 'S2 Administrasi Publik',
    kualifikasi: 'Pengembangan layanan informasi',
    tmt_kgb: '2026-10-01',
    tmt_jabatan: '2022-01-01',
    tmt_pensiun: '2047-09-12',
    jabatan_id: '1',
    pangkat_id: '3',
    golongan_id: '3',
    penempatan_id: '5',
    sertifikasi_id: '1',
  },
  {
    id: 3,
    nip: '199001182012012003',
    nama: 'Emily Davis',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1990-01-18',
    role_id: '3',
    fungsional: 'Analis SDM Aparatur',
    tmt_golongan: '2021-04-01',
    pendidikan: 'S1 Psikologi',
    kualifikasi: 'Analisis jabatan dan kinerja',
    tmt_kgb: '2025-04-01',
    tmt_jabatan: '2020-07-01',
    tmt_pensiun: '2050-01-18',
    jabatan_id: '6',
    pangkat_id: '6',
    golongan_id: '5',
    penempatan_id: '4',
    sertifikasi_id: '3',
  },
  {
    id: 4,
    nip: '199103072013012004',
    nama: 'James Wilson',
    tempat_lahir: 'Yogyakarta',
    tanggal_lahir: '1991-03-07',
    role_id: '3',
    fungsional: 'Pustakawan Ahli Pertama',
    tmt_golongan: '2020-10-01',
    pendidikan: 'S1 Ilmu Informasi',
    kualifikasi: 'Pengolahan koleksi dan metadata',
    tmt_kgb: '2024-10-01',
    tmt_jabatan: '2019-05-01',
    tmt_pensiun: '2051-03-07',
    jabatan_id: '4',
    pangkat_id: '7',
    golongan_id: '6',
    penempatan_id: '2',
    sertifikasi_id: '2',
  },
  {
    id: 5,
    nip: '199204222014012005',
    nama: 'Lisa Anderson',
    tempat_lahir: 'Malang',
    tanggal_lahir: '1992-04-22',
    role_id: '3',
    fungsional: 'Pranata Komputer Ahli Pertama',
    tmt_golongan: '2022-10-01',
    pendidikan: 'S1 Sistem Informasi',
    kualifikasi: 'Sistem informasi perpustakaan',
    tmt_kgb: '2026-10-01',
    tmt_jabatan: '2021-02-01',
    tmt_pensiun: '2052-04-22',
    jabatan_id: '5',
    pangkat_id: '6',
    golongan_id: '5',
    penempatan_id: '3',
    sertifikasi_id: '3',
  },
];

const initialEmployees: Employee[] = Array.from({ length: 18 }, (_, index) => {
  const seed = employeeSeeds[index % employeeSeeds.length];
  const sequence = index + 1;

  return {
    ...seed,
    id: sequence,
    nip: `${seed.nip.slice(0, 14)}${sequence.toString().padStart(4, '0')}`,
    nama: index < employeeSeeds.length ? seed.nama : `${seed.nama} ${Math.floor(index / employeeSeeds.length) + 1}`,
  };
});

function createEmptyEmployee(): Employee {
  return {
    id: 0,
    nip: '',
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    role_id: '',
    fungsional: '',
    tmt_golongan: '',
    pendidikan: '',
    kualifikasi: '',
    tmt_kgb: '',
    tmt_jabatan: '',
    tmt_pensiun: '',
    jabatan_id: '',
    pangkat_id: '',
    golongan_id: '',
    penempatan_id: '',
    sertifikasi_id: '',
  };
}

const fallbackReferences: PegawaiReferences = {
  roles: roleOptions,
  jabatan: jabatanOptions,
  pangkat: pangkatOptions,
  golongan: golonganOptions,
  penempatan: penempatanOptions,
  sertifikasi: sertifikasiOptions,
};

type RelationMaps = {
  role_id: RelationOption[];
  jabatan_id: RelationOption[];
  pangkat_id: RelationOption[];
  golongan_id: RelationOption[];
  penempatan_id: RelationOption[];
  sertifikasi_id: RelationOption[];
};

function createRelationMaps(references: PegawaiReferences): RelationMaps {
  return {
    role_id: references.roles,
    jabatan_id: references.jabatan,
    pangkat_id: references.pangkat,
    golongan_id: references.golongan,
    penempatan_id: references.penempatan,
    sertifikasi_id: references.sertifikasi,
  };
}

const pageSizeOptions = [5, 10, 20];

const detailSections = [
  {
    title: 'Data Pribadi',
    fields: [
      ['nip', 'NIP'],
      ['nama', 'Nama'],
      ['tempat_lahir', 'Tempat Lahir'],
      ['tanggal_lahir', 'Tanggal Lahir'],
      ['pendidikan', 'Pendidikan'],
      ['kualifikasi', 'Kualifikasi'],
    ],
  },
  {
    title: 'Data Kepegawaian',
    fields: [
      ['role_id', 'Role'],
      ['fungsional', 'Fungsional'],
      ['jabatan_id', 'Jabatan'],
      ['pangkat_id', 'Pangkat'],
      ['golongan_id', 'Golongan'],
      ['penempatan_id', 'Penempatan'],
      ['sertifikasi_id', 'Sertifikasi'],
    ],
  },
  {
    title: 'Tanggal TMT',
    fields: [
      ['tmt_golongan', 'TMT Golongan'],
      ['tmt_kgb', 'TMT KGB'],
      ['tmt_jabatan', 'TMT Jabatan'],
      ['tmt_pensiun', 'TMT Pensiun'],
    ],
  },
] as const;

const editableFields = [
  { key: 'nip', label: 'NIP', type: 'text', group: 'Data Pribadi' },
  { key: 'nama', label: 'Nama', type: 'text', group: 'Data Pribadi' },
  { key: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', group: 'Data Pribadi' },
  { key: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', group: 'Data Pribadi' },
  { key: 'pendidikan', label: 'Pendidikan', type: 'text', group: 'Data Pribadi' },
  { key: 'kualifikasi', label: 'Kualifikasi', type: 'text', group: 'Data Pribadi' },
  { key: 'role_id', label: 'Role', type: 'relation', group: 'Data Kepegawaian' },
  { key: 'fungsional', label: 'Fungsional', type: 'text', group: 'Data Kepegawaian' },
  { key: 'jabatan_id', label: 'Jabatan', type: 'relation', group: 'Data Kepegawaian' },
  { key: 'pangkat_id', label: 'Pangkat', type: 'relation', group: 'Data Kepegawaian' },
  { key: 'golongan_id', label: 'Golongan', type: 'relation', group: 'Data Kepegawaian' },
  { key: 'penempatan_id', label: 'Penempatan', type: 'relation', group: 'Data Kepegawaian' },
  { key: 'sertifikasi_id', label: 'Sertifikasi', type: 'relation', group: 'Data Kepegawaian' },
  { key: 'tmt_golongan', label: 'TMT Golongan', type: 'date', group: 'Tanggal TMT' },
  { key: 'tmt_kgb', label: 'TMT KGB', type: 'date', group: 'Tanggal TMT' },
  { key: 'tmt_jabatan', label: 'TMT Jabatan', type: 'date', group: 'Tanggal TMT' },
  { key: 'tmt_pensiun', label: 'TMT Pensiun', type: 'date', group: 'Tanggal TMT' },
] as const;

function getRelationLabel(maps: RelationMaps, key: keyof RelationMaps, value: string) {
  return maps[key].find((item) => item.id === value)?.label ?? '-';
}

function getEmployeeFieldValue(employee: Employee, maps: RelationMaps, key: keyof Employee) {
  if (key in maps) {
    return getRelationLabel(maps, key as keyof RelationMaps, employee[key]);
  }
  return employee[key] || '-';
}

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage === 1) {
    return [1, 2, 3, totalPages];
  }

  if (currentPage >= totalPages - 1) {
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return Array.from(
    new Set([currentPage - 1, currentPage, currentPage + 1, totalPages].filter((page) => page >= 1 && page <= totalPages)),
  ).sort((a, b) => a - b);
}

function EmployeePagination({
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
            {idx > 0 && page - visiblePages[idx - 1] > 1 && (
              <span className="px-1 text-xs text-gray-500">...</span>
            )}
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
  options: RelationOption[];
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
        className="h-10 w-full justify-between bg-white px-3 text-left font-normal"
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
        <div
          className="mt-1 rounded-md border bg-white shadow-md"
          style={{ borderColor: '#d1d5db', maxHeight: '11rem', overflow: 'hidden' }}
        >
          <div className="border-b p-2" style={{ borderColor: '#e5e7eb' }}>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="bg-white"
              style={{ height: '2rem', fontSize: '0.8125rem', borderColor: '#d1d5db' }}
              autoFocus
            />
          </div>

          <div style={{ maxHeight: '7.25rem', overflowY: 'auto' }}>
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

function DetailModal({
  employee,
  relationMaps,
  open,
  onOpenChange,
}: {
  employee: Employee | null;
  relationMaps: RelationMaps;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '608px', maxHeight: '64vh', overflow: 'hidden', padding: '1rem', gap: '0.75rem' }}>
        <DialogHeader style={{ gap: '0.25rem' }}>
          <DialogTitle style={{ fontSize: '1rem' }}>Detail Pegawai</DialogTitle>
          <DialogDescription style={{ fontSize: '0.8125rem' }}>Data lengkap profil pegawai beserta relasi kepegawaiannya.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(64vh - 5rem)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="rounded-lg border bg-gray-50" style={{ padding: '0.75rem' }}>
            <p className="font-semibold text-gray-900" style={{ fontSize: '0.9375rem' }}>{employee.nama}</p>
            <p className="font-normal text-gray-500" style={{ fontSize: '0.8125rem' }}>NIP {employee.nip}</p>
          </div>

          {detailSections.map((section) => (
            <section key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 className="font-semibold text-gray-900" style={{ fontSize: '0.8125rem' }}>{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '0.5rem' }}>
                {section.fields.map(([key, label]) => (
                  <div key={key} className="rounded-md border bg-white" style={{ padding: '0.625rem' }}>
                    <p className="font-medium uppercase tracking-wide text-gray-500" style={{ fontSize: '0.6875rem' }}>{label}</p>
                    <p className="font-medium text-gray-900" style={{ marginTop: '0.125rem', fontSize: '0.8125rem' }}>
                      {getEmployeeFieldValue(employee, relationMaps, key as keyof Employee)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditEmployeeModal({
  employee,
  relationMaps,
  mode = 'edit',
  open,
  isSubmitting = false,
  onOpenChange,
  onSave,
}: {
  employee: Employee | null;
  relationMaps: RelationMaps;
  mode?: 'add' | 'edit';
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: Employee) => Promise<void> | void;
}) {
  const [form, setForm] = useState<Employee | null>(employee);
  const [error, setError] = useState('');
  const roleFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm(employee);
    setError('');
  }, [employee]);

  if (!form) return null;

  const updateField = (key: keyof Employee, value: string) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setError('');
  };

  const handleSubmit = async () => {
    const requiredFields: (keyof Employee)[] = ['nama', 'role_id'];
    const hasEmptyField = requiredFields.some((key) => !form[key].trim());

    if (hasEmptyField) {
      setError(!form.nama.trim() ? 'Nama pegawai wajib diisi.' : 'Role wajib diisi.');
      focusEmployeeField(roleFieldRef);
      return;
    }

    try {
      await onSave(form);
      onOpenChange(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal menyimpan data pegawai.');
    }
  };

  const isFormValid = Boolean(form.nama.trim() && form.role_id.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '608px', maxHeight: '64vh', overflow: 'hidden', padding: '1rem', gap: '0.75rem' }}>
        <DialogHeader style={{ gap: '0.25rem' }}>
          <DialogTitle style={{ fontSize: '1rem' }}>{mode === 'add' ? 'Tambah Pegawai' : 'Edit Data Pegawai'}</DialogTitle>
          <DialogDescription style={{ fontSize: '0.8125rem' }}>
            {mode === 'add'
              ? 'Lengkapi data profil dan kepegawaian pegawai baru.'
              : 'Perbarui seluruh data profil dan kepegawaian pegawai.'}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(64vh - 8.5rem)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {['Data Pribadi', 'Data Kepegawaian', 'Tanggal TMT'].map((group) => (
            <section key={group} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 className="font-semibold text-gray-900" style={{ fontSize: '0.8125rem' }}>{group}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '0.625rem' }}>
                {editableFields
                  .filter((field) => field.group === group)
                  .map((field) => {
                    const key = field.key as keyof Employee;

                    return (
                      <div
                        key={field.key}
                        ref={field.key === 'role_id' ? roleFieldRef : undefined}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
                      >
                        <Label htmlFor={`employee-${field.key}`} className="text-gray-700" style={{ fontSize: '0.8125rem' }}>
                          {field.label}
                          {(field.key === 'nama' || field.key === 'role_id') && <RequiredStar />}
                        </Label>
                        {field.type === 'relation' ? (
                          <SearchableSelect
                            label={field.label}
                            options={relationMaps[field.key as keyof RelationMaps]}
                            value={form[key]}
                            onChange={(value) => updateField(key, value)}
                          />
                        ) : field.type === 'date' ? (
                          <div className="relative">
                            <Input
                              id={`employee-${field.key}`}
                              type="date"
                              value={form[key]}
                              onChange={(event) => updateField(key, event.target.value)}
                              onClick={openDatePicker}
                              className="admin-date-input bg-white"
                              style={{ height: '2.25rem', fontSize: '0.8125rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.25rem' }}
                            />
                            <Calendar
                              className="text-gray-400"
                              style={{ position: 'absolute', right: '0.75rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            />
                          </div>
                        ) : (
                          <Input
                            id={`employee-${field.key}`}
                            type={field.type}
                            value={form[key]}
                            onChange={(event) => updateField(key, event.target.value)}
                            className="bg-white"
                            style={{ height: '2.25rem', fontSize: '0.8125rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}

          {error && <p className="rounded-md bg-red-50 p-2 font-medium text-red-600" style={{ fontSize: '0.8125rem' }}>{error}</p>}
        </div>

        <DialogFooter style={{ gap: '0.5rem' }}>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 px-3 text-xs">
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="admin-proceed-button h-8 px-3 text-xs">
            {isSubmitting ? 'Menyimpan...' : mode === 'add' ? 'Simpan' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteEmployeeModal({
  employee,
  open,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: {
  employee: Employee | null;
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [confirmation, setConfirmation] = useState('');
  const canDelete = confirmation === 'hapus';

  const close = (nextOpen: boolean) => {
    if (!nextOpen) setConfirmation('');
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-600" />
            Konfirmasi Hapus Pegawai
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus data pegawai ini? Tindakan ini bersifat serius dan tidak dapat dibatalkan
            pada alur produksi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {employee && (
            <div className="rounded-lg border bg-gray-50 p-3">
              <p className="text-sm font-semibold text-gray-900">{employee.nama}</p>
              <p className="text-xs text-gray-500">NIP {employee.nip}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">Ketik "hapus" untuk melanjutkan</Label>
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="hapus"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            disabled={!canDelete || isSubmitting}
            onClick={async () => {
              await onConfirm();
            }}
          >
            {isSubmitting ? 'Menghapus...' : 'Konfirmasi Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DataKepegawaianView(_props: DataKepegawaianViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [references, setReferences] = useState<PegawaiReferences>(fallbackReferences);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [addEmployee, setAddEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const employeeGridStyle = {
    minWidth: '1080px',
    gridTemplateColumns: 'minmax(240px, 1.35fr) minmax(120px, 0.7fr) minmax(180px, 1fr) minmax(140px, 0.75fr) minmax(100px, 0.55fr) 220px',
  };
  const relationMaps = useMemo(() => createRelationMaps(references), [references]);

  const loadEmployees = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [referenceData, employeeData] = await Promise.all([getPegawaiReferences(), getPegawaiList()]);
      setReferences(referenceData);
      setEmployees(employeeData);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil data pegawai.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) =>
      (roleFilter === 'all' || employee.role_id === roleFilter) &&
      (!query ||
        [
          employee.nama,
          employee.nip,
          getRelationLabel(relationMaps, 'role_id', employee.role_id),
          employee.fungsional,
          getRelationLabel(relationMaps, 'pangkat_id', employee.pangkat_id),
          getRelationLabel(relationMaps, 'golongan_id', employee.golongan_id),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)),
    );
  }, [employees, relationMaps, search, roleFilter]);

  const toPayload = (employee: Employee): PegawaiPayload => {
    const { id: _id, ...payload } = employee;
    return payload;
  };

  const saveEmployee = async (updatedEmployee: Employee) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setFormErrorMessage('');

    try {
      const savedEmployee = await updatePegawai(updatedEmployee.id, toPayload(updatedEmployee));
      setEmployees((current) => current.map((employee) => (employee.id === savedEmployee.id ? savedEmployee : employee)));
      setEditEmployee(null);
    } catch (error: any) {
      setFormErrorMessage(error.response?.data?.message || 'Gagal memperbarui pegawai.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewEmployee = async (newEmployee: Employee) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setFormErrorMessage('');

    try {
      const savedEmployee = await createPegawai(toPayload(newEmployee));
      setEmployees((current) => [savedEmployee, ...current]);
      setAddEmployee(null);
      setPage(1);
    } catch (error: any) {
      setFormErrorMessage(error.response?.data?.message || 'Gagal menambahkan pegawai.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteEmployee) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deletePegawai(deleteEmployee.id);
      setEmployees((current) => current.filter((employee) => employee.id !== deleteEmployee.id));
      setDeleteEmployee(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal menghapus pegawai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Kepegawaian</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola daftar pegawai, detail profil, dan data relasi kepegawaian.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
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
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
          >
            <option value="all">Semua Role</option>
            {references.roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar Pegawai</CardTitle>
          <CardDescription>Ringkasan pegawai dengan aksi detail, edit, dan hapus.</CardDescription>
          <CardAction>
            <Button className="h-10 whitespace-nowrap" onClick={() => setAddEmployee(createEmptyEmployee())}>
              <Plus className="size-4" />
              Tambah Pegawai
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <p className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
              <AlertCircle className="size-4" />
              {errorMessage}
            </p>
          )}
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
                {isLoading ? (
                  Array.from({ length: pageSize }).map((_, index) => (
                    <div
                      key={`employee-skeleton-${index}`}
                      className="grid items-center px-5 py-4"
                      style={employeeGridStyle}
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="mx-auto h-8 w-48" />
                    </div>
                  ))
                ) : paginatedEmployees.length > 0 ? (
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
                      <div className="text-sm text-gray-700">{getRelationLabel(relationMaps, 'role_id', employee.role_id)}</div>
                      <div className="text-sm text-gray-700">{employee.fungsional}</div>
                      <div className="text-sm text-gray-700">{getRelationLabel(relationMaps, 'pangkat_id', employee.pangkat_id)}</div>
                      <div className="text-sm text-gray-700">{getRelationLabel(relationMaps, 'golongan_id', employee.golongan_id)}</div>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setDetailEmployee(employee)}>
                          <Eye className="size-3.5" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setEditEmployee(employee)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setDeleteEmployee(employee)}>
                          <Trash2 className="size-3.5" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center text-sm text-gray-500">Data pegawai tidak ditemukan.</div>
                )}
              </div>
            </div>

            <EmployeePagination
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

      <DetailModal
        employee={detailEmployee}
        relationMaps={relationMaps}
        open={Boolean(detailEmployee)}
        onOpenChange={(open) => !open && setDetailEmployee(null)}
      />

      <EditEmployeeModal
        employee={editEmployee}
        relationMaps={relationMaps}
        open={Boolean(editEmployee)}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setEditEmployee(null)}
        onSave={saveEmployee}
      />

      <EditEmployeeModal
        employee={addEmployee}
        relationMaps={relationMaps}
        mode="add"
        open={Boolean(addEmployee)}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setAddEmployee(null)}
        onSave={addNewEmployee}
      />

      <DeleteEmployeeModal
        employee={deleteEmployee}
        open={Boolean(deleteEmployee)}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setDeleteEmployee(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
