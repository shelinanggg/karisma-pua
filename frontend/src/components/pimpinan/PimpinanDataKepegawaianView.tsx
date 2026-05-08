import { useMemo, useRef, useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  ChevronsUpDown,
  Eye,
  Search,
} from 'lucide-react';
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
import { cn } from '../ui/utils';

type RelationOption = {
  id: string;
  label: string;
};

type Employee = {
  id: string;
  nip: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  role_id: string;
  fungsional: string;
  tmt_golongan: string;
  pendidikan: string;
  kualifikasi: string;
  tmt_kgb: string;
  tmt_jabatan: string;
  tmt_pensiun: string;
  jabatan_id: string;
  pangkat_id: string;
  golongan_id: string;
  penempatan_id: string;
  sertifikasi_id: string;
};

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

const jabatanOptions: RelationOption[] = [
  { id: 'jab-1', label: 'Pustakawan Ahli Pertama' },
  { id: 'jab-2', label: 'Pustakawan Ahli Muda' },
  { id: 'jab-3', label: 'Pustakawan Ahli Madya' },
  { id: 'jab-4', label: 'Pranata Komputer Ahli Pertama' },
  { id: 'jab-5', label: 'Analis SDM Aparatur' },
];

const pangkatOptions: RelationOption[] = [
  { id: 'pkt-1', label: 'Penata Muda' },
  { id: 'pkt-2', label: 'Penata Muda Tk. I' },
  { id: 'pkt-3', label: 'Penata' },
  { id: 'pkt-4', label: 'Penata Tk. I' },
  { id: 'pkt-5', label: 'Pembina' },
];

const golonganOptions: RelationOption[] = [
  { id: 'gol-1', label: 'III/a' },
  { id: 'gol-2', label: 'III/b' },
  { id: 'gol-3', label: 'III/c' },
  { id: 'gol-4', label: 'III/d' },
  { id: 'gol-5', label: 'IV/a' },
];

const penempatanOptions: RelationOption[] = [
  { id: 'pen-1', label: 'Perpustakaan Kampus A' },
  { id: 'pen-2', label: 'Perpustakaan Kampus B' },
  { id: 'pen-3', label: 'Perpustakaan Kampus C' },
  { id: 'pen-4', label: 'Bidang Pengolahan Koleksi' },
  { id: 'pen-5', label: 'Bidang Layanan Pemustaka' },
];

const sertifikasiOptions: RelationOption[] = [
  { id: 'ser-1', label: 'Tersertifikasi Pustakawan' },
  { id: 'ser-2', label: 'Belum Tersertifikasi' },
  { id: 'ser-3', label: 'Sertifikasi Dalam Proses' },
];

const roleOptions: RelationOption[] = [
  { id: 'role-admin', label: 'Admin' },
  { id: 'role-pimpinan', label: 'Pimpinan' },
  { id: 'role-pegawai', label: 'Pegawai' },
];

