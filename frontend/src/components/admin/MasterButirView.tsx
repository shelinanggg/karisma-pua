import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import {
  createButirKegiatan,
  deleteButirKegiatan,
  getButirKegiatanList,
  updateButirKegiatan,
  type ButirKegiatan,
} from '../../api/butirKegiatanApi';
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

function RequiredStar() {
  return <span className="admin-required-star">*</span>;
}

function focusMasterButirName() {
  const element = document.getElementById('master-butir-name') as HTMLInputElement | null;
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => element.focus(), 250);
}

const pageSizeOptions = [5, 10, 20];

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
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
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

export function MasterButirView() {
  const [items, setItems] = useState<ButirKegiatan[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ButirKegiatan | null>(null);
  const [deletingItem, setDeletingItem] = useState<ButirKegiatan | null>(null);
  const [formName, setFormName] = useState('');

  const loadButir = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getButirKegiatanList();
      setItems(data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil data butir kegiatan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadButir();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [currentPage, filteredItems, pageSize]);

  const openAddForm = () => {
    setEditingItem(null);
    setFormName('');
    setFormErrorMessage('');
    setIsFormOpen(true);
  };

  const openEditForm = (item: ButirKegiatan) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormErrorMessage('');
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    const trimmedName = formName.trim();
    if (!trimmedName) {
      setFormErrorMessage('Nama butir kegiatan wajib diisi.');
      focusMasterButirName();
      return;
    }

    const normalizedName = trimmedName.toLowerCase();
    const duplicateItem = items.find(
      (item) =>
        item.name.trim().toLowerCase() === normalizedName &&
        item.id !== editingItem?.id,
    );

    if (duplicateItem) {
      setFormErrorMessage('Nama butir kegiatan sudah ada.');
      focusMasterButirName();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setFormErrorMessage('');

    try {
      if (editingItem) {
        await updateButirKegiatan(editingItem.id, { name: trimmedName });
      } else {
        await createButirKegiatan({ name: trimmedName });
        setPage(1);
      }

      await loadButir();
      setIsFormOpen(false);
      setEditingItem(null);
      setFormName('');
    } catch (error: any) {
      setFormErrorMessage(error.response?.data?.message || 'Gagal menyimpan butir kegiatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await deleteButirKegiatan(deletingItem.id);
      await loadButir();
      setDeletingItem(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal menghapus butir kegiatan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Master Butir</h1>
        <p className="mt-1 text-base text-gray-500">
          Kelola daftar butir kegiatan yang dapat digunakan dalam penyusunan target dan realisasi kinerja.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Daftar Butir Kegiatan</CardTitle>
              <CardDescription className="mt-1">
                Pantau nama butir kegiatan dan jumlah partisipan aktif.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 sm:w-80">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Cari nama butir kegiatan..."
                  className="h-9 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <Button onClick={openAddForm} className="h-10 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Tambah Butir Kegiatan
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
                  <TableHead className="w-[60%] px-6">Nama Butir Kegiatan</TableHead>
                  <TableHead className="text-center">Partisipan Aktif</TableHead>
                  <TableHead className="px-6" style={{ width: '10rem', textAlign: 'center' }}>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-gray-500">
                      Memuat data butir kegiatan...
                    </TableCell>
                  </TableRow>
                ) : paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6 font-medium">{item.name}</TableCell>
                      <TableCell className="text-center text-gray-700">{item.activeParticipants} partisipan</TableCell>
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
                    <TableCell colSpan={3} className="py-8 text-center text-gray-500">
                      Data butir kegiatan tidak ditemukan.
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
            <DialogTitle>{editingItem ? 'Edit Butir Kegiatan' : 'Tambah Butir Kegiatan'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Perbarui nama butir kegiatan.' : 'Tambahkan nama butir kegiatan baru.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="master-butir-name">Nama Butir Kegiatan<RequiredStar /></Label>
            <Input
              id="master-butir-name"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                setFormErrorMessage('');
              }}
              placeholder="Masukkan nama butir kegiatan"
            />
          </div>
          {formErrorMessage && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{formErrorMessage}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button className="admin-proceed-button" onClick={handleSubmit} disabled={isSubmitting || !formName.trim()}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingItem)} onOpenChange={(open: boolean) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Butir Kegiatan</DialogTitle>
            <DialogDescription>
              Butir kegiatan ini akan dihapus dari daftar master.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 p-3 text-sm font-medium text-foreground">
            {deletingItem?.name}
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
