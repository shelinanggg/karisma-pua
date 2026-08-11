import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Pencil, Search, Trash2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getPegawaiList,
  type Pegawai,
} from '../../api/pegawaiApi';
import {
  deletePimpinanRealisasiKegiatan,
  getApprovalRealisasiByEmployee,
  getPimpinanKinerjaByPegawai,
  updatePimpinanRealisasiKegiatan,
  type ApprovalRealisasiItem,
  type MyPenugasanButir,
} from '../../api/penugasanApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { DocumentLinkButton } from '../ui/document-link-button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

type RouteState = {
  employee?: Pegawai | null;
  assignment?: MyPenugasanButir | null;
} | null;

type RealisasiStatus = ApprovalRealisasiItem['status'];

function formatTanggal(iso: string): string {
  if (!iso) return '-';
  const [year, month, day] = iso.slice(0, 10).split('-');
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${monthNames[Number(month)] ?? month} ${year}`;
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

function openDatePicker(input: HTMLInputElement) {
  try {
    input.showPicker?.();
  } catch {
    input.focus();
  }
}

function StatusBadge({ status }: { status: RealisasiStatus }) {
  const styleMap: Record<RealisasiStatus, { backgroundColor: string; color: string; label: string }> = {
    diajukan: { backgroundColor: '#fef3c7', color: '#92400e', label: 'Diajukan' },
    disetujui: { backgroundColor: '#dcfce7', color: '#166534', label: 'Disetujui' },
  };

  return (
    <span
      className="inline-flex w-24 items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: styleMap[status].backgroundColor, color: styleMap[status].color }}
    >
      {styleMap[status].label}
    </span>
  );
}

export function PimpinanRealisasiKegiatanPegawaiView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pegawaiId, kegiatanId } = useParams();
  const routeState = (location.state as RouteState) ?? null;

  const [employee, setEmployee] = useState<Pegawai | null>(routeState?.employee ?? null);
  const [assignment, setAssignment] = useState<MyPenugasanButir | null>(routeState?.assignment ?? null);
  const [history, setHistory] = useState<ApprovalRealisasiItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingItem, setEditingItem] = useState<ApprovalRealisasiItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ApprovalRealisasiItem | null>(null);
  const [editForm, setEditForm] = useState({
    tanggal: '',
    jumlah: '',
    keterangan: '',
    linkDokumenPendukung: '',
  });
  const [editError, setEditError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!pegawaiId || !kegiatanId) {
      setErrorMessage('Parameter halaman tidak valid.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const [employeeData, assignmentData, historyData] = await Promise.all([
        employee ? Promise.resolve(null) : getPegawaiList(),
        assignment ? Promise.resolve(null) : getPimpinanKinerjaByPegawai(pegawaiId),
        getApprovalRealisasiByEmployee(pegawaiId),
      ]);

      if (employeeData) {
        setEmployee(employeeData.find((item) => String(item.id) === pegawaiId) ?? null);
      }

      if (assignmentData) {
        setAssignment(assignmentData.find((item) => item.id === kegiatanId) ?? null);
      }

      setHistory(historyData.filter((item) => item.idPenggunaKegiatan === kegiatanId));
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil riwayat realisasi kegiatan pegawai.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pegawaiId, kegiatanId]);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return history;

    return history.filter((item) =>
      [
        item.tanggalRealisasi,
        item.realisasiTarget,
        item.keterangan,
        item.status === 'disetujui' ? 'Disetujui' : 'Diajukan',
        item.linkDokumenPendukung,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [history, search]);

  const target = toNumber(assignment?.targetKetercapaian);
  const totalRealisasi = history.reduce((total, item) => total + toNumber(item.realisasiTarget), 0);

  const openEditDialog = (item: ApprovalRealisasiItem) => {
    setEditingItem(item);
    setEditForm({
      tanggal: item.tanggalRealisasi,
      jumlah: item.realisasiTarget,
      keterangan: item.keterangan,
      linkDokumenPendukung: item.linkDokumenPendukung,
    });
    setEditError('');
  };

  const updateEditForm = (key: keyof typeof editForm, value: string) => {
    setEditForm((current) => ({ ...current, [key]: value }));
    setEditError('');
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    if (!editForm.tanggal) {
      setEditError('Tanggal realisasi wajib diisi.');
      return;
    }
    if (!editForm.jumlah || Number(editForm.jumlah) <= 0) {
      setEditError('Jumlah realisasi wajib diisi lebih dari 0.');
      return;
    }
    if (!editForm.keterangan.trim()) {
      setEditError('Keterangan realisasi wajib diisi.');
      return;
    }

    try {
      setIsSaving(true);
      await updatePimpinanRealisasiKegiatan(editingItem.id, {
        tanggalRealisasi: editForm.tanggal,
        realisasiTarget: editForm.jumlah,
        keterangan: editForm.keterangan,
        linkDokumenPendukung: editForm.linkDokumenPendukung,
      });
      await loadData();
      setEditingItem(null);
    } catch (error: any) {
      setEditError(error.response?.data?.message || 'Gagal memperbarui realisasi kegiatan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      setIsDeleting(true);
      setDeleteError('');
      await deletePimpinanRealisasiKegiatan(deletingItem.id);
      await loadData();
      setDeletingItem(null);
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || 'Gagal menghapus realisasi kegiatan.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/pimpinan/data-kepegawaian/${pegawaiId}/kegiatan`)}
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Riwayat Realisasi Kegiatan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Riwayat realisasi pegawai untuk satu butir kegiatan.
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{assignment?.namaKegiatan || (isLoading ? 'Memuat kegiatan...' : 'Kegiatan tidak ditemukan')}</CardTitle>
          <CardDescription>
            {employee?.nama || 'Pegawai'} - NIP {employee?.nip || '-'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            ['Target', target > 0 ? formatNumber(target) : '-'],
            ['Total Realisasi', formatNumber(totalRealisasi)],
            ['Jumlah Riwayat', String(history.length)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>History Realisasi</CardTitle>
            <CardDescription className="mt-1">
              Pimpinan dapat mengubah atau menghapus realisasi meskipun statusnya sudah disetujui.
            </CardDescription>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari riwayat..."
              className="h-10 border-gray-200 bg-white pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left font-semibold text-gray-700">
                    <th className="w-[14%] px-6 py-3">Tanggal</th>
                    <th className="w-[12%] px-6 py-3 text-center">Realisasi</th>
                    <th className="w-[12%] px-6 py-3 text-center">Status</th>
                    <th className="w-[28%] px-6 py-3">Keterangan</th>
                    <th className="w-[16%] px-6 py-3 text-center">Dokumen</th>
                    <th className="w-[18%] px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        Memuat riwayat realisasi...
                      </td>
                    </tr>
                  ) : filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className="align-top hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-gray-700">{formatTanggal(item.tanggalRealisasi)}</td>
                        <td className="px-6 py-4 text-center font-medium text-gray-800">{formatNumber(toNumber(item.realisasiTarget))}</td>
                        <td className="px-6 py-4 text-center"><StatusBadge status={item.status} /></td>
                        <td className="px-6 py-4 text-gray-700">{item.keterangan || '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <DocumentLinkButton href={item.linkDokumenPendukung} title="Buka dokumen pendukung" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => openEditDialog(item)}>
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                              onClick={() => {
                                setDeletingItem(item);
                                setDeleteError('');
                              }}
                            >
                              <Trash2 className="size-3.5" />
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        {search.trim() ? 'Riwayat realisasi tidak ditemukan.' : 'Belum ada riwayat realisasi untuk kegiatan ini.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open: boolean) => !open && !isSaving && setEditingItem(null)}>
        <DialogContent style={{ maxWidth: '560px' }}>
          <DialogHeader>
            <DialogTitle>Edit Realisasi Kegiatan</DialogTitle>
            <DialogDescription>Perbarui data realisasi kegiatan pegawai.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pimpinan-edit-tanggal-realisasi">Tanggal Realisasi</Label>
                <div
                  className="relative cursor-pointer"
                  onClick={(event) => {
                    const input = event.currentTarget.querySelector('input');
                    if (input) openDatePicker(input);
                  }}
                >
                  <Input
                    id="pimpinan-edit-tanggal-realisasi"
                    type="date"
                    value={editForm.tanggal}
                    onChange={(event) => updateEditForm('tanggal', event.target.value)}
                    onClick={(event) => {
                      event.stopPropagation();
                      openDatePicker(event.currentTarget);
                    }}
                    className="admin-date-input cursor-pointer bg-white"
                    style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb', paddingRight: '2.5rem' }}
                  />
                  <Calendar className="text-gray-400" style={{ position: 'absolute', right: '0.875rem', top: '50%', height: '1rem', width: '1rem', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pimpinan-edit-jumlah-realisasi">Jumlah Realisasi</Label>
                <Input
                  id="pimpinan-edit-jumlah-realisasi"
                  type="number"
                  min={1}
                  value={editForm.jumlah}
                  onChange={(event) => updateEditForm('jumlah', event.target.value)}
                  className="bg-white"
                  style={{ height: '2.75rem', borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pimpinan-edit-keterangan-realisasi">Keterangan Realisasi</Label>
              <Textarea
                id="pimpinan-edit-keterangan-realisasi"
                value={editForm.keterangan}
                onChange={(event) => updateEditForm('keterangan', event.target.value)}
                rows={4}
                className="resize-none border-gray-300 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pimpinan-edit-link-dokumen">Link Drive Dokumen Pendukung</Label>
              <Input
                id="pimpinan-edit-link-dokumen"
                type="url"
                value={editForm.linkDokumenPendukung}
                onChange={(event) => updateEditForm('linkDokumenPendukung', event.target.value)}
                className="h-11 border-gray-300 bg-white"
              />
            </div>
            {editError && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingItem)} onOpenChange={(open: boolean) => !open && !isDeleting && setDeletingItem(null)}>
        <DialogContent style={{ maxWidth: '480px' }}>
          <DialogHeader>
            <DialogTitle>Hapus Realisasi Kegiatan</DialogTitle>
            <DialogDescription>Realisasi ini akan dihapus dari riwayat kegiatan pegawai.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{assignment?.namaKegiatan ?? '-'}</p>
            <p className="mt-1 text-xs text-gray-500">{deletingItem ? formatTanggal(deletingItem.tanggalRealisasi) : '-'}</p>
            <p className="mt-2 text-sm text-gray-600">{deletingItem?.keterangan || '-'}</p>
          </div>
          {deleteError && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)} disabled={isDeleting}>
              Batal
            </Button>
            <Button
              disabled={isDeleting}
              className="border font-semibold"
              style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
              onClick={handleDelete}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PimpinanRealisasiKegiatanPegawaiView;