const employeeSeeds: Employee[] = [
  {
    id: 'emp-1',
    nip: '198801052010012001',
    nama: 'Sarah Johnson',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1988-01-05',
    role_id: 'role-admin',
    fungsional: 'Pustakawan Ahli Muda',
    tmt_golongan: '2022-04-01',
    pendidikan: 'S2 Ilmu Perpustakaan',
    kualifikasi: 'Manajemen perpustakaan digital',
    tmt_kgb: '2025-04-01',
    tmt_jabatan: '2021-08-01',
    tmt_pensiun: '2048-01-05',
    jabatan_id: 'jab-2',
    pangkat_id: 'pkt-3',
    golongan_id: 'gol-3',
    penempatan_id: 'pen-1',
    sertifikasi_id: 'ser-1',
  },
  {
    id: 'emp-2',
    nip: '198709122011011002',
    nama: 'Michael Chen',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '1987-09-12',
    role_id: 'role-pimpinan',
    fungsional: 'Pustakawan Ahli Madya',
    tmt_golongan: '2023-10-01',
    pendidikan: 'S2 Administrasi Publik',
    kualifikasi: 'Pengembangan layanan informasi',
    tmt_kgb: '2026-10-01',
    tmt_jabatan: '2022-01-01',
    tmt_pensiun: '2047-09-12',
    jabatan_id: 'jab-3',
    pangkat_id: 'pkt-4',
    golongan_id: 'gol-4',
    penempatan_id: 'pen-5',
    sertifikasi_id: 'ser-1',
  },
  {
    id: 'emp-3',
    nip: '199001182012012003',
    nama: 'Emily Davis',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1990-01-18',
    role_id: 'role-pegawai',
    fungsional: 'Analis SDM Aparatur',
    tmt_golongan: '2021-04-01',
    pendidikan: 'S1 Psikologi',
    kualifikasi: 'Analisis jabatan dan kinerja',
    tmt_kgb: '2025-04-01',
    tmt_jabatan: '2020-07-01',
    tmt_pensiun: '2050-01-18',
    jabatan_id: 'jab-5',
    pangkat_id: 'pkt-2',
    golongan_id: 'gol-2',
    penempatan_id: 'pen-4',
    sertifikasi_id: 'ser-3',
  },
  {
    id: 'emp-4',
    nip: '199103072013012004',
    nama: 'James Wilson',
    tempat_lahir: 'Yogyakarta',
    tanggal_lahir: '1991-03-07',
    role_id: 'role-pegawai',
    fungsional: 'Pustakawan Ahli Pertama',
    tmt_golongan: '2020-10-01',
    pendidikan: 'S1 Ilmu Informasi',
    kualifikasi: 'Pengolahan koleksi dan metadata',
    tmt_kgb: '2024-10-01',
    tmt_jabatan: '2019-05-01',
    tmt_pensiun: '2051-03-07',
    jabatan_id: 'jab-1',
    pangkat_id: 'pkt-1',
    golongan_id: 'gol-1',
    penempatan_id: 'pen-2',
    sertifikasi_id: 'ser-2',
  },
  {
    id: 'emp-5',
    nip: '199204222014012005',
    nama: 'Lisa Anderson',
    tempat_lahir: 'Malang',
    tanggal_lahir: '1992-04-22',
    role_id: 'role-pegawai',
    fungsional: 'Pranata Komputer Ahli Pertama',
    tmt_golongan: '2022-10-01',
    pendidikan: 'S1 Sistem Informasi',
    kualifikasi: 'Sistem informasi perpustakaan',
    tmt_kgb: '2026-10-01',
    tmt_jabatan: '2021-02-01',
    tmt_pensiun: '2052-04-22',
    jabatan_id: 'jab-4',
    pangkat_id: 'pkt-2',
    golongan_id: 'gol-2',
    penempatan_id: 'pen-3',
    sertifikasi_id: 'ser-3',
  },
];

const initialEmployees: Employee[] = Array.from({ length: 18 }, (_, index) => {
  const seed = employeeSeeds[index % employeeSeeds.length];
  const sequence = index + 1;

  return {
    ...seed,
    id: `emp-${sequence}`,
    nip: `${seed.nip.slice(0, 14)}${sequence.toString().padStart(4, '0')}`,
    nama: index < employeeSeeds.length ? seed.nama : `${seed.nama} ${Math.floor(index / employeeSeeds.length) + 1}`,
  };
});

const relationMaps = {
  role_id: roleOptions,
  jabatan_id: jabatanOptions,
  pangkat_id: pangkatOptions,
  golongan_id: golonganOptions,
  penempatan_id: penempatanOptions,
  sertifikasi_id: sertifikasiOptions,
} as const;

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

function getRelationLabel(key: keyof typeof relationMaps, value: string) {
  return relationMaps[key].find((item) => item.id === value)?.label ?? '-';
}

