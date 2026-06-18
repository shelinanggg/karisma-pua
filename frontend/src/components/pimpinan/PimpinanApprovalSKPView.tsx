import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Search } from 'lucide-react';

import {
  approveRealisasiKegiatan,
  getApprovalRealisasiByEmployee,
  getApprovalRealisasiEmployees,
  type ApprovalRealisasiEmployee,
  type ApprovalRealisasiItem,
} from '../../api/penugasanApi';
import { Button } from '../ui/button';
import { DocumentLinkButton } from '../ui/document-link-button';
import { Input } from '../ui/input';

type ApprovalStatus = ApprovalRealisasiItem['status'];
type DetailRouteState = { employee?: ApprovalRealisasiEmployee } | null;

const pageSizeOptions = [5, 10, 20];

const statusLabelMap: Record<ApprovalStatus, string> = {
  diajukan: 'Belum Disetujui',
  disetujui: 'Disetujui',
};

const statusStyleMap: Record<
  ApprovalStatus,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  diajukan: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    color: '#92400e',
  },
  disetujui: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    color: '#166534',
  },
};

function formatTanggal(iso: string) {
  if (!iso) return '-';
  const [year, month, day] = iso.slice(0, 10).split('-');
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${monthNames[Number(month)] ?? month} ${year}`;
}

function formatNumber(value: number | string) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(parsed)) return String(value || '-');
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(2).replace(/\.?0+$/, '');
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <span
      className="inline-flex min-w-28 items-center justify-center whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm"
      style={statusStyleMap[status]}
    >
      <span className="truncate">{statusLabelMap[status]}</span>
    </span>
  );
}

function PendingApprovalCard({ count }: { count: number }) {
  const status: ApprovalStatus = count > 0 ? 'diajukan' : 'disetujui';

  return (
    <span
      className="inline-flex min-w-36 items-center justify-center whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm"
      style={statusStyleMap[status]}
    >
      {count > 0 ? `${count} belum disetujui` : 'Semua disetujui'}
    </span>
  );
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

export function PimpinanApprovalSKPView() {
  const navigate = useNavigate();
  const [approvalEmployees, setApprovalEmployees] = useState<ApprovalRealisasiEmployee[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setIsLoadingEmployees(true);
      setEmployeeError('');

      try {
        const data = await getApprovalRealisasiEmployees();
        if (!ignore) setApprovalEmployees(data);
      } catch {
        if (!ignore) setEmployeeError('Gagal mengambil data pegawai yang mengajukan realisasi SKP.');
      } finally {
        if (!ignore) setIsLoadingEmployees(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const openDetail = (employee: ApprovalRealisasiEmployee) => {
    navigate(`/pimpinan/approval-pegawai/realisasi/${employee.id}`, { state: { employee } });
  };

  const filteredApprovalEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return approvalEmployees;

    return approvalEmployees.filter((employee) =>
      [
        employee.nama,
        employee.nip,
        employee.fungsional,
        employee.pangkat,
        employee.golongan,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [approvalEmployees, search]);

  const totalPending = approvalEmployees.reduce((sum, employee) => sum + employee.pendingCount, 0);
  const totalPages = Math.max(1, Math.ceil(filteredApprovalEmployees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEmployees = filteredApprovalEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Persetujuan SKP</h1>
        <p className="mt-1 text-sm text-gray-500">Daftar pegawai yang sedang mengajukan realisasi kegiatan.</p>
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

      {employeeError && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{employeeError}</p>}

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="px-6 py-3">Pegawai</th>
                <th className="px-6 py-3">Pangkat/Golongan</th>
                <th className="px-6 py-3 text-center">Belum Disetujui</th>
                <th className="px-6 py-3 text-center">Total Realisasi</th>
                <th className="px-6 py-3 text-center">Terakhir Diajukan</th>
                <th className="w-28 px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {isLoadingEmployees ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    Memuat pengajuan realisasi SKP...
                  </td>
                </tr>
              ) : paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <tr key={employee.id} className="align-top">
                    <td className="px-6 py-4 pr-8">
                      <div className="font-medium text-gray-900">{employee.nama}</div>
                      <div className="text-xs text-gray-500">NIP {employee.nip || '-'}</div>
                      <div className="mt-0.5 text-xs text-gray-500">{employee.fungsional}</div>
                    </td>

                    <td className="px-6 py-4 pr-8 text-gray-700">
                      <div>{employee.pangkat}</div>
                      <div className="text-xs text-gray-500">{employee.golongan}</div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <PendingApprovalCard count={employee.pendingCount} />
                    </td>

                    <td className="px-6 py-4 text-center font-medium text-gray-800">
                      {formatNumber(employee.pendingRealisasiTotal)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-center text-gray-700">{formatTanggal(employee.lastTanggalRealisasi)}</td>

                    <td className="px-6 py-4 text-center">
                      <Button size="sm" onClick={() => openDetail(employee)}>
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    {approvalEmployees.length === 0 ? 'Belum ada pegawai yang mengajukan realisasi SKP.' : 'Tidak ada hasil pencarian.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ApprovalPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredApprovalEmployees.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

export function PimpinanApprovalSKPDetailView() {
  const navigate = useNavigate();
  const { pegawaiId } = useParams();
  const location = useLocation();
  const routeState = location.state as DetailRouteState;
  const [selectedEmployee, setSelectedEmployee] = useState<ApprovalRealisasiEmployee | null>(routeState?.employee ?? null);
  const [approvalItems, setApprovalItems] = useState<ApprovalRealisasiItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('diajukan');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [detailError, setDetailError] = useState('');

  const loadDetail = async () => {
    if (!pegawaiId) {
      setDetailError('ID pegawai tidak ditemukan.');
      setIsLoadingItems(false);
      return;
    }

    setIsLoadingItems(true);
    setDetailError('');

    try {
      const [items, employees] = await Promise.all([
        getApprovalRealisasiByEmployee(pegawaiId),
        getApprovalRealisasiEmployees().catch(() => [] as ApprovalRealisasiEmployee[]),
      ]);
      const employee = employees.find((item) => item.id === pegawaiId);
      setApprovalItems(items);
      if (employee) setSelectedEmployee(employee);
    } catch {
      setDetailError('Gagal mengambil detail realisasi pegawai.');
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!pegawaiId) {
        if (!ignore) {
          setDetailError('ID pegawai tidak ditemukan.');
          setIsLoadingItems(false);
        }
        return;
      }

      setIsLoadingItems(true);
      setDetailError('');

      try {
        const [items, employees] = await Promise.all([
          getApprovalRealisasiByEmployee(pegawaiId),
          getApprovalRealisasiEmployees().catch(() => [] as ApprovalRealisasiEmployee[]),
        ]);
        const employee = employees.find((item) => item.id === pegawaiId);

        if (!ignore) {
          setApprovalItems(items);
          if (employee) setSelectedEmployee(employee);
        }
      } catch {
        if (!ignore) setDetailError('Gagal mengambil detail realisasi pegawai.');
      } finally {
        if (!ignore) setIsLoadingItems(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [pegawaiId]);

  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return approvalItems;
    return approvalItems.filter((item) => item.status === statusFilter);
  }, [approvalItems, statusFilter]);

  const unapprovedFilteredItems = filteredItems.filter((item) => item.status === 'diajukan');
  const isAllPendingSelected =
    unapprovedFilteredItems.length > 0 && unapprovedFilteredItems.every((item) => selectedIds.has(item.id));
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const backToList = () => {
    navigate('/pimpinan/approval-pegawai', { state: { tab: 'realisasi' } });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllPending = () => {
    setSelectedIds(new Set(unapprovedFilteredItems.map((item) => item.id)));
  };

  const clearSelected = () => setSelectedIds(new Set());

  const toggleSelectAllPending = () => {
    if (isAllPendingSelected) {
      clearSelected();
      return;
    }

    selectAllPending();
  };

  const approveSelected = async () => {
    if (!pegawaiId || selectedIds.size === 0) return;

    setIsApproving(true);
    setDetailError('');

    try {
      await approveRealisasiKegiatan(Array.from(selectedIds));
      clearSelected();
      await loadDetail();
    } catch {
      setDetailError('Gagal menyetujui realisasi kegiatan.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" className="mb-4 h-9 px-3 text-sm" onClick={backToList}>
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Detail Realisasi Kegiatan</h1>
        <p className="mt-1 text-base text-gray-500">Tinjau dan setujui realisasi kegiatan pegawai terpilih.</p>
      </div>

      <div className="rounded-lg border bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">
          {selectedEmployee?.nama ?? (isLoadingItems ? 'Memuat data pegawai...' : 'Pegawai terpilih')}
        </p>
        <p className="mt-1 text-xs text-gray-500">NIP {selectedEmployee?.nip ?? '-'}</p>
      </div>

      {detailError && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{detailError}</p>}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
        <Button
          type="button"
          variant={isAllPendingSelected ? 'default' : 'outline'}
          size="sm"
          onClick={toggleSelectAllPending}
          disabled={unapprovedFilteredItems.length === 0}
          className={
            isAllPendingSelected
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : ''
          }
        >
          {isAllPendingSelected ? 'Semua dipilih' : 'Pilih semua'}
        </Button>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as 'all' | ApprovalStatus);
            setPage(1);
            clearSelected();
          }}
          className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="diajukan">Belum Disetujui</option>
          <option value="disetujui">Disetujui</option>
        </select>
        <span className="ml-auto text-sm text-gray-600">{selectedIds.size} item dipilih</span>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="w-12 px-6 py-3"></th>
                <th className="px-6 py-3">Butir Kegiatan</th>
                <th className="px-6 py-3 text-center">Target</th>
                <th className="px-6 py-3 text-center">Tanggal</th>
                <th className="px-6 py-3 text-center">Realisasi</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Keterangan</th>
                <th className="px-6 py-3 text-center">Dokumen Pendukung</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {isLoadingItems ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                    Memuat detail realisasi...
                  </td>
                </tr>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-6 py-4">
                      {item.status === 'diajukan' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelected(item.id)}
                        />
                      )}
                    </td>

                    <td className="px-6 py-4 pr-8">
                      <div className="font-medium text-gray-900">{item.namaKegiatan}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-gray-500">{item.uraian || item.deskripsi || '-'}</div>
                    </td>

                    <td className="px-6 py-4 text-center text-gray-700">{formatNumber(item.targetKetercapaian)}</td>

                    <td className="whitespace-nowrap px-6 py-4 text-center text-gray-700">{formatTanggal(item.tanggalRealisasi)}</td>

                    <td className="px-6 py-4 text-center font-medium text-gray-800">
                      {formatNumber(item.realisasiTarget)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-6 py-4 text-gray-700">{item.keterangan || '-'}</td>

                    <td className="px-6 py-4 text-center">
                      <DocumentLinkButton href={item.linkDokumenPendukung} title="Buka dokumen pendukung" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                    Tidak ada realisasi untuk status ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ApprovalPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredItems.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <div className="flex justify-end">
        <Button disabled={selectedIds.size === 0 || isApproving} onClick={approveSelected} className="gap-2">
          <Check className="h-4 w-4" />
          {isApproving ? 'Menyetujui...' : `Setujui (${selectedIds.size})`}
        </Button>
      </div>
    </div>
  );
}
