import { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  createJabatan,
  getJabatanList,
  updateJabatan,
  type Jabatan,
  type JabatanPayload,
} from '../../api/jabatanApi';
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

function formatNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '-';
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, '');
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function getAdaptivePages(currentPage: number, totalPages: number) {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage === 1) return [1, 2, 3, totalPages];
  if (currentPage >= totalPages - 1) {
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [currentPage - 1, currentPage, currentPage + 1, totalPages];
}

export function MasterJabatanView() {
  const [items, setItems] = useState<Jabatan[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Jabatan | null>(null);
  const [form, setForm] = useState({
    name: '',
    coefficientPerYear: '',
    promotionCreditTarget: '',
  });

  const loadJabatan = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      setItems(await getJabatanList());
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil data jabatan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJabatan();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [
        item.name,
        formatNumber(item.coefficientPerYear),
        formatNumber(item.promotionCreditTarget),
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const visiblePages = getAdaptivePages(currentPage, totalPages);
  const startItem = filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredItems.length);

  const openAddForm = () => {
    setEditingItem(null);
    setForm({ name: '', coefficientPerYear: '', promotionCreditTarget: '' });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: Jabatan) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      coefficientPerYear: item.coefficientPerYear === null ? '' : String(item.coefficientPerYear),
      promotionCreditTarget:
        item.promotionCreditTarget === null ? '' : String(item.promotionCreditTarget),
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const coefficientPerYear = parseOptionalNumber(form.coefficientPerYear);
    const promotionCreditTarget = parseOptionalNumber(form.promotionCreditTarget);

    if (!name) {
      setFormError('Nama jabatan wajib diisi.');
      return;
    }
    if (
      Number.isNaN(coefficientPerYear)
      || (coefficientPerYear !== null && coefficientPerYear < 0)
    ) {
      setFormError('Koefisien per tahun harus berupa angka 0 atau lebih.');
      return;
    }
    if (
      Number.isNaN(promotionCreditTarget)
      || (promotionCreditTarget !== null && promotionCreditTarget < 0)
    ) {
      setFormError('Target angka kredit harus berupa angka 0 atau lebih.');
      return;
    }

    const duplicate = items.some(
      (item) =>
        item.id !== editingItem?.id
        && item.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      setFormError('Nama jabatan sudah ada.');
      return;
    }

    const payload: JabatanPayload = {
      name,
      coefficientPerYear,
      promotionCreditTarget,
    };

    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingItem) {
        await updateJabatan(editingItem.id, payload);
      } else {
        await createJabatan(payload);
        setPage(1);
      }
      await loadJabatan();
      setIsFormOpen(false);
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Gagal menyimpan jabatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Master Jabatan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola nama jabatan, koefisien tahunan, dan target angka kredit kenaikan jabatan.
          </p>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Daftar Jabatan</CardTitle>
            <CardDescription className="mt-1">
              Mengubah, menambah dan melihat semua jabatan yang ada di karisma.
            </CardDescription>
          </div>
          <Button className="shrink-0" onClick={openAddForm}>
            <Plus className="size-4" />
            Tambah Jabatan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex h-10 max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
            <Search className="size-4 shrink-0 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama atau angka kredit..."
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Nama Jabatan</TableHead>
                    <TableHead className="px-6 text-center">Koefisien/Tahun</TableHead>
                    <TableHead className="px-6 text-center">Target Angka Kredit</TableHead>
                    <TableHead className="px-6 text-center">Jumlah Pegawai</TableHead>
                    <TableHead className="px-6 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                        Memuat data jabatan...
                      </TableCell>
                    </TableRow>
                  ) : paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-6">
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </TableCell>
                        <TableCell className="px-6 text-center">
                          {formatNumber(item.coefficientPerYear)}
                        </TableCell>
                        <TableCell className="px-6 text-center font-medium">
                          {formatNumber(item.promotionCreditTarget)}
                        </TableCell>
                        <TableCell className="px-6 text-center">{item.employeeCount}</TableCell>
                        <TableCell className="px-6 text-center">
                          <Button variant="outline" size="sm" onClick={() => openEditForm(item)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                        Tidak ada data jabatan yang sesuai.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredItems.length > 0 && (
              <div className="flex flex-col gap-2 border-t px-4 py-2 md:flex-row md:items-center md:justify-between">
                <p className="text-xs text-muted-foreground">
                  Menampilkan {startItem}-{endItem} dari {filteredItems.length} data
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-8 items-center gap-2 rounded-lg border bg-card px-2">
                    <span className="text-xs text-muted-foreground">Tampilkan</span>
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                      className="text-xs font-medium outline-none"
                    >
                      {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Sebelumnya
                  </Button>
                  {visiblePages.map((visiblePage, index) => (
                    <div key={visiblePage} className="flex items-center gap-2">
                      {index > 0 && visiblePage - visiblePages[index - 1] > 1 && (
                        <span className="text-xs text-muted-foreground">...</span>
                      )}
                      <Button
                        size="sm"
                        className="h-8 min-w-8 px-2"
                        variant={visiblePage === currentPage ? 'default' : 'outline'}
                        onClick={() => setPage(visiblePage)}
                      >
                        {visiblePage}
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open: boolean) => {
          if (!isSubmitting) setIsFormOpen(open);
        }}
      >
        <DialogContent style={{ maxWidth: '560px' }}>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Jabatan' : 'Tambah Jabatan'}</DialogTitle>
            <DialogDescription>
              Angka dapat dikosongkan jika data resmi belum tersedia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jabatan-name">Nama Jabatan <span className="text-red-500">*</span></Label>
              <Input
                id="jabatan-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Contoh: Pustakawan Ahli Utama"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jabatan-coefficient">Koefisien per Tahun</Label>
                <Input
                  id="jabatan-coefficient"
                  type="number"
                  min="0"
                  step="0.001"
                  value={form.coefficientPerYear}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, coefficientPerYear: event.target.value }))
                  }
                  placeholder="Contoh: 25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan-target">Target Angka Kredit</Label>
                <Input
                  id="jabatan-target"
                  type="number"
                  min="0"
                  step="0.001"
                  value={form.promotionCreditTarget}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, promotionCreditTarget: event.target.value }))
                  }
                  placeholder="Contoh: 200"
                />
              </div>
            </div>
            {formError && (
              <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" disabled={isSubmitting} onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Jabatan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