function getEmployeeFieldValue(employee: Employee, key: keyof Employee) {
  if (key in relationMaps) {
    return getRelationLabel(key as keyof typeof relationMaps, employee[key]);
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
  open,
  onOpenChange,
}: {
  employee: Employee | null;
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
                      {getEmployeeFieldValue(employee, key as keyof Employee)}
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

type KegiatanDetail = {
  id: number;
  nama_kegiatan: string;
  progress: number;
  status: 'belum_dimulai' | 'sedang_berjalan' | 'selesai';
  deadline: string;
};

function DetailKegiatanModal({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!employee) return null;

  const kegiatanList: KegiatanDetail[] = [
    {
      id: 1,
      nama_kegiatan: 'Perencanaan Program Kerja Triwulan',
      progress: 100,
      status: 'selesai',
      deadline: '2026-03-31',
    },
    {
      id: 2,
      nama_kegiatan: 'Penyusunan Laporan Capaian Kinerja Bulanan',
      progress: 75,
      status: 'sedang_berjalan',
      deadline: '2026-05-15',
    },
    {
      id: 3,
      nama_kegiatan: 'Monitoring Disiplin Kehadiran Pegawai',
      progress: 0,
      status: 'belum_dimulai',
      deadline: '2026-06-30',
    },
  ];

  const statusLabelMap = {
    'belum_dimulai': 'Belum Dimulai',
    'sedang_berjalan': 'Sedang Berjalan',
    'selesai': 'Selesai',
  };

  const statusClassMap = {
    'belum_dimulai': 'bg-gray-100 text-gray-700',
    'sedang_berjalan': 'bg-blue-100 text-blue-700',
    'selesai': 'bg-green-100 text-green-700',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '720px', maxHeight: '64vh', overflow: 'hidden', padding: '1rem', gap: '0.75rem' }}>
        <DialogHeader style={{ gap: '0.25rem' }}>
          <DialogTitle style={{ fontSize: '1rem' }}>Detail Kegiatan</DialogTitle>
          <DialogDescription style={{ fontSize: '0.8125rem' }}>{employee.nama} - NIP {employee.nip}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(64vh - 5rem)' }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-left font-semibold text-gray-700">Nama Kegiatan</th>
                <th className="p-3 text-left font-semibold text-gray-700">Progress</th>
                <th className="p-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {kegiatanList.map((kegiatan) => (
                <tr key={kegiatan.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-900">{kegiatan.nama_kegiatan}</td>
                  <td className="p-3">
                    <div className="space-y-1" style={{ maxWidth: '220px' }}>
                      <div className="text-xs text-gray-600">{kegiatan.progress}%</div>
                      <div className="h-2 w-full bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${kegiatan.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">Deadline: {new Date(kegiatan.deadline).toLocaleDateString('id-ID')}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClassMap[kegiatan.status]}`}>
                      {statusLabelMap[kegiatan.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PimpinanDataKepegawaianView(_props: DataKepegawaianViewProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [detailKegiatanEmployee, setDetailKegiatanEmployee] = useState<Employee | null>(null);
  const employeeGridStyle = {
    minWidth: '1080px',
    gridTemplateColumns: 'minmax(240px, 1.35fr) minmax(120px, 0.7fr) minmax(180px, 1fr) minmax(140px, 0.75fr) minmax(100px, 0.55fr) 100px',
  };

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) =>
      (roleFilter === 'all' || employee.role_id === roleFilter) &&
      (!query ||
        [
          employee.nama,
          employee.nip,
          getRelationLabel('role_id', employee.role_id),
          employee.fungsional,
          getRelationLabel('pangkat_id', employee.pangkat_id),
          getRelationLabel('golongan_id', employee.golongan_id),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)),
    );
  }, [employees, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Kepegawaian</h1>
          <p className="mt-1 text-sm text-gray-500">Lihat daftar pegawai, detail profil, dan data relasi kepegawaian.</p>
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
            {roleOptions.map((role) => (
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
          <CardDescription>Ringkasan pegawai dengan aksi lihat detail.</CardDescription>
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
                      <div className="text-sm text-gray-700">{getRelationLabel('role_id', employee.role_id)}</div>
                      <div className="text-sm text-gray-700">{employee.fungsional}</div>
                      <div className="text-sm text-gray-700">{getRelationLabel('pangkat_id', employee.pangkat_id)}</div>
                      <div className="text-sm text-gray-700">{getRelationLabel('golongan_id', employee.golongan_id)}</div>
                      <div className="flex flex-col justify-center gap-1">
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => setDetailEmployee(employee)}>
                          Detail Pegawai
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => setDetailKegiatanEmployee(employee)}>
                          Detail Kegiatan
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

      <DetailKegiatanModal employee={detailKegiatanEmployee} open={Boolean(detailKegiatanEmployee)} onOpenChange={(open) => !open && setDetailKegiatanEmployee(null)} />
      <DetailModal employee={detailEmployee} open={Boolean(detailEmployee)} onOpenChange={(open) => !open && setDetailEmployee(null)} />
    </div>
  );
}
