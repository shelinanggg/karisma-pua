import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Eye, ListChecks, Search } from 'lucide-react';
import {
  getPegawaiList,
  getPegawaiReferences,
  type Pegawai as Employee,
  type PegawaiReferences,
  type RelationOption,
} from '../../api/pegawaiApi';
import {
  getPenugasanButirByPegawai,
  type PenugasanButir,
} from '../../api/penugasanApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';

type DataKepegawaianViewProps = {
  detailPlacement?: 'row' | 'bottom';
};

type RelationMaps = {
  role_id: RelationOption[];
  jabatan_id: RelationOption[];
  pangkat_id: RelationOption[];
  golongan_id: RelationOption[];
  penempatan_id: RelationOption[];
  sertifikasi_id: RelationOption[];
};

const fallbackReferences: PegawaiReferences = {
  roles: [],
  jabatan: [],
  pangkat: [],
  golongan: [],
  penempatan: [],
  sertifikasi: [],
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
      ['target_ketercapaian', 'Target Ketercapaian'],
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

function getRelationLabel(maps: RelationMaps, key: keyof RelationMaps, value: string) {
  return maps[key].find((item) => item.id === value)?.label ?? '-';
}

function getEmployeeFieldValue(employee: Employee, maps: RelationMaps, key: keyof Employee) {
  if (key in maps) {
    return getRelationLabel(maps, key as keyof RelationMaps, employee[key] as string);
  }

  return employee[key] ? String(employee[key]) : '-';
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
            <p className="font-normal text-gray-500" style={{ fontSize: '0.8125rem' }}>NIP {employee.nip || '-'}</p>
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

function DetailKegiatanModal({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [items, setItems] = useState<PenugasanButir[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadKegiatan = async () => {
      if (!open || !employee) return;

      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getPenugasanButirByPegawai(String(employee.id));
        if (!ignore) setItems(data);
      } catch (error: any) {
        if (!ignore) setErrorMessage(error.response?.data?.message || 'Gagal mengambil detail kegiatan pegawai.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadKegiatan();

    return () => {
      ignore = true;
    };
  }, [employee, open]);

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '760px', maxHeight: '68vh', overflow: 'hidden', padding: '1rem', gap: '0.75rem' }}>
        <DialogHeader style={{ gap: '0.25rem' }}>
          <DialogTitle style={{ fontSize: '1rem' }}>Detail Kegiatan</DialogTitle>
          <DialogDescription style={{ fontSize: '0.8125rem' }}>{employee.nama} - NIP {employee.nip || '-'}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(68vh - 5rem)' }}>
          {errorMessage && (
            <p className="mb-3 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
              <AlertCircle className="size-4" />
              {errorMessage}
            </p>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="p-3 font-semibold">Butir Kegiatan</th>
                  <th className="p-3 font-semibold">Target</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">Memuat detail kegiatan...</td>
                  </tr>
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="border-t align-top hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-semibold text-gray-900">{item.namaKegiatan || '-'}</p>
                        <p className="mt-1 text-xs text-gray-500">{item.uraian || item.deskripsi || 'Belum ada uraian kegiatan.'}</p>
                      </td>
                      <td className="p-3 text-gray-700">{item.targetKetercapaian || '-'}</td>
                      <td className="p-3">
                        <span className="inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                          {item.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">Belum ada kegiatan yang ditetapkan untuk pegawai ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PimpinanDataKepegawaianView(_props: DataKepegawaianViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [references, setReferences] = useState<PegawaiReferences>(fallbackReferences);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);
  const [detailKegiatanEmployee, setDetailKegiatanEmployee] = useState<Employee | null>(null);
  const employeeGridStyle = {
    minWidth: '1080px',
    gridTemplateColumns: 'minmax(240px, 1.35fr) minmax(120px, 0.7fr) minmax(180px, 1fr) minmax(140px, 0.75fr) minmax(100px, 0.55fr) 220px',
  };
  const relationMaps = useMemo(() => createRelationMaps(references), [references]);

  useEffect(() => {
    let ignore = false;

    const loadEmployees = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [referenceData, employeeData] = await Promise.all([getPegawaiReferences(), getPegawaiList()]);
        if (!ignore) {
          setReferences(referenceData);
          setEmployees(employeeData);
        }
      } catch (error: any) {
        if (!ignore) setErrorMessage(error.response?.data?.message || 'Gagal mengambil data pegawai.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadEmployees();

    return () => {
      ignore = true;
    };
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
          <CardDescription>Ringkasan pegawai dengan aksi lihat detail.</CardDescription>
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
                  <div className="px-5 py-10 text-center text-sm text-gray-500">Memuat data pegawai...</div>
                ) : paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="grid items-center px-5 py-4 transition hover:bg-gray-50"
                      style={employeeGridStyle}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{employee.nama}</p>
                        <p className="truncate text-xs font-normal text-gray-500">NIP {employee.nip || '-'}</p>
                      </div>
                      <div className="text-sm text-gray-700">{getRelationLabel(relationMaps, 'role_id', employee.role_id)}</div>
                      <div className="text-sm text-gray-700">{employee.fungsional || '-'}</div>
                      <div className="text-sm text-gray-700">{getRelationLabel(relationMaps, 'pangkat_id', employee.pangkat_id)}</div>
                      <div className="text-sm text-gray-700">{getRelationLabel(relationMaps, 'golongan_id', employee.golongan_id)}</div>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setDetailEmployee(employee)}>
                          <Eye className="size-3.5" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setDetailKegiatanEmployee(employee)}>
                          <ListChecks className="size-3.5" />
                          Kegiatan
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

      <DetailKegiatanModal
        employee={detailKegiatanEmployee}
        open={Boolean(detailKegiatanEmployee)}
        onOpenChange={(open) => !open && setDetailKegiatanEmployee(null)}
      />
    </div>
  );
}
