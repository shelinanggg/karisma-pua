import { useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
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

type MasterButir = {
  id: number;
  name: string;
  activeParticipants: number;
};

const pageSizeOptions = [5, 10, 20];

const initialButirData: MasterButir[] = [
  { id: 1, name: 'Penyusunan rancangan program kerja unit', activeParticipants: 18 },
  { id: 2, name: 'Pelaksanaan koordinasi kegiatan akademik', activeParticipants: 27 },
  { id: 3, name: 'Evaluasi capaian indikator kinerja', activeParticipants: 14 },
  { id: 4, name: 'Pengelolaan dokumen administrasi kepegawaian', activeParticipants: 33 },
  { id: 5, name: 'Pendampingan pelaporan kegiatan fakultas', activeParticipants: 21 },
  { id: 6, name: 'Monitoring realisasi target kinerja pegawai', activeParticipants: 42 },
  { id: 7, name: 'Validasi bukti dukung kegiatan SKP', activeParticipants: 25 },
  { id: 8, name: 'Penyusunan laporan berkala bidang administrasi', activeParticipants: 16 },
  { id: 9, name: 'Pengarsipan dokumen layanan akademik', activeParticipants: 19 },
  { id: 10, name: 'Koordinasi layanan informasi internal', activeParticipants: 12 },
  { id: 11, name: 'Rekapitulasi data kegiatan operasional', activeParticipants: 31 },
  { id: 12, name: 'Pemutakhiran data pendukung penilaian kinerja', activeParticipants: 22 },
  { id: 13, name: 'Penyusunan instrumen monitoring layanan', activeParticipants: 17 },
  { id: 14, name: 'Pengelolaan agenda rapat koordinasi', activeParticipants: 28 },
  { id: 15, name: 'Pengumpulan data evaluasi program kerja', activeParticipants: 24 },
  { id: 16, name: 'Verifikasi kelengkapan laporan kegiatan', activeParticipants: 20 },
  { id: 17, name: 'Pendataan kebutuhan pengembangan kompetensi', activeParticipants: 15 },
  { id: 18, name: 'Penyusunan bahan paparan pimpinan', activeParticipants: 11 },
  { id: 19, name: 'Pemantauan tindak lanjut hasil evaluasi', activeParticipants: 26 },
  { id: 20, name: 'Pengelolaan rekap absensi kegiatan unit', activeParticipants: 36 },
  { id: 21, name: 'Koordinasi penyelesaian dokumen layanan', activeParticipants: 29 },
  { id: 22, name: 'Validasi data pendukung laporan tahunan', activeParticipants: 23 },
];

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

export function AdminMasterButirView() {
  const [items, setItems] = useState<MasterButir[]>(initialButirData);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterButir | null>(null);
  const [deletingItem, setDeletingItem] = useState<MasterButir | null>(null);
  const [formName, setFormName] = useState('');

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
    setIsFormOpen(true);
  };

  const openEditForm = (item: MasterButir) => {
    setEditingItem(item);
    setFormName(item.name);
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    const trimmedName = formName.trim();
    if (!trimmedName) return;

    if (editingItem) {
      setItems((prev) => prev.map((item) => (item.id === editingItem.id ? { ...item, name: trimmedName } : item)));
    } else {
      const nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
      setItems((prev) => [{ id: nextId, name: trimmedName, activeParticipants: 0 }, ...prev]);
      setPage(1);
    }

    setIsFormOpen(false);
    setEditingItem(null);
    setFormName('');
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    setItems((prev) => prev.filter((item) => item.id !== deletingItem.id));
    setDeletingItem(null);
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
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6 font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.activeParticipants}</TableCell>
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
            <Label htmlFor="master-butir-name">Nama Butir Kegiatan</Label>
            <Input
              id="master-butir-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Masukkan nama butir kegiatan"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={!formName.trim()}>
              Simpan
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
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
