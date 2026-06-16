import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import {
  PenugasanButir,
  approvePegawaiKegiatan,
  getPendingApprovalKegiatan,
  updatePimpinanPenugasanButir,
} from '../../api/penugasanApi';

interface PendingKegiatanByEmployee {
  idPengguna: string;
  nama: string;
  nip: string;
  pendingCount: number;
  kegiatan: PenugasanButir[];
}

type DetailRouteState = { employee?: PendingKegiatanByEmployee } | null;

const pageSizeOptions = [5, 10, 20];

function formatTarget(value: string | number | null | undefined) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(parsed)) return String(value || '-');
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(2).replace(/\.?0+$/, '');
}

function normalizeTarget(value: string | number | null | undefined) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(parsed)) return '';
  return String(parsed);
}

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage === 1) return [1, 2, 3, totalPages];
  if (currentPage >= totalPages - 1) return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return Array.from(
    new Set([currentPage - 1, currentPage, currentPage + 1, totalPages].filter((page) => page >= 1 && page <= totalPages)),
  ).sort((a, b) => a - b);
}

function ApprovalPagination({
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
    <div className="flex flex-col items-start gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
            className="bg-transparent text-xs font-medium outline-none"
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
            {idx > 0 && page - visiblePages[idx - 1] > 1 && <span className="px-1 text-xs text-gray-500">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-8 rounded-lg border px-2 py-1 text-xs font-medium transition ${
                page === currentPage
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
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

export function PimpinanApprovalKegiatanView() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<PendingKegiatanByEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<PendingKegiatanByEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    loadPendingKegiatan();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    setFilteredEmployees(
      employees.filter((employee) =>
        query === '' || employee.nama.toLowerCase().includes(query) || employee.nip.includes(query),
      ),
    );
  }, [search, employees]);

  const loadPendingKegiatan = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getPendingApprovalKegiatan();
      setEmployees(data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil kegiatan yang menunggu persetujuan.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDetail = (employee: PendingKegiatanByEmployee) => {
    navigate(`/pimpinan/approval-pegawai/pengajuan/${employee.idPengguna}`, { state: { employee } });
  };

  const totalPending = employees.reduce((sum, employee) => sum + employee.pendingCount, 0);
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEmployees = useMemo(
    () => filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredEmployees, pageSize],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Memuat kegiatan yang menunggu persetujuan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Pengajuan Kegiatan</h1>
        <p className="mt-1 text-sm text-gray-500">Review dan terima target ketercapaian yang diajukan pegawai.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 sm:max-w-xs">
          <Search className="size-4 shrink-0 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Cari nama atau NIP..."
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div
          className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg border px-3 text-xs font-semibold"
          style={
            totalPending > 0
              ? { backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' }
              : { backgroundColor: '#dcfce7', borderColor: '#22c55e', color: '#166534' }
          }
        >
          {totalPending > 0 ? `${totalPending} menunggu` : 'Tidak ada pengajuan'}
        </div>
      </div>

      {errorMessage && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="px-6 py-3">Pegawai</th>
                <th className="px-6 py-3">Kegiatan Diajukan</th>
                <th className="px-6 py-3 text-center">Jumlah Pengajuan</th>
                <th className="px-6 py-3 text-center">Target Diajukan</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => {
                  const firstKegiatan = employee.kegiatan[0];
                  return (
                    <tr key={employee.idPengguna} className="align-top">
                      <td className="px-6 py-4 pr-8">
                        <div className="font-medium text-gray-900">{employee.nama}</div>
                        <div className="text-xs text-gray-500">NIP {employee.nip || '-'}</div>
                      </td>

                      <td className="px-6 py-4 pr-8">
                        <div className="font-medium text-gray-900">{firstKegiatan?.namaKegiatan || '-'}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {firstKegiatan?.uraian || firstKegiatan?.deskripsi || '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center font-semibold text-gray-800">
                        {employee.pendingCount} kegiatan
                      </td>

                      <td className="px-6 py-4 text-center text-gray-700">
                        {firstKegiatan?.targetKetercapaian || '-'}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                          Menunggu
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          onClick={() => openDetail(employee)}
                        >
                          Detail
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    {employees.length === 0 ? 'Tidak ada kegiatan yang menunggu persetujuan.' : 'Tidak ada hasil pencarian.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ApprovalPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEmployees.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

export function PimpinanApprovalKegiatanDetailView() {
  const navigate = useNavigate();
  const { pegawaiId } = useParams();
  const location = useLocation();
  const routeState = location.state as DetailRouteState;
  const [employee, setEmployee] = useState<PendingKegiatanByEmployee | null>(routeState?.employee ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingId, setProcessingId] = useState('');
  const [approvingItem, setApprovingItem] = useState<PenugasanButir | null>(null);
  const [editingItem, setEditingItem] = useState<PenugasanButir | null>(null);
  const [targetDraft, setTargetDraft] = useState('');
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetError, setTargetError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const loadDetail = async () => {
    if (!pegawaiId) {
      setErrorMessage('ID pegawai tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getPendingApprovalKegiatan();
      const nextEmployee = data.find((item) => item.idPengguna === pegawaiId) ?? null;

      setEmployee((current) => {
        if (nextEmployee) return nextEmployee;
        if (!current) return null;
        return { ...current, pendingCount: 0, kegiatan: [] };
      });
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil detail pengajuan kegiatan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!pegawaiId) {
        if (!ignore) {
          setErrorMessage('ID pegawai tidak ditemukan.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getPendingApprovalKegiatan();
        const nextEmployee = data.find((item) => item.idPengguna === pegawaiId) ?? null;

        if (!ignore) {
          setEmployee((current) => {
            if (nextEmployee) return nextEmployee;
            if (!current) return null;
            return { ...current, pendingCount: 0, kegiatan: [] };
          });
        }
      } catch (error: any) {
        if (!ignore) setErrorMessage(error.response?.data?.message || 'Gagal mengambil detail pengajuan kegiatan.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [pegawaiId]);

  const items = employee?.kegiatan ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const backToList = () => {
    navigate('/pimpinan/approval-pegawai', { state: { tab: 'pengajuan' } });
  };

  const openEditTarget = (item: PenugasanButir) => {
    setEditingItem(item);
    setTargetDraft(formatTarget(item.targetKetercapaian));
    setTargetError('');
  };

  const handleApprove = async () => {
    if (!approvingItem) return;

    setProcessingId(approvingItem.id);
    setErrorMessage('');

    try {
      await approvePegawaiKegiatan(approvingItem.id);
      setEmployee((current) => {
        if (!current) return current;
        const kegiatan = current.kegiatan.filter((kegiatanItem) => kegiatanItem.id !== approvingItem.id);
        return { ...current, kegiatan, pendingCount: kegiatan.length };
      });
      setApprovingItem(null);
      await loadDetail();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal menerima kegiatan.');
    } finally {
      setProcessingId('');
    }
  };

  const handleSaveTarget = async () => {
    if (!editingItem) return;

    const nextTarget = normalizeTarget(targetDraft);
    if (!nextTarget || nextTarget === normalizeTarget(editingItem.targetKetercapaian)) return;

    setIsSavingTarget(true);
    setTargetError('');

    try {
      await updatePimpinanPenugasanButir(editingItem.id, {
        uraian: editingItem.uraian,
        deskripsi: editingItem.deskripsi,
        targetKetercapaian: nextTarget,
      });

      setEmployee((current) => {
        if (!current) return current;
        const kegiatan = current.kegiatan.filter((item) => item.id !== editingItem.id);
        return {
          ...current,
          kegiatan,
          pendingCount: kegiatan.length,
        };
      });
      setEditingItem(null);
      setTargetDraft('');
      await loadDetail();
    } catch (error: any) {
      setTargetError(error.response?.data?.message || 'Gagal menyimpan perubahan target.');
    } finally {
      setIsSavingTarget(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" className="mb-4 h-9 px-3 text-sm" onClick={backToList}>
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Detail Pengajuan Kegiatan</h1>
        <p className="mt-1 text-base text-gray-500">Tinjau target ketercapaian yang diajukan pegawai terpilih.</p>
      </div>

      <div className="rounded-lg border bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">
          {employee?.nama ?? (isLoading ? 'Memuat data pegawai...' : 'Pegawai terpilih')}
        </p>
        <p className="mt-1 text-xs text-gray-500">NIP {employee?.nip ?? '-'}</p>
        <p className="mt-2 text-xs font-medium text-gray-600">{employee?.pendingCount ?? 0} pengajuan menunggu</p>
      </div>

      {errorMessage && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="px-6 py-3">Butir Kegiatan</th>
                <th className="px-6 py-3">Uraian</th>
                <th className="px-6 py-3">Deskripsi</th>
                <th className="px-6 py-3 text-center">Target Diajukan</th>
                <th className="w-[220px] px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Memuat detail pengajuan kegiatan...
                  </td>
                </tr>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-6 py-4 pr-8">
                      <div className="font-medium text-gray-900">{item.namaKegiatan || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.uraian || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{item.deskripsi || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-center font-semibold text-gray-800">
                      {formatTarget(item.targetKetercapaian)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={() => openEditTarget(item)}
                          disabled={processingId === item.id}
                        >
                          Ubah Target
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 min-w-20 px-3 text-xs font-semibold text-white"
                          style={{ backgroundColor: '#16a34a' }}
                          onClick={() => setApprovingItem(item)}
                          disabled={processingId === item.id}
                        >
                          {processingId === item.id ? 'Memproses...' : 'Terima'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Tidak ada pengajuan kegiatan yang menunggu persetujuan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ApprovalPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={items.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <TargetEditDialog
        item={editingItem}
        targetDraft={targetDraft}
        targetError={targetError}
        isSaving={isSavingTarget}
        onTargetChange={setTargetDraft}
        onOpenChange={(open) => {
          if (!open && !isSavingTarget) {
            setEditingItem(null);
            setTargetDraft('');
            setTargetError('');
          }
        }}
        onSave={handleSaveTarget}
      />

      <ApproveConfirmDialog
        item={approvingItem}
        isProcessing={Boolean(approvingItem && processingId === approvingItem.id)}
        onOpenChange={(open) => {
          if (!open && !processingId) setApprovingItem(null);
        }}
        onConfirm={handleApprove}
      />
    </div>
  );
}

function ApproveConfirmDialog({
  item,
  isProcessing,
  onOpenChange,
  onConfirm,
}: {
  item: PenugasanButir | null;
  isProcessing: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '480px' }}>
        <DialogHeader>
          <DialogTitle>Terima Pengajuan Kegiatan?</DialogTitle>
          <DialogDescription>
            Pengajuan target untuk {item?.namaKegiatan || 'kegiatan ini'} akan diterima.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">{item?.namaKegiatan || '-'}</p>
          <p className="mt-1 text-xs text-gray-500">Target diajukan: {formatTarget(item?.targetKetercapaian)}</p>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isProcessing ? 'Memproses...' : 'Terima'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TargetEditDialog({
  item,
  targetDraft,
  targetError,
  isSaving,
  onTargetChange,
  onOpenChange,
  onSave,
}: {
  item: PenugasanButir | null;
  targetDraft: string;
  targetError: string;
  isSaving: boolean;
  onTargetChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  const nextTarget = normalizeTarget(targetDraft);
  const currentTarget = normalizeTarget(item?.targetKetercapaian);
  const canSave = Boolean(item && nextTarget && nextTarget !== currentTarget && Number(nextTarget) > 0 && !isSaving);

  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '520px' }}>
        <DialogHeader>
          <DialogTitle>Ubah Target</DialogTitle>
          <DialogDescription>Pastikan target ketercapaian yang akan diubah sudah sesuai dengan kesepakatan dengan pegawai terkait.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{item?.namaKegiatan || '-'}</p>
            <p className="mt-1 text-xs text-gray-500">Target saat ini: {formatTarget(item?.targetKetercapaian)}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-target-pengajuan" className="text-sm font-medium text-gray-700">
              Target Ketercapaian
            </label>
            <Input
              id="edit-target-pengajuan"
              type="number"
              min={1}
              value={targetDraft}
              onChange={(event) => onTargetChange(event.target.value)}
              className="bg-white"
              style={{ borderColor: '#d1d5db', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}
            />
          </div>

          {targetError && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{targetError}</p>}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={!canSave}
            className={canSave ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500 hover:bg-gray-200'}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
