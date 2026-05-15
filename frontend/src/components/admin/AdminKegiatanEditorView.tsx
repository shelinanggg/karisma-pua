import { useEffect, useState, useMemo } from 'react';
import { AlertCircle, Search, Edit2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { getPegawaiList, getPegawaiReferences } from '../../api/pegawaiApi';
import { getPenugasanButirByPegawai, updatePenugasanButir, PenugasanButir, PenugasanButirUpdatePayload } from '../../api/penugasanApi';
import { Employee, PegawaiReferences } from '../../api/pegawaiApi';

const fallbackReferences: PegawaiReferences = {
  roles: [],
  jabatan: [],
  pangkat: [],
  golongan: [],
  penempatan: [],
  sertifikasi: [],
};

export function AdminKegiatanEditorView() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [references, setReferences] = useState<PegawaiReferences>(fallbackReferences);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [kegiatan, setKegiatan] = useState<PenugasanButir[]>([]);
  const [isKegiatanLoading, setIsKegiatanLoading] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<PenugasanButir | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [empData, refData] = await Promise.all([getPegawaiList(), getPegawaiReferences()]);
      setEmployees(empData);
      setReferences(refData);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil data pegawai.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadKegiatanForEmployee = async (employeeId: string) => {
    setIsKegiatanLoading(true);
    try {
      const data = await getPenugasanButirByPegawai(employeeId);
      setKegiatan(data);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengambil kegiatan pegawai.');
    } finally {
      setIsKegiatanLoading(false);
    }
  };

  const handleSelectEmployee = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
    await loadKegiatanForEmployee(String(employee.id));
  };

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((emp) =>
      query === '' || emp.nama.toLowerCase().includes(query) || emp.nip.includes(query)
    );
  }, [employees, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Memuat data pegawai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Kelola Kegiatan Pegawai</h1>
        <p className="mt-1 text-sm text-gray-500">Admin dapat mengubah kegiatan dan target pegawai kapan saja, terlepas dari status persetujuan.</p>
      </div>

      <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 sm:max-w-xs">
        <Search className="size-4 shrink-0 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau NIP..."
          className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {errorMessage && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pegawai</CardTitle>
          <CardDescription>Pilih pegawai untuk melihat dan mengelola kegiatannya.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => handleSelectEmployee(employee)}
                  className="w-full flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{employee.nama}</p>
                    <p className="text-sm text-gray-600">NIP {employee.nip}</p>
                  </div>
                  <span className="text-gray-400 text-sm">→</span>
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-gray-500">Tidak ada pegawai yang cocok.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <EmployeeKegiatanDetailModal
        employee={selectedEmployee}
        kegiatan={kegiatan}
        isLoading={isKegiatanLoading}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onSelectKegiatan={(k) => {
          setSelectedKegiatan(k);
          setIsEditOpen(true);
        }}
      />

      <AdminKegiatanEditModal
        kegiatan={selectedKegiatan}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={() => {
          if (selectedEmployee) {
            loadKegiatanForEmployee(String(selectedEmployee.id));
          }
          setIsEditOpen(false);
        }}
      />
    </div>
  );
}

function EmployeeKegiatanDetailModal({
  employee,
  kegiatan,
  isLoading,
  open,
  onOpenChange,
  onSelectKegiatan,
}: {
  employee: Employee | null;
  kegiatan: PenugasanButir[];
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectKegiatan: (kegiatan: PenugasanButir) => void;
}) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '640px', maxHeight: '70vh', overflow: 'hidden' }}>
        <DialogHeader>
          <DialogTitle>Kelola Kegiatan</DialogTitle>
          <DialogDescription>
            {employee.nama} - NIP {employee.nip}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(70vh - 7rem)' }}>
          {isLoading ? (
            <p className="py-6 text-center text-gray-500">Memuat kegiatan...</p>
          ) : kegiatan.length > 0 ? (
            <div className="space-y-3">
              {kegiatan.map((keg) => (
                <button
                  key={keg.id}
                  onClick={() => onSelectKegiatan(keg)}
                  className="w-full flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left hover:bg-gray-100 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{keg.namaKegiatan}</p>
                    <p className="text-sm text-gray-600 mt-1">{keg.uraian || keg.deskripsi || '-'}</p>
                    <p className="text-xs text-gray-600 mt-2">Target: {keg.targetKetercapaian || '-'}</p>
                  </div>
                  <Edit2 className="size-4 text-gray-400 flex-shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-gray-500">Belum ada kegiatan untuk pegawai ini.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AdminKegiatanEditModal({
  kegiatan,
  open,
  onOpenChange,
  onSuccess,
}: {
  kegiatan: PenugasanButir | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    targetKetercapaian: '',
    deskripsi: '',
    uraian: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (kegiatan && open) {
      setFormData({
        targetKetercapaian: kegiatan.targetKetercapaian || '',
        deskripsi: kegiatan.deskripsi || '',
        uraian: kegiatan.uraian || '',
      });
      setErrorMessage('');
    }
  }, [kegiatan, open]);

  const handleSubmit = async () => {
    if (!kegiatan) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: PenugasanButirUpdatePayload = {
        targetKetercapaian: formData.targetKetercapaian || undefined,
        deskripsi: formData.deskripsi || undefined,
        uraian: formData.uraian || undefined,
      };

      await updatePenugasanButir(String(kegiatan.id), payload);
      onSuccess();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal menyimpan perubahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!kegiatan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '520px' }}>
        <DialogHeader>
          <DialogTitle>Edit Kegiatan</DialogTitle>
          <DialogDescription>Ubah detail kegiatan untuk pegawai.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {errorMessage && (
            <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-red-700 text-sm">
              <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
              {errorMessage}
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-900">{kegiatan.namaKegiatan}</p>
            <p className="text-sm text-gray-600 mt-1">{kegiatan.status || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Ketercapaian</label>
            <Input
              type="number"
              value={formData.targetKetercapaian}
              onChange={(e) => setFormData((prev) => ({ ...prev, targetKetercapaian: e.target.value }))}
              placeholder="Contoh: 100"
              step="0.01"
              className="h-9 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
              placeholder="Deskripsi kegiatan..."
              className="w-full h-16 rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uraian</label>
            <textarea
              value={formData.uraian}
              onChange={(e) => setFormData((prev) => ({ ...prev, uraian: e.target.value }))}
              placeholder="Uraian detail kegiatan..."
              className="w-full h-16 rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              Sebagai admin, Anda dapat mengubah kegiatan ini kapan saja terlepas dari status persetujuannya.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
