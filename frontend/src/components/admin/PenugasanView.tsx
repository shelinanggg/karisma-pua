import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calendar, Check, ChevronsUpDown, Eye, FileText, Pencil, Search, Trash2, Upload, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getButirKegiatanList, type ButirKegiatan } from '../../api/butirKegiatanApi';
import { getPeriodeSkpList, type PeriodeSkp } from '../../api/periodeSkpApi';
import {
  createPenugasanButir,
  createPenugasanTambahan,
  deletePenugasanButir,
  getPenugasanButirByPegawai,
  getPenugasanEmployees,
  getPenugasanTambahan,
  getPenugasanTambahanList,
  updatePenugasanButir,
  updatePenugasanTambahan,
  type PenugasanButir,
  type PenugasanEmployee,
  type PenugasanTambahan,
} from '../../api/penugasanApi';
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

const pageSizeOptions = [5, 10, 20];

function RequiredStar() {
  return <span className="admin-required-star">*</span>;
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

function PenugasanPagination({
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
    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
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

function formatDateLabel(value?: string | null) {
  if (!value) return '-';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatPeriodeLabel(periode: PeriodeSkp) {
  return `SKP ${periode.tahun} - ${formatDateLabel(periode.tanggalMulai)} s/d ${formatDateLabel(periode.tanggalSelesai)}`;
}

function toOptionList(items: ButirKegiatan[] | PeriodeSkp[]) {
  return items.map((item) => {
    if ('name' in item) {
      return { id: String(item.id), label: item.name };
    }

    return { id: String(item.id), label: formatPeriodeLabel(item) };
  });
}

function getAdditionalAssignmentDates(item: PenugasanTambahan) {
  if (!item.tanggalMulai && !item.tanggalSelesai) {
    return { deadline: '-', tanggalKegiatan: '-' };
  }

  if (item.tanggalMulai && item.tanggalMulai === item.tanggalSelesai) {
    return { deadline: '-', tanggalKegiatan: formatDateLabel(item.tanggalMulai) };
  }

  return {
    deadline: `${formatDateLabel(item.tanggalMulai)} - ${formatDateLabel(item.tanggalSelesai)}`,
    tanggalKegiatan: '-',
  };
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

function AssignmentEmployeeFields({ value, options = employeeOptions, onChange, firstFieldRef }: {
  value: string[];
  options?: Option[];
  onChange: (index: number, employeeId: string) => void;
  firstFieldRef: React.RefObject<HTMLDivElement | null>;
}) {
  const selectedIds = value.filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {value.map((employeeId, index) => {
        const availableOptions = options.filter((option) => option.id === employeeId || !selectedIds.includes(option.id));
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
  const [items, setItems] = useState<PenugasanEmployee[]>([]);
  const [periodeItems, setPeriodeItems] = useState<PeriodeSkp[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [selectedPangkat, setSelectedPangkat] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [hasLoadedPeriods, setHasLoadedPeriods] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadPeriods = async () => {
      setErrorMessage('');

      try {
        const data = await getPeriodeSkpList();
        if (ignore) return;

        const currentYear = new Date().getFullYear();
        const defaultPeriod = data.find((periode) => periode.tahun === currentYear) ?? data[0];

        setPeriodeItems(data);
        setSelectedPeriodeId(defaultPeriod ? String(defaultPeriod.id) : '');
      } catch (error: any) {
        if (!ignore) setErrorMessage(error.response?.data?.message || 'Gagal mengambil data periode SKP.');
      } finally {
        if (!ignore) setHasLoadedPeriods(true);
      }
    };

    loadPeriods();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedPeriods) return;

    let ignore = false;

    const loadEmployees = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getPenugasanEmployees(selectedPeriodeId ? { idPeriodeSkp: selectedPeriodeId } : undefined);
        if (!ignore) setItems(data);
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
  }, [hasLoadedPeriods, selectedPeriodeId]);

  const pangkatOptions = useMemo(
    () => Array.from(new Set(items.map((employee) => employee.pangkat).filter((pangkat) => pangkat && pangkat !== '-'))).sort(),
    [items],
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((employee) => {
      const matchesSearch = !query || [employee.nama, employee.nip, employee.role, employee.fungsional].join(' ').toLowerCase().includes(query);
      const matchesPangkat = !selectedPangkat || employee.pangkat === selectedPangkat;

      return matchesSearch && matchesPangkat;
    });
  }, [items, search, selectedPangkat]);
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [currentPage, filteredEmployees, pageSize]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div>
            <CardTitle>Penugasan Butir</CardTitle>
            <CardDescription className="mt-1">Pilih pegawai lalu tetapkan butir kegiatan dan periode SKP.</CardDescription>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
              <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
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
                aria-label="Filter periode penugasan butir"
                value={selectedPeriodeId}
                onChange={(event) => {
                  setSelectedPeriodeId(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
              >
                {periodeItems.length === 0 ? (
                  <option value="">Semua periode</option>
                ) : (
                  periodeItems.map((periode) => (
                    <option key={periode.id} value={String(periode.id)}>
                      {formatPeriodeLabel(periode)}
                    </option>
                  ))
                )}
              </select>
              <select
                aria-label="Filter pangkat penugasan butir"
                value={selectedPangkat}
                onChange={(event) => {
                  setSelectedPangkat(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
              >
                <option value="">Semua pangkat</option>
                {pangkatOptions.map((pangkat) => (
                  <option key={pangkat} value={pangkat}>
                    {pangkat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{errorMessage}</p>}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <div className="min-w-[1120px]">
            <div className="grid bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700" style={{ gridTemplateColumns: 'minmax(220px, 1.35fr) minmax(110px, 0.65fr) minmax(170px, 1fr) minmax(140px, 0.75fr) minmax(100px, 0.55fr) 140px 220px' }}>
              <div className="pl-2">Nama / NIP</div>
              <div>Role</div>
              <div>Fungsional</div>
              <div>Pangkat</div>
              <div>Golongan</div>
              <div className="text-center">Jumlah Penugasan</div>
              <div className="text-center">Aksi</div>
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="px-6 py-10 text-center text-sm text-gray-500">Memuat data pegawai...</div>
              ) : paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <div key={employee.id} className="grid items-center px-6 py-4 text-sm" style={{ gridTemplateColumns: 'minmax(220px, 1.35fr) minmax(110px, 0.65fr) minmax(170px, 1fr) minmax(140px, 0.75fr) minmax(100px, 0.55fr) 140px 220px' }}>
                    <div className="min-w-0 pl-2">
                      <p className="truncate font-semibold text-gray-900">{employee.nama}</p>
                      <p className="truncate text-xs text-gray-500">NIP {employee.nip}</p>
                    </div>
                    <div>{employee.role}</div>
                    <div>{employee.fungsional}</div>
                    <div>{employee.pangkat}</div>
                    <div>{employee.golongan}</div>
                    <div className="text-center font-semibold text-gray-900">{employee.assignmentCount ?? 0}</div>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => navigate(`/admin/penugasan/master-butir/ubah/${employee.id}`)}>
                        Ubah
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => navigate(`/admin/penugasan/master-butir/terapkan-ke/${employee.id}`)}>
                        Tetapkan
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-sm text-gray-500">Data pegawai tidak ditemukan.</div>
              )}
            </div>
          </div>
          <PenugasanPagination
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
  const navigate = useNavigate();
  const pegawaiRef = useRef<HTMLDivElement>(null);
  const namaKegiatanRef = useRef<HTMLDivElement>(null);
  const [employeeItems, setEmployeeItems] = useState<PenugasanEmployee[]>([]);
  const [historyItems, setHistoryItems] = useState<PenugasanTambahan[]>([]);
  const [detailItem, setDetailItem] = useState<PenugasanTambahan | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);
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
  const [errorMessage, setErrorMessage] = useState('');
  const [historyMessage, setHistoryMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFormData = async () => {
    setIsLoading(true);
    setIsHistoryLoading(true);
    setErrorMessage('');
    setHistoryMessage('');

    try {
      const employeesData = await getPenugasanEmployees();
      setEmployeeItems(employeesData);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil data pegawai.');
    } finally {
      setIsLoading(false);
    }

    try {
      const historyData = await getPenugasanTambahanList();
      setHistoryItems(historyData);
    } catch (error: any) {
      setHistoryItems([]);
      setHistoryMessage('Belum ada data penugasan tambahan yang dapat ditampilkan.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  const dynamicEmployeeOptions = useMemo(
    () => employeeItems.map((employee) => ({ id: employee.id, label: `${employee.nama} - NIP ${employee.nip}` })),
    [employeeItems],
  );

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
  const historyTotalPages = Math.max(1, Math.ceil(historyItems.length / historyPageSize));
  const historyCurrentPage = Math.min(historyPage, historyTotalPages);
  const paginatedAssignmentHistory = useMemo(() => {
    const start = (historyCurrentPage - 1) * historyPageSize;
    return historyItems.slice(start, start + historyPageSize);
  }, [historyCurrentPage, historyItems, historyPageSize]);

  const handleSubmit = async () => {
    if (!assignedEmployeeIds[0]) {
      setError('Nama pegawai wajib dipilih.');
      focusFormField(pegawaiRef);
      return;
    }
    if (!form.namaKegiatan.trim()) {
      setError('Nama kegiatan wajib diisi.');
      focusFormField(namaKegiatanRef);
      return;
    }

    const tanggalMulai = form.tanggalMode === 'deadline' ? form.tanggalMulai : form.tanggalKegiatan;
    const tanggalSelesai = form.tanggalMode === 'deadline' ? form.tanggalSelesai : form.tanggalKegiatan;

    setIsSubmitting(true);
    setError('');
      setHistoryMessage('');

    try {
      await createPenugasanTambahan({
        assignedEmployeeIds: assignedEmployeeIds.filter(Boolean),
        namaKegiatan: form.namaKegiatan,
        deskripsiKegiatan: form.deskripsiKegiatan,
        tanggalMulai,
        tanggalSelesai,
      });
      setAssignedEmployeeIds(['']);
      setForm({
        namaKegiatan: '',
        deskripsiKegiatan: '',
        tanggalMode: 'deadline',
        tanggalMulai: '',
        tanggalSelesai: '',
        tanggalKegiatan: '',
        suratTugas: '',
      });
      setHistoryPage(1);
      await loadFormData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal menyimpan penugasan tambahan.');
    } finally {
      setIsSubmitting(false);
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
          {errorMessage && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{errorMessage}</p>}
          <AssignmentEmployeeFields value={assignedEmployeeIds} options={dynamicEmployeeOptions} onChange={updateAssignedEmployee} firstFieldRef={pegawaiRef} />

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
            <Button className="admin-proceed-button" disabled={!isFormValid || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Penugasan Tambahan'}
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
              {isHistoryLoading ? (
                <div className="px-6 py-10 text-center text-sm text-gray-500">Memuat data penugasan tambahan...</div>
              ) : paginatedAssignmentHistory.length > 0 ? (
                paginatedAssignmentHistory.map((item) => (
                  <div key={item.id} className="grid items-start px-6 py-4 text-sm" style={{ gridTemplateColumns: 'minmax(220px, 1.35fr) minmax(120px, 0.7fr) minmax(130px, 0.75fr) minmax(100px, 0.6fr) minmax(150px, 0.9fr) minmax(170px, 0.8fr)' }}>
                    {(() => {
                      const dates = getAdditionalAssignmentDates(item);
                      return (
                        <>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{item.namaKegiatan}</p>
                            <p className="mt-1 text-xs font-normal leading-relaxed text-gray-500">{item.deskripsiKegiatan || '-'}</p>
                          </div>
                          <div className="text-center text-gray-700">{dates.deadline}</div>
                          <div className="text-center text-gray-700">{dates.tanggalKegiatan}</div>
                          <div className="text-center text-gray-700">{item.assignedEmployees.length} pegawai</div>
                          <div className="min-w-0">
                            <p className="truncate text-gray-500">Tidak ada surat</p>
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
                        </>
                      );
                    })()}
                    </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-sm text-gray-500">
                  {historyMessage || 'Belum ada data penugasan tambahan.'}
                </div>
              )}
            </div>
            <PenugasanPagination
              currentPage={historyCurrentPage}
              totalPages={historyTotalPages}
              totalItems={historyItems.length}
              pageSize={historyPageSize}
              onPageChange={setHistoryPage}
              onPageSizeChange={setHistoryPageSize}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(detailItem)} onOpenChange={(open: boolean) => !open && setDetailItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Penugasan Tambahan</DialogTitle>
            <DialogDescription>Ringkasan data penugasan dan pegawai yang ditugaskan.</DialogDescription>
          </DialogHeader>
          {detailItem &&
            (() => {
              const dates = getAdditionalAssignmentDates(detailItem);
              return (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">{detailItem.namaKegiatan}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{detailItem.deskripsiKegiatan || '-'}</p>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">Deadline</p>
                      <p className="mt-1 text-gray-900">{dates.deadline}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">Tanggal Kegiatan</p>
                      <p className="mt-1 text-gray-900">{dates.tanggalKegiatan}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                      <p className="mt-1 text-gray-900">{detailItem.status}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">Surat Tugas</p>
                      <p className="mt-1 text-gray-900">Tidak ada surat</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Pegawai Ditugaskan</p>
                    <div className="mt-2 space-y-2">
                      {detailItem.assignedEmployees.map((employee, index) => (
                        <div key={employee.id} className="rounded-md border bg-white px-3 py-2 text-sm text-gray-900">
                          {index + 1}. {employee.nama} <span className="text-xs text-gray-500">NIP {employee.nip || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
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
  const pegawaiRef = useRef<HTMLDivElement>(null);
  const namaKegiatanRef = useRef<HTMLDivElement>(null);
  const [employeeItems, setEmployeeItems] = useState<PenugasanEmployee[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dynamicEmployeeOptions = useMemo(
    () => employeeItems.map((employee) => ({ id: employee.id, label: `${employee.nama} - NIP ${employee.nip}` })),
    [employeeItems],
  );

  useEffect(() => {
    let ignore = false;

    const loadFormData = async () => {
      if (!penugasanId) {
        setError('ID penugasan tambahan tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [employeesData, assignmentData] = await Promise.all([
          getPenugasanEmployees(),
          getPenugasanTambahan(penugasanId),
        ]);

        if (ignore) return;

        const assignedIds = assignmentData.assignedEmployees.map((employee) => employee.id);
        const nextAssignedIds = assignedIds.length < maxAssignmentEmployees ? [...assignedIds, ''] : assignedIds;
        const useTanggalKegiatan = Boolean(assignmentData.tanggalMulai && assignmentData.tanggalMulai === assignmentData.tanggalSelesai);

        setEmployeeItems(employeesData);
        setAssignedEmployeeIds(nextAssignedIds.length > 0 ? nextAssignedIds : ['']);
        setForm({
          namaKegiatan: assignmentData.namaKegiatan,
          deskripsiKegiatan: assignmentData.deskripsiKegiatan,
          tanggalMode: useTanggalKegiatan ? 'kegiatan' : 'deadline',
          tanggalMulai: useTanggalKegiatan ? '' : assignmentData.tanggalMulai,
          tanggalSelesai: useTanggalKegiatan ? '' : assignmentData.tanggalSelesai,
          tanggalKegiatan: useTanggalKegiatan ? assignmentData.tanggalMulai : '',
          suratTugas: assignmentData.suratTugas,
        });
      } catch (error: any) {
        if (!ignore) setError(error.response?.data?.message || 'Gagal mengambil data penugasan tambahan.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadFormData();

    return () => {
      ignore = true;
    };
  }, [penugasanId]);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const updateAssignedEmployee = (index: number, employeeId: string) => {
    setAssignedEmployeeIds((current) => updateEmployeeSlots(current, index, employeeId));
    setError('');
  };

  const isFormValid =
    Boolean(assignedEmployeeIds[0]) &&
    Boolean(form.namaKegiatan.trim()) &&
    (form.tanggalMode === 'deadline' ? Boolean(form.tanggalMulai && form.tanggalSelesai) : Boolean(form.tanggalKegiatan));

  const handleSubmit = async () => {
    if (!assignedEmployeeIds[0]) {
      setError('Nama pegawai wajib dipilih.');
      focusFormField(pegawaiRef);
      return;
    }
    if (!form.namaKegiatan.trim()) {
      setError('Nama kegiatan wajib diisi.');
      focusFormField(namaKegiatanRef);
      return;
    }

    if (!penugasanId) {
      setError('ID penugasan tambahan tidak ditemukan.');
      return;
    }

    const tanggalMulai = form.tanggalMode === 'deadline' ? form.tanggalMulai : form.tanggalKegiatan;
    const tanggalSelesai = form.tanggalMode === 'deadline' ? form.tanggalSelesai : form.tanggalKegiatan;

    setIsSubmitting(true);
    setError('');

    try {
      await updatePenugasanTambahan(penugasanId, {
        assignedEmployeeIds: assignedEmployeeIds.filter(Boolean),
        namaKegiatan: form.namaKegiatan,
        deskripsiKegiatan: form.deskripsiKegiatan,
        tanggalMulai,
        tanggalSelesai,
      });
      navigate('/admin/penugasan', { state: { tab: 'tambahan' } });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal memperbarui penugasan tambahan.');
    } finally {
      setIsSubmitting(false);
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
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Form Edit Penugasan Tambahan</CardTitle>
          <CardDescription>Perbarui pegawai, jadwal, dan ringkasan penugasan tambahan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">Memuat data penugasan tambahan...</p>}
          <AssignmentEmployeeFields value={assignedEmployeeIds} options={dynamicEmployeeOptions} onChange={updateAssignedEmployee} firstFieldRef={pegawaiRef} />
          <div ref={namaKegiatanRef} className="space-y-2">
            <Label htmlFor="edit-nama-kegiatan">Nama Kegiatan<RequiredStar /></Label>
            <Input id="edit-nama-kegiatan" value={form.namaKegiatan} onChange={(event) => updateForm('namaKegiatan', event.target.value)} className="bg-white" style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-deskripsi-kegiatan">Deskripsi Kegiatan</Label>
            <Textarea id="edit-deskripsi-kegiatan" value={form.deskripsiKegiatan} onChange={(event) => updateForm('deskripsiKegiatan', event.target.value)} rows={4} className="resize-none bg-white" style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
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
                <Label htmlFor="edit-tanggal-mulai">Tanggal Mulai<RequiredStar /></Label>
                <DateInput id="edit-tanggal-mulai" value={form.tanggalMulai} onChange={(value) => updateForm('tanggalMulai', value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tanggal-selesai">Tanggal Selesai<RequiredStar /></Label>
                <DateInput id="edit-tanggal-selesai" value={form.tanggalSelesai} onChange={(value) => updateForm('tanggalSelesai', value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="edit-tanggal-kegiatan">Tanggal Kegiatan<RequiredStar /></Label>
              <DateInput id="edit-tanggal-kegiatan" value={form.tanggalKegiatan} onChange={(value) => updateForm('tanggalKegiatan', value)} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Surat Tugas</Label>
            <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 px-6 py-8 text-center opacity-80" style={{ borderColor: '#d1d5db' }}>
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                <FileText className="size-5 text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{form.suratTugas || 'Tidak ada surat'}</p>
              <p className="mt-1 text-xs text-gray-500">Upload file belum diaktifkan pada mode edit.</p>
            </div>
          </div>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button variant="outline" onClick={() => navigate('/admin/penugasan', { state: { tab: 'tambahan' } })}>
              Batal
            </Button>
            <Button className="admin-proceed-button" disabled={!isFormValid || isLoading || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EditPenugasanButirView() {
  const navigate = useNavigate();
  const { pegawaiId } = useParams();
  const [employeeItems, setEmployeeItems] = useState<PenugasanEmployee[]>([]);
  const [assignmentItems, setAssignmentItems] = useState<PenugasanButir[]>([]);
  const [editingItem, setEditingItem] = useState<PenugasanButir | null>(null);
  const [deletingItem, setDeletingItem] = useState<PenugasanButir | null>(null);
  const [editForm, setEditForm] = useState({ deskripsi: '', uraian: '' });
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const selectedEmployee = employeeItems.find((employee) => employee.id === pegawaiId);

  useEffect(() => {
    let ignore = false;

    const loadFormData = async () => {
      if (!pegawaiId) {
        setError('ID pegawai tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [employeesData, assignmentsData] = await Promise.all([
          getPenugasanEmployees(),
          getPenugasanButirByPegawai(pegawaiId),
        ]);

        if (!ignore) {
          setEmployeeItems(employeesData);
          setAssignmentItems(assignmentsData);
        }
      } catch (error: any) {
        if (!ignore) setError(error.response?.data?.message || 'Gagal mengambil data penugasan butir.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadFormData();

    return () => {
      ignore = true;
    };
  }, [pegawaiId]);

  const openEditDialog = (item: PenugasanButir) => {
    setEditingItem(item);
    setEditForm({ deskripsi: item.deskripsi, uraian: item.uraian });
    setError('');
    setStatusMessage('');
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    setIsSaving(true);
    setError('');
    setStatusMessage('');

    try {
      const updatedItem = await updatePenugasanButir(editingItem.id, editForm);
      setAssignmentItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      setEditingItem(null);
      setStatusMessage('Penugasan butir berhasil diperbarui.');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal memperbarui penugasan butir.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    setError('');
    setStatusMessage('');

    try {
      await deletePenugasanButir(deletingItem.id);
      setAssignmentItems((current) => current.filter((item) => item.id !== deletingItem.id));
      setDeletingItem(null);
      setStatusMessage('Penugasan butir berhasil dihapus.');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal menghapus penugasan butir.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" className="mb-4 h-9 px-3 text-sm" onClick={() => navigate('/admin/penugasan', { state: { tab: 'butir' } })}>
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Ubah Penugasan Butir</h1>
        <p className="mt-1 text-base text-gray-500">Kelola butir kegiatan yang sudah ditetapkan untuk pegawai terpilih.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Data Pegawai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              {isLoading ? 'Memuat data pegawai...' : selectedEmployee?.nama ?? 'Pegawai tidak ditemukan'}
            </p>
            <p className="mt-1 text-xs text-gray-500">NIP {selectedEmployee?.nip ?? '-'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar Butir Kegiatan</CardTitle>
          <CardDescription>Ubah deskripsi dan uraian, atau hapus butir kegiatan dari pegawai ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
          {statusMessage && <p className="mb-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">{statusMessage}</p>}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <div className="min-w-[760px]">
              <div className="grid bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700" style={{ gridTemplateColumns: 'minmax(220px, 1.1fr) minmax(220px, 1fr) minmax(220px, 1fr) 160px' }}>
                <div>Butir kegiatan</div>
                <div>Deskripsi</div>
                <div>Uraian</div>
                <div className="text-center">Aksi</div>
              </div>
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="px-6 py-10 text-center text-sm text-gray-500">Memuat data penugasan butir...</div>
                ) : assignmentItems.length > 0 ? (
                  assignmentItems.map((item) => (
                    <div key={item.id} className="grid items-center gap-4 px-6 py-4 text-sm" style={{ gridTemplateColumns: 'minmax(220px, 1.1fr) minmax(220px, 1fr) minmax(220px, 1fr) 160px' }}>
                      <div className="font-semibold text-gray-900">{item.namaKegiatan || '-'}</div>
                      <div className="line-clamp-2 text-gray-600">{item.deskripsi || '-'}</div>
                      <div className="line-clamp-2 text-gray-600">{item.uraian || '-'}</div>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => openEditDialog(item)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs text-red-600 hover:text-red-700" onClick={() => setDeletingItem(item)}>
                          <Trash2 className="size-3.5" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-10 text-center text-sm text-gray-500">Belum ada butir kegiatan yang ditetapkan untuk pegawai ini.</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open: boolean) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Butir Kegiatan</DialogTitle>
            <DialogDescription>Perbarui deskripsi dan uraian untuk butir kegiatan terpilih.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-gray-50 p-3">
              <p className="text-sm font-semibold text-gray-900">{editingItem?.namaKegiatan ?? '-'}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-butir-deskripsi">Deskripsi</Label>
              <Textarea
                id="edit-butir-deskripsi"
                value={editForm.deskripsi}
                onChange={(event) => setEditForm((current) => ({ ...current, deskripsi: event.target.value }))}
                rows={5}
                className="resize-none bg-white"
                style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-butir-uraian">Uraian</Label>
              <Textarea
                id="edit-butir-uraian"
                value={editForm.uraian}
                onChange={(event) => setEditForm((current) => ({ ...current, uraian: event.target.value }))}
                rows={5}
                className="resize-none bg-white"
                style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Batal
            </Button>
            <Button className="admin-proceed-button" disabled={isSaving} onClick={handleUpdate}>
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingItem)} onOpenChange={(open: boolean) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Butir Kegiatan</DialogTitle>
            <DialogDescription>Butir kegiatan ini akan dihapus dari penugasan pegawai.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{deletingItem?.namaKegiatan ?? '-'}</p>
            <p className="mt-1 text-sm text-gray-600">{deletingItem?.deskripsi || '-'}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Batal
            </Button>
            <Button disabled={isDeleting} className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PenugasanButirFormView() {
  const navigate = useNavigate();
  const { pegawaiId } = useParams();
  const kegiatanRef = useRef<HTMLDivElement>(null);
  const periodeRef = useRef<HTMLDivElement>(null);
  const [employeeItems, setEmployeeItems] = useState<PenugasanEmployee[]>([]);
  const [butirItems, setButirItems] = useState<ButirKegiatan[]>([]);
  const [periodeItems, setPeriodeItems] = useState<PeriodeSkp[]>([]);
  const [form, setForm] = useState({ kegiatanId: '', periodeId: '', deskripsi: '', uraian: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedEmployee = employeeItems.find((employee) => employee.id === pegawaiId);
  const kegiatanOptionsFromApi = useMemo(() => toOptionList(butirItems), [butirItems]);
  const periodeOptionsFromApi = useMemo(() => toOptionList(periodeItems), [periodeItems]);

  useEffect(() => {
    let ignore = false;

    const loadFormData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [employeesData, butirData, periodeData] = await Promise.all([
          getPenugasanEmployees(),
          getButirKegiatanList(),
          getPeriodeSkpList(),
        ]);

        if (!ignore) {
          setEmployeeItems(employeesData);
          setButirItems(butirData);
          setPeriodeItems(periodeData);
        }
      } catch (error: any) {
        if (!ignore) setError(error.response?.data?.message || 'Gagal mengambil data form penugasan.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadFormData();

    return () => {
      ignore = true;
    };
  }, []);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.kegiatanId) {
      setError('Kegiatan wajib dipilih.');
      focusFormField(kegiatanRef);
      return;
    }
    if (!form.periodeId) {
      setError('Periode wajib dipilih.');
      focusFormField(periodeRef);
      return;
    }

    if (!selectedEmployee) {
      setError('Data pegawai tidak ditemukan.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createPenugasanButir({
        idPengguna: selectedEmployee.id,
        idButirKegiatan: form.kegiatanId,
        idPeriodeSkp: form.periodeId,
        deskripsi: form.deskripsi,
        uraian: form.uraian,
      });
      navigate('/admin/penugasan', { state: { tab: 'butir' } });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal menyimpan penugasan butir.');
    } finally {
      setIsSubmitting(false);
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
          {isLoading && <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">Memuat data form penugasan...</p>}
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{selectedEmployee?.nama ?? 'Pegawai tidak ditemukan'}</p>
            <p className="text-xs text-gray-500">NIP {selectedEmployee?.nip ?? '-'}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div ref={kegiatanRef} className="space-y-2">
              <Label htmlFor="kegiatan">Kegiatan<RequiredStar /></Label>
              <SearchableSelect label="Kegiatan" options={kegiatanOptionsFromApi} value={form.kegiatanId} onChange={(value) => updateForm('kegiatanId', value)} />
            </div>
            <div ref={periodeRef} className="space-y-2">
              <Label htmlFor="periode">Periode<RequiredStar /></Label>
              <SearchableSelect label="Periode" options={periodeOptionsFromApi} value={form.periodeId} onChange={(value) => updateForm('periodeId', value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea id="deskripsi" value={form.deskripsi} onChange={(event) => updateForm('deskripsi', event.target.value)} placeholder="Masukkan deskripsi penugasan butir kegiatan" rows={5} className="resize-none bg-white" style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uraian">Uraian</Label>
            <Textarea id="uraian" value={form.uraian} onChange={(event) => updateForm('uraian', event.target.value)} placeholder="Masukkan uraian tugas atau target yang akan dikerjakan" rows={5} className="resize-none bg-white" style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }} />
          </div>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-2 flex justify-end gap-3 border-t pt-6">
            <Button variant="outline" onClick={() => navigate('/admin/penugasan')}>Batal</Button>
            <Button className="admin-proceed-button" disabled={!form.kegiatanId || !form.periodeId || !selectedEmployee || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Penugasan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
