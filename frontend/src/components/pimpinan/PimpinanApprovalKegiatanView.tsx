import { useEffect, useState } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { PenugasanButir, approvePegawaiKegiatan, getPendingApprovalKegiatan } from '../../api/penugasanApi';

interface PendingKegiatanByEmployee {
  idPengguna: string;
  nama: string;
  nip: string;
  pendingCount: number;
  kegiatan: PenugasanButir[];
}

export function PimpinanApprovalKegiatanView() {
  const [employees, setEmployees] = useState<PendingKegiatanByEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<PendingKegiatanByEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<PendingKegiatanByEmployee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleApproveKegiatan = async (kegiatanId: string) => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      await approvePegawaiKegiatan(kegiatanId);
      setEmployees((current) =>
        current
          .map((employee) => ({
            ...employee,
            kegiatan: employee.kegiatan.filter((item) => item.id !== kegiatanId),
            pendingCount: Math.max(0, employee.pendingCount - 1),
          }))
          .filter((employee) => employee.pendingCount > 0),
      );
      setSelectedEmployee((current) => {
        if (!current) return null;
        const kegiatan = current.kegiatan.filter((item) => item.id !== kegiatanId);
        if (kegiatan.length === 0) {
          setIsDetailOpen(false);
          return null;
        }

        return { ...current, kegiatan, pendingCount: Math.max(0, current.pendingCount - 1) };
      });
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal menerima kegiatan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPending = employees.reduce((sum, employee) => sum + employee.pendingCount, 0);

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
            onChange={(event) => setSearch(event.target.value)}
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
                <th className="px-6 py-3 text-center">Target Pertama</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => {
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
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsDetailOpen(true);
                          }}
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
      </div>

      <KegiatanApprovalModal
        employee={selectedEmployee}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onApprove={handleApproveKegiatan}
        isProcessing={isProcessing}
      />
    </div>
  );
}

function KegiatanApprovalModal({
  employee,
  open,
  onOpenChange,
  onApprove,
  isProcessing,
}: {
  employee: PendingKegiatanByEmployee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (kegiatanId: string) => void;
  isProcessing: boolean;
}) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '760px' }}>
        <DialogHeader>
          <DialogTitle>Detail Pengajuan Kegiatan</DialogTitle>
          <DialogDescription>
            {employee.nama} - NIP {employee.nip || '-'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{employee.pendingCount} kegiatan menunggu persetujuan</p>
            <p className="mt-1 text-xs text-gray-500">Periksa uraian dan target sebelum menerima pengajuan.</p>
          </div>

          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-3">Kegiatan</th>
                    <th className="px-4 py-3">Uraian</th>
                    <th className="px-4 py-3 text-center">Target</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employee.kegiatan.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.namaKegiatan || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{item.uraian || item.deskripsi || '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-800">
                        {item.targetKetercapaian || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button size="sm" onClick={() => onApprove(item.id)} disabled={isProcessing}>
                          {isProcessing ? 'Memproses...' : 'Terima'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
