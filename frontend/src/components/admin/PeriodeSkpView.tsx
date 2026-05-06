import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Edit, Plus, Search, Trash2 } from 'lucide-react';
import {
  createPeriodeSkp,
  deletePeriodeSkp,
  getPeriodeSkpList,
  updatePeriodeSkp,
  type PeriodeSkp,
} from '../../api/periodeSkpApi';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const pageSizeOptions = [5, 10, 20];

function RequiredStar() {
  return <span className="admin-required-star">*</span>;
}

function openDatePicker(inputId: string) {
  const input = document.getElementById(inputId) as (HTMLInputElement & { showPicker?: () => void }) | null;
  if (!input) return;

  input.focus();
  try {
    input.showPicker?.();
  } catch {
    // Keep native focus behavior available on browsers that block showPicker.
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function getDefaultYear() {
  return new Date().getFullYear().toString();
}

function getDefaultStartDate(year = getDefaultYear()) {
  return `${year}-01-01`;
}

function getDefaultEndDate(year = getDefaultYear()) {
  return `${year}-12-30`;
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
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
      <p className="text-xs text-muted-foreground">
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
          <span className="text-xs text-muted-foreground">Tampilkan</span>
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
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40"
        >
          Sebelumnya
        </button>
        {visiblePages.map((page, idx) => (
          <div key={page} className="flex items-center gap-2">
            {idx > 0 && page - visiblePages[idx - 1] > 1 && (
              <span className="px-1 text-xs text-muted-foreground">...</span>
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
          </div>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

export function PeriodeSkpView() {
  const [items, setItems] = useState<PeriodeSkp[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PeriodeSkp | null>(null);
  const [deletingItem, setDeletingItem] = useState<PeriodeSkp | null>(null);
  const [tahun, setTahun] = useState(getDefaultYear());
  const [tanggalMulai, setTanggalMulai] = useState(getDefaultStartDate());
  const [tanggalSelesai, setTanggalSelesai] = useState(getDefaultEndDate());
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const loadPeriode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getPeriodeSkpList();
      setItems(data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil data periode SKP.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeriode();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [
        item.tahun.toString(),
        formatDate(item.tanggalMulai),
        formatDate(item.tanggalSelesai),
        `${item.tanggalMulai} ${item.tanggalSelesai}`,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [currentPage, filteredItems, pageSize]);

  const openAddForm = () => {
    const defaultYear = getDefaultYear();
    setEditingItem(null);
    setTahun(defaultYear);
    setTanggalMulai(getDefaultStartDate(defaultYear));
    setTanggalSelesai(getDefaultEndDate(defaultYear));
    setFormErrorMessage('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: PeriodeSkp) => {
    setEditingItem(item);
    setTahun(item.tahun.toString());
    setTanggalMulai(item.tanggalMulai);
    setTanggalSelesai(item.tanggalSelesai);
    setFormErrorMessage('');
    setIsFormOpen(true);
  };

  const handleYearChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setTahun(numericValue);
    setFormErrorMessage('');

    if (numericValue.length === 4) {
      setTanggalMulai(`${numericValue}-01-01`);
      setTanggalSelesai(`${numericValue}-12-30`);
    }
  };

  const handleSubmit = async () => {
    if (!tahun || tahun.length !== 4 || !tanggalMulai || !tanggalSelesai || tanggalMulai > tanggalSelesai) return;

    const tahunValue = Number(tahun);
    const duplicateYear = items.find((item) => item.tahun === tahunValue && item.id !== editingItem?.id);
    if (duplicateYear) {
      setFormErrorMessage('Tahun periode SKP sudah ada.');
      return;
    }

    const payload = { tahun: tahunValue, tanggalMulai, tanggalSelesai };
    setIsSubmitting(true);
    setErrorMessage('');
    setFormErrorMessage('');

    try {
      if (editingItem) {
        await updatePeriodeSkp(editingItem.id, payload);
      } else {
        await createPeriodeSkp(payload);
        setPage(1);
      }

      await loadPeriode();
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      setFormErrorMessage(error.response?.data?.message || 'Gagal menyimpan periode SKP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deletePeriodeSkp(deletingItem.id);
      await loadPeriode();
      setDeletingItem(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal menghapus periode SKP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateRangeInvalid = Boolean(tanggalMulai && tanggalSelesai && tanggalMulai > tanggalSelesai);
  const isYearInvalid = Boolean(tahun && tahun.length !== 4);
  const isYearDuplicate = Boolean(tahun.length === 4 && items.some((item) => item.tahun === Number(tahun) && item.id !== editingItem?.id));
  const dateInputStyle = {
    height: '2.75rem',
    paddingRight: '2.75rem',
    borderColor: '#9ca3af',
    boxShadow: 'inset 0 0 0 1px #d1d5db',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Master Periode</h1>
        <p className="mt-1 text-base text-gray-500">
          Kelola periode SKP yang dipakai saat admin menetapkan butir kegiatan.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Daftar Periode SKP</CardTitle>
              <CardDescription className="mt-1">
                Periode bawaan memakai tanggal 1 Januari sampai 30 Desember.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 sm:w-80">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Cari tahun atau tanggal..."
                  className="h-9 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <Button onClick={openAddForm} className="h-10 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Tambah Periode
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '1.5rem' }}>
          {errorMessage && (
            <p className="mb-4 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{errorMessage}</p>
          )}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Tahun</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead className="text-center">Penugasan</TableHead>
                  <TableHead className="px-6" style={{ width: '10rem', textAlign: 'center' }}>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                      Memuat data periode...
                    </TableCell>
                  </TableRow>
                ) : paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6 font-medium">{item.tahun}</TableCell>
                      <TableCell>{formatDate(item.tanggalMulai)}</TableCell>
                      <TableCell>{formatDate(item.tanggalSelesai)}</TableCell>
                      <TableCell className="text-center text-gray-700">{item.assignmentCount} penugasan</TableCell>
                      <TableCell className="px-6" style={{ width: '10rem' }}>
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => openEditForm(item)}>
                            <Edit className="size-3.5" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setDeletingItem(item)}>
                            <Trash2 className="size-3.5" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                      Data periode tidak ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredItems.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Periode' : 'Tambah Periode'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Ubah tanggal mulai dan tanggal selesai periode SKP.' : 'Tambahkan periode SKP baru.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="periode-skp-tahun">Tahun<RequiredStar /></Label>
              <Input
                id="periode-skp-tahun"
                inputMode="numeric"
                value={tahun}
                onChange={(event) => handleYearChange(event.target.value)}
                placeholder="2026"
                className="bg-white"
                style={{
                  height: '2.75rem',
                  borderColor: '#9ca3af',
                  boxShadow: 'inset 0 0 0 1px #d1d5db',
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periode-skp-mulai">Tanggal Mulai<RequiredStar /></Label>
              <div className="relative cursor-pointer" onClick={() => openDatePicker('periode-skp-mulai')}>
                <Input
                  id="periode-skp-mulai"
                  type="date"
                  value={tanggalMulai}
                  onChange={(event) => setTanggalMulai(event.target.value)}
                  className="admin-date-input master-period-date-input cursor-pointer bg-white"
                  style={dateInputStyle}
                />
                <CalendarDays className="master-period-date-icon" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="periode-skp-selesai">Tanggal Selesai<RequiredStar /></Label>
              <div className="relative cursor-pointer" onClick={() => openDatePicker('periode-skp-selesai')}>
                <Input
                  id="periode-skp-selesai"
                  type="date"
                  value={tanggalSelesai}
                  onChange={(event) => setTanggalSelesai(event.target.value)}
                  className="admin-date-input master-period-date-input cursor-pointer bg-white"
                  style={dateInputStyle}
                />
                <CalendarDays className="master-period-date-icon" />
              </div>
            </div>
          </div>
          {isYearInvalid && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
              Tahun harus berisi 4 digit.
            </p>
          )}
          {isYearDuplicate && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
              Tahun periode SKP sudah ada.
            </p>
          )}
          {isDateRangeInvalid && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
              Tanggal selesai tidak boleh lebih awal dari tanggal mulai.
            </p>
          )}
          {formErrorMessage && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
              {formErrorMessage}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button
              className="admin-proceed-button"
              onClick={handleSubmit}
              disabled={isSubmitting || !tahun || tahun.length !== 4 || !tanggalMulai || !tanggalSelesai || isDateRangeInvalid || isYearDuplicate}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingItem)} onOpenChange={(open: boolean) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Periode</DialogTitle>
            <DialogDescription>
              Periode ini akan dihapus dari daftar master periode.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 p-3 text-sm font-medium text-foreground">
            {deletingItem ? `${formatDate(deletingItem.tanggalMulai)} - ${formatDate(deletingItem.tanggalSelesai)}` : ''}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
