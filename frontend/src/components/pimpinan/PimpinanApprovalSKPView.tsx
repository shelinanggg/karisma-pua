import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';

import {
  approveRealisasiKegiatan,
  getApprovalRealisasiByEmployee,
  getApprovalRealisasiEmployees,
  type ApprovalRealisasiEmployee,
  type ApprovalRealisasiItem,
} from '../../api/penugasanApi';
import { Button } from '../ui/button';

type ApprovalStatus = ApprovalRealisasiItem['status'];

const statusLabelMap: Record<ApprovalStatus, string> = {
  diajukan: 'Belum Disetujui',
  disetujui: 'Disetujui',
};

const statusClassMap: Record<ApprovalStatus, string> = {
  diajukan: 'bg-amber-50 text-amber-700',
  disetujui: 'bg-green-50 text-green-700',
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
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassMap[status]}`}>
      {statusLabelMap[status]}
    </span>
  );
}

export function PimpinanApprovalSKPView() {
  const [approvalEmployees, setApprovalEmployees] = useState<ApprovalRealisasiEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<ApprovalRealisasiEmployee | null>(null);
  const [approvalItems, setApprovalItems] = useState<ApprovalRealisasiItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all');
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [employeeError, setEmployeeError] = useState('');
  const [detailError, setDetailError] = useState('');

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    setEmployeeError('');

    try {
      const data = await getApprovalRealisasiEmployees();
      setApprovalEmployees(data);
    } catch {
      setEmployeeError('Gagal mengambil data pegawai yang mengajukan realisasi SKP.');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const loadEmployeeRealisasi = async (employeeId: string) => {
    setIsLoadingItems(true);
    setDetailError('');

    try {
      const data = await getApprovalRealisasiByEmployee(employeeId);
      setApprovalItems(data);
    } catch {
      setDetailError('Gagal mengambil detail realisasi pegawai.');
    } finally {
      setIsLoadingItems(false);
    }
  };

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

  useEffect(() => {
    if (!selectedEmployee) return;

    let ignore = false;

    const load = async () => {
      setIsLoadingItems(true);
      setDetailError('');

      try {
        const data = await getApprovalRealisasiByEmployee(selectedEmployee.id);
        if (!ignore) setApprovalItems(data);
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
  }, [selectedEmployee]);

  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return approvalItems;
    return approvalItems.filter((item) => item.status === statusFilter);
  }, [approvalItems, statusFilter]);

  const unapprovedFilteredItems = filteredItems.filter((item) => item.status === 'diajukan');

  const openDetail = (employee: ApprovalRealisasiEmployee) => {
    setSelectedEmployee(employee);
    setApprovalItems([]);
    setSelectedIds(new Set());
    setStatusFilter('all');
  };

  const backToList = () => {
    setSelectedEmployee(null);
    setApprovalItems([]);
    setSelectedIds(new Set());
    setStatusFilter('all');
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

  const approveSelected = async () => {
    if (!selectedEmployee || selectedIds.size === 0) return;

    setIsApproving(true);
    setDetailError('');

    try {
      await approveRealisasiKegiatan(Array.from(selectedIds));
      clearSelected();
      await Promise.all([loadEmployeeRealisasi(selectedEmployee.id), loadEmployees()]);
    } catch {
      setDetailError('Gagal menyetujui realisasi kegiatan.');
    } finally {
      setIsApproving(false);
    }
  };

  if (!selectedEmployee) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Persetujuan SKP</h1>
          <p className="mt-1 text-sm text-gray-500">Daftar pegawai yang sedang mengajukan realisasi kegiatan.</p>
        </div>

        {employeeError && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{employeeError}</p>}

        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b bg-gray-100 text-left text-gray-600">
                  <th className="p-3">Pegawai</th>
                  <th className="p-3">Pangkat/Golongan</th>
                  <th className="p-3 text-center">Belum Disetujui</th>
                  <th className="p-3 text-center">Total Realisasi</th>
                  <th className="p-3 text-center">Terakhir Diajukan</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {isLoadingEmployees ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      Memuat pengajuan realisasi SKP...
                    </td>
                  </tr>
                ) : approvalEmployees.length > 0 ? (
                  approvalEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b last:border-b-0">
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{employee.nama}</div>
                        <div className="text-xs text-gray-500">NIP {employee.nip || '-'}</div>
                        <div className="mt-0.5 text-xs text-gray-500">{employee.fungsional}</div>
                      </td>

                      <td className="p-3 text-gray-700">
                        <div>{employee.pangkat}</div>
                        <div className="text-xs text-gray-500">{employee.golongan}</div>
                      </td>

                      <td className="p-3 text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {employee.pendingCount} belum disetujui
                        </span>
                      </td>

                      <td className="p-3 text-center font-medium text-gray-800">
                        {formatNumber(employee.pendingRealisasiTotal)}
                      </td>

                      <td className="p-3 text-center text-gray-700">{formatTanggal(employee.lastTanggalRealisasi)}</td>

                      <td className="p-3">
                        <Button size="sm" onClick={() => openDetail(employee)}>
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      Belum ada pegawai yang mengajukan realisasi SKP.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={backToList} className="text-sm text-blue-600">
        &lt; Kembali
      </button>

      <div>
        <h2 className="text-xl font-semibold">{selectedEmployee.nama}</h2>
        <p className="mt-1 text-sm text-gray-500">NIP {selectedEmployee.nip || '-'}</p>
      </div>

      {detailError && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{detailError}</p>}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
        <Button type="button" variant="outline" size="sm" onClick={selectAllPending}>
          Pilih semua
        </Button>
        <button
          type="button"
          onClick={clearSelected}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedIds.size > 0
              ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          Reset
        </button>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as 'all' | ApprovalStatus);
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

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-sm">
            <thead>
              <tr className="border-b bg-gray-100 text-left text-gray-600">
                <th className="w-12 p-3"></th>
                <th className="p-3">Butir Kegiatan</th>
                <th className="p-3 text-center">Tanggal</th>
                <th className="p-3 text-center">Realisasi</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Keterangan</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingItems ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    Memuat detail realisasi...
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b align-top last:border-b-0">
                    <td className="p-3">
                      {item.status === 'diajukan' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelected(item.id)}
                        />
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-medium text-gray-900">{item.namaKegiatan}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-gray-500">{item.uraian || item.deskripsi || '-'}</div>
                    </td>

                    <td className="p-3 text-center text-gray-700">{formatTanggal(item.tanggalRealisasi)}</td>

                    <td className="p-3 text-center font-medium text-gray-800">
                      {formatNumber(item.realisasiTarget)}
                    </td>

                    <td className="p-3 text-center">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="p-3 text-gray-700">{item.keterangan || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    Tidak ada realisasi untuk status ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
