import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { PenugasanButir, getPendingApprovalKegiatan, approvePegawaiKegiatan, rejectPegawaiKegiatan } from '../../api/penugasanApi';

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
  const [selectedKegiatan, setSelectedKegiatan] = useState<{ kegiatan: PenugasanButir; employee: PendingKegiatanByEmployee } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);

  useEffect(() => {
    loadPendingKegiatan();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    setFilteredEmployees(
      employees.filter((emp) =>
        query === '' || emp.nama.toLowerCase().includes(query) || emp.nip.includes(query)
      )
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
    try {
      await approvePegawaiKegiatan(kegiatanId);
      
      // Update UI
      setEmployees((prev) =>
        prev.map((emp) => ({
          ...emp,
          kegiatan: emp.kegiatan.filter((k) => k.id !== kegiatanId),
          pendingCount: Math.max(0, emp.pendingCount - 1),
        })).filter((emp) => emp.pendingCount > 0)
      );
      
      setIsDetailOpen(false);
      setSelectedKegiatan(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal menyetujui kegiatan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectKegiatan = async () => {
    if (!selectedKegiatan) return;
    
    setIsProcessing(true);
    try {
      await rejectPegawaiKegiatan(selectedKegiatan.kegiatan.id, rejectReason || undefined);
      
      // Update UI
      setEmployees((prev) =>
        prev.map((emp) => ({
          ...emp,
          kegiatan: emp.kegiatan.filter((k) => k.id !== selectedKegiatan.kegiatan.id),
          pendingCount: Math.max(0, emp.pendingCount - 1),
        })).filter((emp) => emp.pendingCount > 0)
      );
      
      setIsRejectConfirmOpen(false);
      setIsDetailOpen(false);
      setSelectedKegiatan(null);
      setRejectReason('');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal menolak kegiatan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPending = employees.reduce((sum, emp) => sum + emp.pendingCount, 0);

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
        <h1 className="text-2xl font-semibold text-gray-900">Persetujuan Kegiatan</h1>
        <p className="mt-1 text-sm text-gray-500">Review dan setujui atau tolak kegiatan yang diajukan pegawai.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 sm:max-w-xs">
          <Search className="size-4 shrink-0 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIP..."
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        {totalPending > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            {totalPending} menunggu
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {employees.length === 0 ? 'Tidak ada kegiatan yang menunggu persetujuan.' : 'Tidak ada hasil pencarian.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.idPengguna}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{employee.nama}</CardTitle>
                    <CardDescription>NIP {employee.nip}</CardDescription>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                    {employee.pendingCount} kegiatan
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employee.kegiatan.map((kegiatan) => (
                    <div
                      key={kegiatan.id}
                      onClick={() => {
                        setSelectedKegiatan({ kegiatan, employee });
                        setIsDetailOpen(true);
                      }}
                      className="flex items-start gap-4 rounded-lg border border-gray-200 bg-amber-50 p-4 cursor-pointer hover:bg-amber-100 transition"
                    >
                      <Clock className="size-5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{kegiatan.namaKegiatan}</p>
                        <p className="text-sm text-gray-600 mt-1">{kegiatan.uraian || kegiatan.deskripsi || '-'}</p>
                        <p className="text-xs text-gray-600 mt-2">Target: {kegiatan.targetKetercapaian || '-'}</p>
                      </div>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        →
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <KegiatanApprovalModal
        kegiatan={selectedKegiatan}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onApprove={() => handleApproveKegiatan(selectedKegiatan!.kegiatan.id)}
        onReject={() => setIsRejectConfirmOpen(true)}
        isProcessing={isProcessing}
      />

      <RejectConfirmDialog
        open={isRejectConfirmOpen}
        onOpenChange={setIsRejectConfirmOpen}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={handleRejectKegiatan}
        isProcessing={isProcessing}
      />
    </div>
  );
}

function KegiatanApprovalModal({
  kegiatan,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isProcessing,
}: {
  kegiatan: { kegiatan: PenugasanButir; employee: any } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  if (!kegiatan) return null;

  const { kegiatan: keg, employee } = kegiatan;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '560px' }}>
        <DialogHeader>
          <DialogTitle>Persetujuan Kegiatan</DialogTitle>
          <DialogDescription>
            {employee.nama} - NIP {employee.nip}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <Clock className="size-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">{keg.namaKegiatan}</p>
                <p className="text-sm text-gray-600 mt-1">{keg.uraian || keg.deskripsi || '-'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Target Ketercapaian</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{keg.targetKetercapaian || '-'}</p>
            </div>

            {keg.deskripsi && (
              <div>
                <p className="text-sm font-medium text-gray-600">Deskripsi</p>
                <p className="mt-1 text-sm text-gray-900">{keg.deskripsi}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              Silakan review kegiatan ini. Setujui untuk melanjutkan, atau tolak dengan alasan yang jelas.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onReject}
            disabled={isProcessing}
          >
            Tolak
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isProcessing}
          >
            {isProcessing ? 'Memproses...' : 'Setujui'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RejectConfirmDialog({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onConfirm,
  isProcessing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '480px' }}>
        <DialogHeader>
          <DialogTitle>Tolak Kegiatan</DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan agar pegawai dapat memperbaiki kegiatan mereka.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Penolakan (Opsional)</label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Tuliskan alasan penolakan kegiatan ini..."
              className="w-full h-24 rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Menolak...' : 'Tolak Kegiatan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
