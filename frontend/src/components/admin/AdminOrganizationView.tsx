import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronsUpDown,
  Eye,
  Pencil,
  Search,
  Trash2,
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

type AdminOrganizationViewProps = {
  detailPlacement?: 'row' | 'bottom';
};

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

const employeeSeeds: Employee[] = [
  {
    id: 'emp-1',
    nip: '198801052010012001',
    nama: 'Sarah Johnson',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1988-01-05',
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

function EditEmployeeModal({
  employee,
  open,
  onOpenChange,
  onSave,
}: {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: Employee) => void;
}) {
  const [form, setForm] = useState<Employee | null>(employee);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(employee);
    setError('');
  }, [employee]);

  if (!form) return null;

  const updateField = (key: keyof Employee, value: string) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setError('');
  };

  const handleSubmit = () => {
    const requiredFields: (keyof Employee)[] = ['nip', 'nama', 'tempat_lahir', 'tanggal_lahir', 'fungsional'];
    const hasEmptyField = requiredFields.some((key) => !form[key].trim());

    if (hasEmptyField) {
      setError('NIP, nama, tempat lahir, tanggal lahir, dan fungsional wajib diisi.');
      return;
    }

    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '608px', maxHeight: '64vh', overflow: 'hidden', padding: '1rem', gap: '0.75rem' }}>
        <DialogHeader style={{ gap: '0.25rem' }}>
          <DialogTitle style={{ fontSize: '1rem' }}>Edit Data Pegawai</DialogTitle>
          <DialogDescription style={{ fontSize: '0.8125rem' }}>Perbarui seluruh data profil dan kepegawaian pegawai.</DialogDescription>
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
                      <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        <Label htmlFor={`employee-${field.key}`} className="text-gray-700" style={{ fontSize: '0.8125rem' }}>
                          {field.label}
                        </Label>
                        {field.type === 'relation' ? (
                          <SearchableSelect
                            label={field.label}
                            options={relationMaps[field.key as keyof typeof relationMaps]}
                            value={form[key]}
                            onChange={(value) => updateField(key, value)}
                          />
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
          <Button onClick={handleSubmit} className="h-8 px-3 text-xs">Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteEmployeeModal({
  employee,
  open,
  onOpenChange,
  onConfirm,
}: {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
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
            disabled={!canDelete}
            onClick={() => {
              onConfirm();
              close(false);
            }}
          >
            Konfirmasi Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminOrganizationView(_props: AdminOrganizationViewProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const employeeGridStyle = {
    minWidth: '980px',
    gridTemplateColumns: 'minmax(260px, 1.4fr) minmax(190px, 1fr) minmax(150px, 0.8fr) minmax(110px, 0.6fr) 220px',
  };

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) =>
      [employee.nama, employee.nip, employee.fungsional, getRelationLabel('pangkat_id', employee.pangkat_id), getRelationLabel('golongan_id', employee.golongan_id)]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [employees, search]);

  const saveEmployee = (updatedEmployee: Employee) => {
    setEmployees((current) => current.map((employee) => (employee.id === updatedEmployee.id ? updatedEmployee : employee)));
  };

  const confirmDelete = () => {
    if (!deleteEmployee) return;
    setEmployees((current) => current.filter((employee) => employee.id !== deleteEmployee.id));
    setDeleteEmployee(null);
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
        <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 lg:w-80">
          <Search className="size-4 shrink-0 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, NIP, fungsional..."
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar Pegawai</CardTitle>
          <CardDescription>Ringkasan pegawai dengan aksi detail, edit, dan hapus.</CardDescription>
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
                      <div className="text-sm text-gray-700">{employee.fungsional}</div>
                      <div className="text-sm text-gray-700">{getRelationLabel('pangkat_id', employee.pangkat_id)}</div>
                      <div className="text-sm text-gray-700">{getRelationLabel('golongan_id', employee.golongan_id)}</div>
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

      <DetailModal employee={detailEmployee} open={Boolean(detailEmployee)} onOpenChange={(open) => !open && setDetailEmployee(null)} />

      <EditEmployeeModal
        employee={editEmployee}
        open={Boolean(editEmployee)}
        onOpenChange={(open) => !open && setEditEmployee(null)}
        onSave={saveEmployee}
      />

      <DeleteEmployeeModal
        employee={deleteEmployee}
        open={Boolean(deleteEmployee)}
        onOpenChange={(open) => !open && setDeleteEmployee(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
