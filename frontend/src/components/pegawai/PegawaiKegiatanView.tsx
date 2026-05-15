import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { PenugasanButir, getMyPenugasanButir, submitPegawaiKegiatan } from '../../api/penugasanApi';

type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

const statusConfig: Record<ApprovalStatus, { label: string; icon: typeof CheckCircle; bgColor: string; textColor: string }> = {
  draft: {
    label: 'Draft',
    icon: AlertCircle,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
  },
  pending: {
    label: 'Menunggu Persetujuan',
    icon: Clock,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  approved: {
    label: 'Disetujui',
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  rejected: {
    label: 'Ditolak',
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
};

export function PegawaiKegiatanView() {
  const [kegiatan, setKegiatan] = useState<PenugasanButir[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedKegiatan, setSelectedKegiatan] = useState<PenugasanButir | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadKegiatan();
  }, []);

  const loadKegiatan = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getMyPenugasanButir();
      setKegiatan(data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil kegiatan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitKegiatan = async (kegiatanId: string) => {
    setIsSubmitting(true);
    try {
      const updated = await submitPegawaiKegiatan(kegiatanId);
      setKegiatan((prev) =>
        prev.map((k) => (k.id === kegiatanId ? { ...k, approvalStatus: 'pending' } : k))
      );
      setSelectedKegiatan((prev) => (prev?.id === kegiatanId ? { ...prev, approvalStatus: 'pending' } : prev));
      setIsDetailOpen(false);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengirim kegiatan untuk persetujuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const draftKegiatan = kegiatan.filter((k) => k.approvalStatus === 'draft' || !k.approvalStatus);
  const pendingKegiatan = kegiatan.filter((k) => k.approvalStatus === 'pending');
  const approvedKegiatan = kegiatan.filter((k) => k.approvalStatus === 'approved');
  const rejectedKegiatan = kegiatan.filter((k) => k.approvalStatus === 'rejected');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Memuat kegiatan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Kegiatan Saya</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola kegiatan yang telah ditetapkan oleh pimpinan dan kirim untuk persetujuan.</p>
      </div>

      {errorMessage && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {kegiatan.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Belum ada kegiatan yang ditetapkan untuk Anda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {draftKegiatan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kegiatan Draft</CardTitle>
                <CardDescription>Kegiatan yang belum dikirim untuk persetujuan. Anda dapat mengubahnya kapan saja.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {draftKegiatan.map((item) => (
                    <KegiatanCard
                      key={item.id}
                      kegiatan={item}
                      onSelect={() => {
                        setSelectedKegiatan(item);
                        setIsDetailOpen(true);
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pendingKegiatan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Menunggu Persetujuan</CardTitle>
                <CardDescription>Kegiatan yang telah dikirim dan menunggu persetujuan dari pimpinan.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingKegiatan.map((item) => (
                    <KegiatanCard
                      key={item.id}
                      kegiatan={item}
                      onSelect={() => {
                        setSelectedKegiatan(item);
                        setIsDetailOpen(true);
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {approvedKegiatan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kegiatan Disetujui</CardTitle>
                <CardDescription>Kegiatan yang telah disetujui oleh pimpinan. Data kegiatan terkunci dan tidak dapat diubah.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {approvedKegiatan.map((item) => (
                    <KegiatanCard
                      key={item.id}
                      kegiatan={item}
                      isLocked
                      onSelect={() => {
                        setSelectedKegiatan(item);
                        setIsDetailOpen(true);
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {rejectedKegiatan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kegiatan Ditolak</CardTitle>
                <CardDescription>Kegiatan yang telah ditolak oleh pimpinan.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rejectedKegiatan.map((item) => (
                    <KegiatanCard
                      key={item.id}
                      kegiatan={item}
                      onSelect={() => {
                        setSelectedKegiatan(item);
                        setIsDetailOpen(true);
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <KegiatanDetailModal
        kegiatan={selectedKegiatan}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onSubmit={() => handleSubmitKegiatan(selectedKegiatan!.id)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

function KegiatanCard({
  kegiatan,
  isLocked = false,
  onSelect,
}: {
  kegiatan: PenugasanButir;
  isLocked?: boolean;
  onSelect: () => void;
}) {
  const status = (kegiatan.approvalStatus || 'draft') as ApprovalStatus;
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      onClick={onSelect}
      className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition ${
        isLocked
          ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className={`${config.bgColor} rounded-lg p-2.5 ${config.textColor}`}>
        <StatusIcon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{kegiatan.namaKegiatan}</p>
        <p className="text-sm text-gray-600 mt-1">{kegiatan.uraian || kegiatan.deskripsi || '-'}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
          <span>Target: {kegiatan.targetKetercapaian || '-'}</span>
          <span className={`font-medium ${config.textColor}`}>{config.label}</span>
        </div>
      </div>
      {isLocked && (
        <div className="text-xs text-gray-500 whitespace-nowrap">
          Terkunci
        </div>
      )}
    </div>
  );
}

function KegiatanDetailModal({
  kegiatan,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  kegiatan: PenugasanButir | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  if (!kegiatan) return null;

  const status = (kegiatan.approvalStatus || 'draft') as ApprovalStatus;
  const config = statusConfig[status];
  const isDraft = status === 'draft';
  const isLocked = status === 'approved';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '520px' }}>
        <DialogHeader>
          <DialogTitle>Detail Kegiatan</DialogTitle>
          <DialogDescription>Informasi lengkap kegiatan yang telah ditetapkan untuk Anda.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className={`rounded-lg ${config.bgColor} p-3`}>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-gray-900">{kegiatan.namaKegiatan}</div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                {config.label}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Uraian</p>
              <p className="mt-1 text-sm text-gray-900">{kegiatan.uraian || '-'}</p>
            </div>

            {kegiatan.deskripsi && (
              <div>
                <p className="text-sm font-medium text-gray-600">Deskripsi</p>
                <p className="mt-1 text-sm text-gray-900">{kegiatan.deskripsi}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600">Target Ketercapaian</p>
              <p className="mt-1 text-sm text-gray-900">{kegiatan.targetKetercapaian || '-'}</p>
            </div>
          </div>

          {isDraft && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                Kegiatan ini masih dalam status draft. Klik tombol di bawah untuk mengirim kegiatan ini agar mendapatkan persetujuan dari pimpinan.
              </p>
            </div>
          )}

          {isLocked && (
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-sm text-green-800">
                Kegiatan ini telah disetujui oleh pimpinan. Data kegiatan terkunci dan tidak dapat diubah.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          {isDraft && (
            <Button
              size="sm"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim untuk Persetujuan'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
