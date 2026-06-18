import { useState, type ReactNode } from 'react';

import {
  processPromotionJabatan,
  type PromotionJabatanOption,
  type PromotionWarning,
} from '../../api/earlyWarningApi';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

function formatScore(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '-';
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, '');
}

export function PromotionWarningRows({
  data,
  isLoading,
  onProcessed,
  emptyRow,
}: {
  data: PromotionWarning[];
  isLoading: boolean;
  onProcessed: () => Promise<void>;
  emptyRow: ReactNode;
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<PromotionWarning | null>(null);
  const [selectedJabatanId, setSelectedJabatanId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState('');

  const openProcessDialog = (employee: PromotionWarning) => {
    setSelectedEmployee(employee);
    setSelectedJabatanId(employee.eligibleJabatan[0]?.id ?? '');
    setProcessError('');
  };

  const closeProcessDialog = () => {
    if (isProcessing) return;
    setSelectedEmployee(null);
    setSelectedJabatanId('');
    setProcessError('');
  };

  const handleProcess = async () => {
    if (!selectedEmployee || !selectedJabatanId) return;

    setIsProcessing(true);
    setProcessError('');

    try {
      await processPromotionJabatan(selectedEmployee.id, selectedJabatanId);
      setSelectedEmployee(null);
      setSelectedJabatanId('');
    } catch (error: any) {
      setProcessError(error.response?.data?.message || 'Gagal memproses perubahan jabatan.');
      setIsProcessing(false);
      return;
    }

    try {
      await onProcessed();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ paddingLeft: '1.5rem' }}>Nama Pegawai</TableHead>
            <TableHead>Jabatan Saat Ini</TableHead>
            <TableHead className="text-center">Koefisien/Tahun</TableHead>
            <TableHead>Angka Kredit</TableHead>
            <TableHead style={{ width: '260px' }}>Progres</TableHead>
            <TableHead className="text-center" style={{ paddingRight: '1.5rem' }}>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            emptyRow
          ) : data.length > 0 ? (
            data.map((user) => {
              const achieved = user.currentScore >= user.requiredScore;
              const actualPercentage = Math.round((user.currentScore / user.requiredScore) * 100);
              const progressPercentage = Math.min(100, actualPercentage);
              const canProcess = achieved && user.eligibleJabatan.length > 0;

              return (
                <TableRow key={user.id}>
                  <TableCell style={{ paddingLeft: '1.5rem' }}>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs font-normal text-gray-500">NIP {user.nip}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{user.currentJabatan || '-'}</div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {formatScore(user.coefficientPerYear)}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{formatScore(user.currentScore)}</span>
                    {' / '}
                    <span className="text-gray-500">{formatScore(user.requiredScore)}</span>
                    <div className={`mt-0.5 text-xs ${achieved ? 'font-medium text-green-700' : 'text-gray-500'}`}>
                      {achieved
                        ? `Target terpenuhi${user.currentScore > user.requiredScore ? ` (+${formatScore(user.currentScore - user.requiredScore)})` : ''}`
                        : `Sisa ${formatScore(user.remainingScore)}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${progressPercentage}%`,
                            backgroundColor: achieved ? '#16a34a' : '#111827',
                          }}
                        />
                      </div>
                      <span className={`w-12 text-sm ${achieved ? 'font-semibold text-green-700' : 'text-gray-500'}`}>
                        {actualPercentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center" style={{ paddingRight: '1.5rem' }}>
                    <Button
                      size="sm"
                      disabled={!canProcess}
                      title={
                        canProcess
                          ? 'Proses perubahan jabatan'
                          : achieved
                            ? 'Tidak ada jabatan tujuan yang tersedia'
                            : 'Target angka kredit belum terpenuhi'
                      }
                      onClick={() => openProcessDialog(user)}
                    >
                      Proses
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            emptyRow
          )}
        </TableBody>
      </Table>

      <PromotionDialog
        employee={selectedEmployee}
        selectedJabatanId={selectedJabatanId}
        isProcessing={isProcessing}
        error={processError}
        onSelectedJabatanChange={setSelectedJabatanId}
        onOpenChange={(open) => {
          if (!open) closeProcessDialog();
        }}
        onConfirm={handleProcess}
      />
    </>
  );
}

function PromotionDialog({
  employee,
  selectedJabatanId,
  isProcessing,
  error,
  onSelectedJabatanChange,
  onOpenChange,
  onConfirm,
}: {
  employee: PromotionWarning | null;
  selectedJabatanId: string;
  isProcessing: boolean;
  error: string;
  onSelectedJabatanChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const selectedOption = employee?.eligibleJabatan.find((item) => item.id === selectedJabatanId) ?? null;

  return (
    <Dialog open={Boolean(employee)} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '560px' }}>
        <DialogHeader>
          <DialogTitle>Proses Perubahan Jabatan</DialogTitle>
          <DialogDescription>
            Pilih jabatan lebih tinggi atau jabatan setara untuk {employee?.name || 'pegawai'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{employee?.currentJabatan || '-'}</p>
            <p className="mt-1 text-xs text-gray-500">
              Angka kredit {formatScore(employee?.currentScore ?? null)} dari target {formatScore(employee?.requiredScore ?? null)}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="promotion-jabatan" className="text-sm font-medium text-gray-700">
              Jabatan Tujuan
            </label>
            <select
              id="promotion-jabatan"
              value={selectedJabatanId}
              onChange={(event) => onSelectedJabatanChange(event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {employee?.eligibleJabatan.map((option) => (
                <option key={option.id} value={option.id}>
                  {getOptionLabel(option)}
                </option>
              ))}
            </select>
          </div>

          {selectedOption && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Koefisien per Tahun</p>
                <p className="mt-1 font-semibold text-gray-900">{formatScore(selectedOption.coefficientPerYear)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Target Angka Kredit</p>
                <p className="mt-1 font-semibold text-gray-900">{formatScore(selectedOption.targetScore)}</p>
              </div>
            </div>
          )}

          {error && <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{error}</p>}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={!selectedJabatanId || isProcessing}>
            {isProcessing ? 'Memproses...' : 'Simpan Jabatan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getOptionLabel(option: PromotionJabatanOption) {
  const target = option.targetScore === null ? 'target setara' : `target ${formatScore(option.targetScore)}`;
  return `${option.name} - ${target}`;
}
