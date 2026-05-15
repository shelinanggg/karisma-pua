import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getPenugasanTambahanList,
  getPenugasanEmployees,
  createPenugasanTambahan,
  updatePenugasanTambahan,
  type PenugasanTambahan,
  type PenugasanEmployee,
} from '../../api/penugasanApi';
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
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

type FormData = {
  namaKegiatan: string;
  deskripsiKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  assignedEmployeeIds: string[];
};

const initialFormData: FormData = {
  namaKegiatan: '',
  deskripsiKegiatan: '',
  tanggalMulai: '',
  tanggalSelesai: '',
  assignedEmployeeIds: [],
};

export function PimpinanPenugasanTambahanView() {
  const [penugasanList, setPenugasanList] = useState<PenugasanTambahan[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<PenugasanEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const [penugasanData, employeeData] = await Promise.all([
          getPenugasanTambahanList(),
          getPenugasanEmployees(),
        ]);
        setPenugasanList(penugasanData);
        setEmployeeOptions(employeeData);
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || 'Gagal memuat data penugasan tambahan.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOpenDialog = (penugasan?: PenugasanTambahan) => {
    if (penugasan) {
      setIsEditing(true);
      setEditingId(penugasan.id);
      setFormData({
        namaKegiatan: penugasan.namaKegiatan,
        deskripsiKegiatan: penugasan.deskripsiKegiatan,
        tanggalMulai: penugasan.tanggalMulai,
        tanggalSelesai: penugasan.tanggalSelesai,
        assignedEmployeeIds: penugasan.assignedEmployees.map((e) => e.id),
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData(initialFormData);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setFormData(initialFormData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedEmployeeIds: prev.assignedEmployeeIds.includes(employeeId)
        ? prev.assignedEmployeeIds.filter((id) => id !== employeeId)
        : [...prev.assignedEmployeeIds, employeeId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.namaKegiatan.trim()) {
      setErrorMessage('Nama kegiatan harus diisi.');
      return;
    }
    if (!formData.tanggalMulai || !formData.tanggalSelesai) {
      setErrorMessage('Tanggal mulai dan selesai harus diisi.');
      return;
    }
    if (formData.assignedEmployeeIds.length === 0) {
      setErrorMessage('Pilih minimal satu pegawai untuk ditugaskan.');
      return;
    }

    try {
      const payload = {
        namaKegiatan: formData.namaKegiatan,
        deskripsiKegiatan: formData.deskripsiKegiatan,
        tanggalMulai: formData.tanggalMulai,
        tanggalSelesai: formData.tanggalSelesai,
        assignedEmployeeIds: formData.assignedEmployeeIds,
      };

      if (isEditing && editingId) {
        await updatePenugasanTambahan(editingId, payload);
        setSuccessMessage('Penugasan tambahan berhasil diperbarui.');
      } else {
        await createPenugasanTambahan(payload);
        setSuccessMessage('Penugasan tambahan berhasil dibuat.');
      }

      // Reload data
      const penugasanData = await getPenugasanTambahanList();
      setPenugasanList(penugasanData);

      handleCloseDialog();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Gagal menyimpan penugasan tambahan.');
    }
  };

  const filteredPenugasan = penugasanList.filter(
    (item) =>
      item.namaKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deskripsiKegiatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'selesai':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'batal':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'Aktif';
      case 'selesai':
        return 'Selesai';
      case 'batal':
        return 'Batal';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Memuat penugasan tambahan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Penugasan Tambahan</h1>
          <p className="text-gray-600 mt-1">Kelola penugasan tambahan untuk pegawai di unit Anda.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Penugasan
        </Button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
          <AlertCircle className="size-4" />
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm font-medium text-green-600">
          <AlertCircle className="size-4" />
          {successMessage}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Cari penugasan tambahan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      {/* Penugasan List */}
      {filteredPenugasan.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada penugasan tambahan. Buat penugasan baru untuk memulai.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPenugasan.map((penugasan) => {
            const isExpanded = expandedId === penugasan.id;
            return (
              <Card key={penugasan.id} className="hover:shadow-md transition-shadow">
                <CardHeader
                  className="pb-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : penugasan.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base truncate">{penugasan.namaKegiatan}</CardTitle>
                        <Badge className={`text-xs ${getStatusColor(penugasan.status)}`}>
                          {getStatusLabel(penugasan.status)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{penugasan.deskripsiKegiatan}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(penugasan);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t pt-4">
                    {/* Tanggal */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Tanggal Mulai
                        </p>
                        <p className="text-sm text-gray-900">{penugasan.tanggalMulai || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Tanggal Selesai
                        </p>
                        <p className="text-sm text-gray-900">{penugasan.tanggalSelesai || '-'}</p>
                      </div>
                    </div>

                    {/* Deskripsi lengkap */}
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Deskripsi</p>
                      <p className="text-sm text-gray-700">{penugasan.deskripsiKegiatan || '-'}</p>
                    </div>

                    {/* Pegawai yang ditugaskan */}
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Pegawai yang Ditugaskan ({penugasan.assignedEmployees.length})
                      </p>
                      {penugasan.assignedEmployees.length > 0 ? (
                        <div className="space-y-1">
                          {penugasan.assignedEmployees.map((employee) => (
                            <div key={employee.id} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                              {employee.nama} - NIP {employee.nip}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Tidak ada pegawai yang ditugaskan.</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog for create/edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Penugasan Tambahan' : 'Tambah Penugasan Tambahan'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Ubah detail penugasan tambahan dan pegawai yang ditugaskan.' : 'Buat penugasan tambahan baru untuk pegawai.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nama Kegiatan */}
            <div>
              <Label htmlFor="namaKegiatan">Nama Kegiatan *</Label>
              <Input
                id="namaKegiatan"
                name="namaKegiatan"
                value={formData.namaKegiatan}
                onChange={handleInputChange}
                placeholder="Masukkan nama kegiatan..."
                className="mt-1"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <Label htmlFor="deskripsiKegiatan">Deskripsi Kegiatan</Label>
              <Textarea
                id="deskripsiKegiatan"
                name="deskripsiKegiatan"
                value={formData.deskripsiKegiatan}
                onChange={handleInputChange}
                placeholder="Masukkan deskripsi kegiatan..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tanggalMulai">Tanggal Mulai *</Label>
                <Input
                  id="tanggalMulai"
                  type="date"
                  name="tanggalMulai"
                  value={formData.tanggalMulai}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tanggalSelesai">Tanggal Selesai *</Label>
                <Input
                  id="tanggalSelesai"
                  type="date"
                  name="tanggalSelesai"
                  value={formData.tanggalSelesai}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Pilih Pegawai */}
            <div>
              <Label>Pilih Pegawai *</Label>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {employeeOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">Tidak ada pegawai yang tersedia.</p>
                ) : (
                  employeeOptions.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`employee-${employee.id}`}
                        checked={formData.assignedEmployeeIds.includes(employee.id)}
                        onChange={() => handleEmployeeToggle(employee.id)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`employee-${employee.id}`} className="flex-1 text-sm cursor-pointer">
                        {employee.nama} - NIP {employee.nip}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.assignedEmployeeIds.length} pegawai dipilih
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? 'Perbarui' : 'Tambahkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
