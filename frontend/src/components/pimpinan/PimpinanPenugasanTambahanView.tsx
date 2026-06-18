import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Check, ChevronsUpDown, Eye, Pencil, Search, X } from 'lucide-react';

import {
  createPimpinanPenugasanTambahan,
  getPimpinanPenugasanEmployees,
  getPimpinanPenugasanTambahanList,
  updatePimpinanPenugasanTambahan,
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
import { DocumentLinkButton } from '../ui/document-link-button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { cn } from '../ui/utils';

const pageSizeOptions = [5, 10, 20];
const maxAssignmentEmployees = 20;
type Option = { id: string; label: string };

type FormData = {
  namaKegiatan: string;
  deskripsiKegiatan: string;
  tanggalMode: 'deadline' | 'kegiatan';
  tanggalMulai: string;
  tanggalSelesai: string;
  tanggalKegiatan: string;
  linkSurat: string;
  assignedEmployeeIds: string[];
};

const initialFormData: FormData = {
  namaKegiatan: '',
  deskripsiKegiatan: '',
  tanggalMode: 'deadline',
  tanggalMulai: '',
  tanggalSelesai: '',
  tanggalKegiatan: '',
  linkSurat: '',
  assignedEmployeeIds: [''],
};

function RequiredStar() {
  return <span className="admin-required-star">*</span>;
}

function formatTanggal(iso: string): string {
  if (!iso) return '-';
  const [year, month, day] = iso.slice(0, 10).split('-');
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${monthNames[Number(month)] ?? month} ${year}`;
}

function getAssignmentDates(item: PenugasanTambahan) {
  const isSingleDate = Boolean(item.tanggalMulai && item.tanggalMulai === item.tanggalSelesai);
  return {
    deadline: isSingleDate ? '-' : `${formatTanggal(item.tanggalMulai)} - ${formatTanggal(item.tanggalSelesai)}`,
    tanggalKegiatan: isSingleDate ? formatTanggal(item.tanggalMulai) : '-',
  };
}

function openDatePicker(input: HTMLInputElement) {
  try {
    input.showPicker?.();
  } catch {
    input.focus();
  }
}

function DateInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClick={(event) => openDatePicker(event.currentTarget)}
        className="admin-date-input bg-white"
        style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.5rem' }}
      />
      <Calendar className="text-gray-400" style={{ position: 'absolute', right: '0.875rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, index) => index + 1);
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
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <p className="text-xs text-gray-500">
        Menampilkan {start}-{end} dari {totalItems} data
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
            {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition disabled:opacity-40"
        >
          Sebelumnya
        </button>
        {visiblePages.map((visiblePage, index) => (
          <span key={visiblePage} className="flex items-center gap-2">
            {index > 0 && visiblePage - visiblePages[index - 1] > 1 && <span className="px-1 text-xs text-gray-500">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(visiblePage)}
              className="rounded-lg border py-1 text-xs font-medium transition"
              style={{
                minWidth: '2rem',
                paddingLeft: '0.1rem',
                paddingRight: '0.1rem',
                ...(visiblePage === currentPage
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' }
                  : { background: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }),
              }}
            >
              {visiblePage}
            </button>
          </span>
        ))}
        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
        <div className="mt-1 overflow-hidden rounded-md border border-gray-300 bg-white shadow-md">
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
            {filteredOptions.length > 0 ? filteredOptions.map((option) => (
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
            )) : (
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
  return compacted.length < maxAssignmentEmployees ? [...compacted, ''] : compacted;
}

function AssignmentEmployeeFields({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: Option[];
  onChange: (index: number, employeeId: string) => void;
}) {
  const selectedIds = value.filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {value.map((employeeId, index) => {
        const availableOptions = options.filter((option) => option.id === employeeId || !selectedIds.includes(option.id));
        return (
          <div key={index} className="space-y-2">
            <Label>
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

export function PimpinanPenugasanTambahanView() {
  const formCardRef = useRef<HTMLDivElement>(null);
  const [penugasanList, setPenugasanList] = useState<PenugasanTambahan[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<PenugasanEmployee[]>([]);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<PenugasanTambahan | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const dynamicEmployeeOptions = useMemo(
    () => employeeOptions.map((employee) => ({ id: employee.id, label: `${employee.nama} - NIP ${employee.nip}` })),
    [employeeOptions],
  );

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [penugasanData, employeeData] = await Promise.all([
        getPimpinanPenugasanTambahanList(),
        getPimpinanPenugasanEmployees(),
      ]);
      setPenugasanList(penugasanData);
      setEmployeeOptions(employeeData);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Gagal memuat data penugasan tambahan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrorMessage('');
  };

  const updateAssignedEmployee = (index: number, employeeId: string) => {
    setForm((current) => ({
      ...current,
      assignedEmployeeIds: updateEmployeeSlots(current.assignedEmployeeIds, index, employeeId),
    }));
    setErrorMessage('');
  };

  const resetForm = () => {
    setForm(initialFormData);
    setEditingId(null);
    setErrorMessage('');
  };

  const handleEdit = (item: PenugasanTambahan) => {
    const singleDate = Boolean(item.tanggalMulai && item.tanggalMulai === item.tanggalSelesai);
    setEditingId(item.id);
    setForm({
      namaKegiatan: item.namaKegiatan,
      deskripsiKegiatan: item.deskripsiKegiatan,
      tanggalMode: singleDate ? 'kegiatan' : 'deadline',
      tanggalMulai: singleDate ? '' : item.tanggalMulai,
      tanggalSelesai: singleDate ? '' : item.tanggalSelesai,
      tanggalKegiatan: singleDate ? item.tanggalMulai : '',
      linkSurat: item.linkSurat,
      assignedEmployeeIds: (() => {
        const ids = item.assignedEmployees.map((employee) => employee.id);
        return ids.length < maxAssignmentEmployees ? [...ids, ''] : ids;
      })(),
    });
    setErrorMessage('');
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async () => {
    if (!form.assignedEmployeeIds[0]) {
      setErrorMessage('Pilih minimal satu pegawai untuk ditugaskan.');
      return;
    }
    if (!form.namaKegiatan.trim()) {
      setErrorMessage('Nama kegiatan wajib diisi.');
      return;
    }

    const tanggalMulai = form.tanggalMode === 'deadline' ? form.tanggalMulai : form.tanggalKegiatan;
    const tanggalSelesai = form.tanggalMode === 'deadline' ? form.tanggalSelesai : form.tanggalKegiatan;
    if (!tanggalMulai || !tanggalSelesai) {
      setErrorMessage('Tanggal penugasan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const payload = {
        assignedEmployeeIds: form.assignedEmployeeIds.filter(Boolean),
        namaKegiatan: form.namaKegiatan.trim(),
        deskripsiKegiatan: form.deskripsiKegiatan,
        tanggalMulai,
        tanggalSelesai,
        linkSurat: form.linkSurat,
      };

      if (editingId) {
        await updatePimpinanPenugasanTambahan(editingId, payload);
        setSuccessMessage('Penugasan tambahan berhasil diperbarui.');
      } else {
        await createPimpinanPenugasanTambahan(payload);
        setSuccessMessage('Penugasan tambahan berhasil disimpan.');
      }

      resetForm();
      setPage(1);
      await loadData();
      window.setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Gagal menyimpan penugasan tambahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return penugasanList;
    return penugasanList.filter((item) =>
      [item.namaKegiatan, item.deskripsiKegiatan, item.status, ...item.assignedEmployees.map((employee) => employee.nama)]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [penugasanList, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div ref={formCardRef}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>{editingId ? 'Edit Penugasan Tambahan' : 'Penugasan Tambahan'}</CardTitle>
            <CardDescription>
              Tetapkan penugasan tambahan kepada pegawai beserta jadwal dan link surat tugas pendukung.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AssignmentEmployeeFields
              value={form.assignedEmployeeIds}
              options={dynamicEmployeeOptions}
              onChange={updateAssignedEmployee}
            />

            <div className="space-y-2">
              <Label htmlFor="pimpinan-nama-kegiatan">
                Nama Kegiatan
                <RequiredStar />
              </Label>
              <Input
                id="pimpinan-nama-kegiatan"
                value={form.namaKegiatan}
                onChange={(event) => updateForm('namaKegiatan', event.target.value)}
                placeholder="Masukkan nama kegiatan penugasan tambahan"
                className="bg-white"
                style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pimpinan-deskripsi-kegiatan">Deskripsi Kegiatan</Label>
              <Textarea
                id="pimpinan-deskripsi-kegiatan"
                value={form.deskripsiKegiatan}
                onChange={(event) => updateForm('deskripsiKegiatan', event.target.value)}
                placeholder="Tuliskan deskripsi singkat kegiatan penugasan tambahan."
                rows={4}
                className="resize-none bg-white"
                style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Jenis Tanggal
                <RequiredStar />
              </Label>
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                {[
                  { id: 'deadline' as const, label: 'Deadline' },
                  { id: 'kegiatan' as const, label: 'Tanggal Kegiatan' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateForm('tanggalMode', option.id)}
                    className="rounded-md px-4 py-2 text-sm font-medium transition"
                    style={form.tanggalMode === option.id
                      ? { background: '#ffffff', color: '#111827', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)' }
                      : { color: '#6b7280' }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {form.tanggalMode === 'deadline' ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pimpinan-tanggal-mulai">Tanggal Mulai<RequiredStar /></Label>
                  <DateInput id="pimpinan-tanggal-mulai" value={form.tanggalMulai} onChange={(value) => updateForm('tanggalMulai', value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pimpinan-tanggal-selesai">Tanggal Selesai<RequiredStar /></Label>
                  <DateInput id="pimpinan-tanggal-selesai" value={form.tanggalSelesai} onChange={(value) => updateForm('tanggalSelesai', value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="pimpinan-tanggal-kegiatan">Tanggal Kegiatan<RequiredStar /></Label>
                <DateInput id="pimpinan-tanggal-kegiatan" value={form.tanggalKegiatan} onChange={(value) => updateForm('tanggalKegiatan', value)} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pimpinan-link-surat">Link Drive Surat Tugas</Label>
              <Input
                id="pimpinan-link-surat"
                type="url"
                value={form.linkSurat}
                onChange={(event) => updateForm('linkSurat', event.target.value)}
                placeholder="https://drive.google.com/..."
                className="h-11 border-gray-300 bg-white"
              />
            </div>

            {errorMessage && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{errorMessage}</p>}
            {successMessage && <p className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">{successMessage}</p>}

            <div className="flex justify-end gap-3 border-t pt-6">
              <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
                {editingId ? 'Batal Edit' : 'Batal'}
              </Button>
              <Button
                className="admin-proceed-button"
                disabled={!form.assignedEmployeeIds[0] || !form.namaKegiatan.trim() || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Penugasan Tambahan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <div>
              <CardTitle>History Penugasan Tambahan</CardTitle>
              <CardDescription className="mt-1">Daftar penugasan tambahan yang pernah dicatat untuk pegawai.</CardDescription>
            </div>
            <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
              <Search className="size-4 shrink-0 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari kegiatan atau pegawai..."
                className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left font-semibold text-gray-700">
                    <th className="w-[25%] px-6 py-3">Nama Kegiatan</th>
                    <th className="w-[17%] px-6 py-3 text-center">Deadline</th>
                    <th className="w-[15%] px-6 py-3 text-center">Tanggal Kegiatan</th>
                    <th className="w-[13%] px-6 py-3 text-center">Jumlah Pegawai</th>
                    <th className="w-[12%] px-6 py-3 text-center">Surat Tugas</th>
                    <th className="w-[18%] px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Memuat data penugasan tambahan...</td></tr>
                  ) : paginatedItems.length > 0 ? paginatedItems.map((item) => {
                    const dates = getAssignmentDates(item);
                    return (
                      <tr key={item.id} className="align-top">
                        <td className="px-6 py-4 pr-8">
                          <p className="font-medium text-gray-900">{item.namaKegiatan}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{item.deskripsiKegiatan || '-'}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">{dates.deadline}</td>
                        <td className="px-6 py-4 text-center text-gray-700">{dates.tanggalKegiatan}</td>
                        <td className="px-6 py-4 text-center text-gray-700">{item.assignedEmployees.length} pegawai</td>
                        <td className="px-6 py-4 text-center">
                          <DocumentLinkButton href={item.linkSurat} title="Buka Link Drive Surat Tugas" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setDetailItem(item)}>
                              <Eye className="size-3.5" />
                              Detail
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => handleEdit(item)}>
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Belum ada data penugasan tambahan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredItems.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(detailItem)} onOpenChange={(open) => !open && setDetailItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Penugasan Tambahan</DialogTitle>
            <DialogDescription>Ringkasan data penugasan dan pegawai yang ditugaskan.</DialogDescription>
          </DialogHeader>
          {detailItem && (() => {
            const dates = getAssignmentDates(detailItem);
            return (
              <div className="space-y-4">
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">{detailItem.namaKegiatan}</p>
                  <p className="mt-1 text-sm text-gray-600">{detailItem.deskripsiKegiatan || '-'}</p>
                </div>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div><p className="text-xs font-medium uppercase text-gray-500">Deadline</p><p className="mt-1">{dates.deadline}</p></div>
                  <div><p className="text-xs font-medium uppercase text-gray-500">Tanggal Kegiatan</p><p className="mt-1">{dates.tanggalKegiatan}</p></div>
                  <div><p className="text-xs font-medium uppercase text-gray-500">Status</p><p className="mt-1 capitalize">{detailItem.status}</p></div>
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Surat Tugas</p>
                    <DocumentLinkButton href={detailItem.linkSurat} title="Buka Link Drive Surat Tugas" label="Buka link" className="mt-1" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Pegawai Ditugaskan</p>
                  <div className="mt-2 space-y-2">
                    {detailItem.assignedEmployees.map((employee, index) => (
                      <div key={employee.id} className="rounded-md border bg-white px-3 py-2 text-sm">
                        {index + 1}. {employee.nama} <span className="text-xs text-gray-500">NIP {employee.nip || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailItem(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
