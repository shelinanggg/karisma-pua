import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search, Plus, Save, X, Upload, FileText } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';

const PAGE_SIZE = 8;

// --- TIPE DATA ---
type StatusRealisasi = 'Draft' | 'Menunggu' | 'Disetujui';

// Simulasi Data Target SKP yang sudah dibuat di halaman sebelumnya
const mockTargetSKP = [
  { id: 'T1', butirName: 'Memberikan layanan referensi kepada pemustaka', uraian: 'Layanan referensi tatap muka dan online', target: 78 },
  { id: 'T2', butirName: 'Memberikan bimbingan pemustaka (library instruction)', uraian: 'Library class literasi informasi', target: 49 },
  { id: 'T3', butirName: 'Melaksanakan penelusuran informasi/literatur', uraian: 'Penelusuran literatur ilmiah', target: 37 },
];

interface RealisasiItem {
  id: string;
  skpId: string; // Referensi ke Target SKP
  butirName: string;
  uraian: string;
  target: number;
  realisasi: number;
  tanggal: string;
  dokumenNama: string;
  status: StatusRealisasi;
}

const initialRealisasiData: RealisasiItem[] = [
  {
    id: 'R1',
    skpId: 'T1',
    butirName: 'Memberikan layanan referensi kepada pemustaka',
    uraian: 'Layanan referensi tatap muka dan online',
    target: 78,
    realisasi: 15,
    tanggal: '2026-04-15',
    dokumenNama: 'Laporan_Layanan_April.pdf',
    status: 'Disetujui',
  },
  {
    id: 'R2',
    skpId: 'T2',
    butirName: 'Memberikan bimbingan pemustaka (library instruction)',
    uraian: 'Library class literasi informasi',
    target: 49,
    realisasi: 5,
    tanggal: '2026-04-20',
    dokumenNama: 'Daftar_Hadir_Bimbingan.pdf',
    status: 'Menunggu',
  },
];

const getStatusClassName = (status: StatusRealisasi) => {
  if (status === 'Disetujui') return 'bg-black text-white border-black hover:bg-gray-800';
  if (status === 'Menunggu') return 'bg-gray-200 text-black border-gray-300 hover:bg-gray-300';
  return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
};

export function RealisasiKinerjaView() {
  const [realisasiList, setRealisasiList] = useState<RealisasiItem[]>(initialRealisasiData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  
  // State Layout Master-Detail
  const [selectedId, setSelectedId] = useState<string>(initialRealisasiData[0]?.id ?? '');
  const [isDetailExpanded, setIsDetailExpanded] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    skpId: '',
    realisasi: '',
    tanggal: '',
    dokumenNama: '',
  });

  // --- FILTERING & PAGINATION ---
  const filteredData = useMemo(() => {
    return realisasiList.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        item.butirName.toLowerCase().includes(q) ||
        item.dokumenNama.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, realisasiList]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredData]);

  const selectedItem = useMemo(() => {
    if (isAdding) return null;
    return realisasiList.find((item) => item.id === selectedId) || rows[0] || filteredData[0] || null;
  }, [isAdding, realisasiList, selectedId, rows, filteredData]);

  // --- HANDLERS ---
  const handleRowClick = (item: RealisasiItem) => {
    setIsAdding(false);
    setSelectedId(item.id);
    setIsDetailExpanded(true);
    setFormData({
      skpId: item.skpId,
      realisasi: item.realisasi.toString(),
      tanggal: item.tanggal,
      dokumenNama: item.dokumenNama,
    });
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setSelectedId('');
    setIsDetailExpanded(true);
    setFormData({ skpId: '', realisasi: '', tanggal: '', dokumenNama: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, dokumenNama: file.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const realisasiNum = parseInt(formData.realisasi) || 0;
    
    // Cari data target SKP berdasarkan skpId yang dipilih
    const targetInfo = mockTargetSKP.find(t => t.id === formData.skpId);
    if (!targetInfo) return;

    if (isAdding) {
      const newItem: RealisasiItem = {
        id: Math.random().toString(36).substr(2, 9),
        skpId: formData.skpId,
        butirName: targetInfo.butirName,
        uraian: targetInfo.uraian,
        target: targetInfo.target,
        realisasi: realisasiNum,
        tanggal: formData.tanggal,
        dokumenNama: formData.dokumenNama,
        status: 'Draft',
      };
      setRealisasiList([...realisasiList, newItem]);
      setIsAdding(false);
      setSelectedId(newItem.id);
    } else if (selectedItem) {
      setRealisasiList((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, ...formData, realisasi: realisasiNum, butirName: targetInfo.butirName, uraian: targetInfo.uraian, target: targetInfo.target }
            : item
        )
      );
    }
  };

  return (
    <Card className="h-[calc(100vh-9.5rem)] flex flex-col shadow-none border-gray-200 bg-white">
      <CardHeader className="pb-3 border-b border-gray-200">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-xl font-extrabold leading-tight text-black">Realisasi Kinerja</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-10 w-full items-center gap-2 rounded-xl bg-white px-3 border border-gray-300 sm:w-64">
              <Search className="h-4 w-4 shrink-0 text-gray-500" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari realisasi..."
                className="h-10 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 text-black placeholder:text-gray-400"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: string) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36 h-10 bg-white border-gray-300 text-black focus:ring-black">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="all" className="text-black focus:bg-gray-100">Semua Status</SelectItem>
                <SelectItem value="Draft" className="text-black focus:bg-gray-100">Draft</SelectItem>
                <SelectItem value="Menunggu" className="text-black focus:bg-gray-100">Menunggu</SelectItem>
                <SelectItem value="Disetujui" className="text-black focus:bg-gray-100">Disetujui</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddNew} className="!bg-black hover:!bg-gray-800 !text-white h-10 border-0">
              <Plus className="h-4 w-4 mr-2" /> Tambah Bukti
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Area Tengah: List Tabel */}
      <CardContent className="flex min-h-0 flex-1 flex-col pt-4 space-y-4 overflow-y-auto bg-white">
        <div className="rounded-md border border-gray-300 bg-white overflow-hidden shrink-0">
          <Table className="table-fixed w-full">
            <TableHeader className="bg-gray-100 border-b border-gray-300">
              <TableRow className="hover:bg-gray-100">
                <TableHead className="w-[45%] py-3 text-black font-bold">Kegiatan SKP</TableHead>
                <TableHead className="w-[20%] text-black font-bold">Tanggal & Dokumen</TableHead>
                <TableHead className="w-[15%] text-center text-black font-bold">Realisasi</TableHead>
                <TableHead className="w-[20%] text-black font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((item) => {
                  const isSelected = selectedItem?.id === item.id && !isAdding;
                  return (
                    <TableRow
                      key={item.id}
                      className={`cursor-pointer transition-colors border-b border-gray-200 ${isSelected ? 'bg-gray-200' : 'hover:bg-gray-50'}`}
                      onClick={() => handleRowClick(item)}
                    >
                      <TableCell className="align-top py-3">
                        <p className="font-bold text-black truncate">{item.butirName}</p>
                        <p className="text-sm text-gray-700 truncate mt-0.5">{item.uraian}</p>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <p className="font-medium text-black">{new Date(item.tanggal).toLocaleDateString('id-ID')}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                          <FileText className="w-3 h-3 text-gray-500" />
                          <span className="truncate max-w-[120px]">{item.dokumenNama || 'Belum ada dokumen'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3 text-center">
                        <span className="font-extrabold text-lg text-black">{item.realisasi}</span>
                        <span className="text-xs text-gray-500 ml-1">kegiatan</span>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <Badge className={getStatusClassName(item.status)}>{item.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-black">
                    Data realisasi tidak ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-black shrink-0">
          <p>Menampilkan {rows.length} dari {filteredData.length} realisasi</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded border border-gray-300 bg-white px-3 py-1 text-black disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
            >
              Sebelumnya
            </button>
            <span className="font-bold">Hal {currentPage} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded border border-gray-300 bg-white px-3 py-1 text-black disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
            >
              Berikutnya
            </button>
          </div>
        </div>

        {/* Area Bawah: Detail / Form */}
        {(selectedItem || isAdding) && (
          <div className="mt-2 shrink-0 pb-4">
            <div className="border-t border-gray-300 my-4" />

            <button
              type="button"
              onClick={() => setIsDetailExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-md px-2 py-2 text-left hover:bg-gray-100 transition-colors"
            >
              <h2 className="text-lg font-extrabold text-black">
                {isAdding ? 'Tambah Bukti Realisasi Baru' : 'Detail Realisasi'}
              </h2>
              {isDetailExpanded ? <ChevronUp className="h-5 w-5 text-black" /> : <ChevronDown className="h-5 w-5 text-black" />}
            </button>

            {isDetailExpanded && (
              <div className="space-y-4 pt-4 px-2">
                
                {/* Tampilkan Cards & Tabs JIKA SEDANG MELIHAT DETAIL */}
                {!isAdding && selectedItem && (
                  <>
                    <div className="flex gap-4 overflow-x-auto pb-1">
                      <Card className="min-w-[180px] flex-1 bg-white border-gray-300 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-600 font-medium">Realisasi Diinput</CardDescription>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-black">{selectedItem.realisasi}</div></CardContent>
                      </Card>
                      <Card className="min-w-[180px] flex-1 bg-white border-gray-300 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-600 font-medium">Target SKP</CardDescription>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-gray-500">{selectedItem.target}</div></CardContent>
                      </Card>
                      <Card className="min-w-[180px] flex-1 bg-white border-gray-300 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-600 font-medium">Tanggal Kegiatan</CardDescription>
                        </CardHeader>
                        <CardContent><div className="text-lg font-bold text-black mt-1">{new Date(selectedItem.tanggal).toLocaleDateString('id-ID')}</div></CardContent>
                      </Card>
                      <Card className="min-w-[180px] flex-1 bg-white border-gray-300 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-600 font-medium">Status Saat Ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Badge className={`mt-1 ${getStatusClassName(selectedItem.status)}`}>{selectedItem.status}</Badge>
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="ringkasan" className="w-full">
                      <TabsList className="bg-gray-200">
                        <TabsTrigger value="ringkasan" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Ringkasan Bukti</TabsTrigger>
                        <TabsTrigger value="edit" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Edit Realisasi</TabsTrigger>
                      </TabsList>

                      <TabsContent value="ringkasan" className="mt-4">
                        <Card className="border-gray-300 shadow-sm bg-white">
                          <CardContent className="p-6 space-y-4">
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Terkait Butir Kegiatan SKP</p>
                              <p className="text-sm font-bold text-black">{selectedItem.butirName}</p>
                              <p className="text-sm text-gray-700 mt-1">{selectedItem.uraian}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dokumen Bukti Fisik</p>
                              <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 border border-gray-300 rounded-lg max-w-md">
                                <div className="p-2 bg-gray-200 text-black rounded-md">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-black">{selectedItem.dokumenNama || 'Belum ada dokumen'}</p>
                                  <p className="text-xs text-gray-600">Diunggah pada {new Date(selectedItem.tanggal).toLocaleDateString('id-ID')}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="edit" className="mt-4">
                        <Card className="shadow-sm border-gray-300 bg-white">
                          <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-bold text-black">Pilih Target SKP <span className="text-red-500">*</span></label>
                                  <Select value={formData.skpId} onValueChange={(val: string) => setFormData({ ...formData, skpId: val })} required>
                                    <SelectTrigger className="bg-white border-gray-300 text-black focus:ring-black"><SelectValue placeholder="Pilih target kegiatan..." /></SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                      {mockTargetSKP.map((target) => (
                                        <SelectItem key={target.id} value={target.id} className="text-black focus:bg-gray-100">
                                          {target.butirName} (Target: {target.target})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-black">Jumlah Realisasi <span className="text-red-500">*</span></label>
                                  <Input type="number" value={formData.realisasi} onChange={(e) => setFormData({ ...formData, realisasi: e.target.value })} required min="1" className="bg-white border-gray-300 text-black focus-visible:ring-black" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-black">Tanggal Kegiatan <span className="text-red-500">*</span></label>
                                  <Input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} required className="bg-white border-gray-300 text-black focus-visible:ring-black" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-bold text-black">Upload Dokumen Bukti</label>
                                  <div className="flex items-center gap-3">
                                    <Input type="file" onChange={handleFileChange} className="bg-white cursor-pointer border-gray-300 text-black focus-visible:ring-black" accept=".pdf,.jpg,.jpeg,.png" />
                                    {formData.dokumenNama && <span className="text-xs text-gray-500 truncate max-w-[200px]">File saat ini: {formData.dokumenNama}</span>}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Format didukung: PDF, JPG, PNG (Maks 5MB)</p>
                                </div>
                              </div>
                              <div className="pt-4 flex justify-end">
                                <Button type="submit" className="!bg-black hover:!bg-gray-800 !text-white border-0"><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </>
                )}

                {/* Form Render KHUSUS UNTUK TAMBAH DATA */}
                {isAdding && (
                  <Card className="shadow-sm border-gray-300 bg-gray-50">
                    <CardHeader className="pb-4 border-b border-gray-300 bg-white rounded-t-xl">
                      <CardTitle className="text-lg font-bold text-black">Formulir Tambah Realisasi Kinerja</CardTitle>
                      <CardDescription className="text-gray-600">Isi detail di bawah dan unggah dokumen bukti untuk melaporkan kinerja Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 bg-white rounded-b-xl border-x border-b border-gray-300">
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-black">Pilih Target SKP <span className="text-red-500">*</span></label>
                          <Select value={formData.skpId} onValueChange={(val: string) => setFormData({ ...formData, skpId: val })} required>
                            <SelectTrigger className="bg-white border-gray-300 text-black focus:ring-black"><SelectValue placeholder="Pilih target kegiatan SKP Anda..." className="text-gray-500" /></SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {mockTargetSKP.map((target) => (
                                <SelectItem key={target.id} value={target.id} className="text-black focus:bg-gray-100">
                                  {target.butirName} (Target: {target.target})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-black">Jumlah Realisasi <span className="text-red-500">*</span></label>
                            <Input type="number" value={formData.realisasi} onChange={(e) => setFormData({ ...formData, realisasi: e.target.value })} required min="1" placeholder="Cth: 2" className="bg-white border-gray-300 text-black focus-visible:ring-black placeholder:text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-black">Tanggal Kegiatan <span className="text-red-500">*</span></label>
                            <Input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} required className="bg-white border-gray-300 text-black focus-visible:ring-black" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-black">Upload Dokumen Bukti <span className="text-red-500">*</span></label>
                          <div className="flex flex-col gap-2">
                            <Input type="file" onChange={handleFileChange} required className="cursor-pointer border-dashed border-2 border-gray-300 py-2 h-auto bg-white text-black focus-visible:ring-black" accept=".pdf,.jpg,.jpeg,.png" />
                            <p className="text-xs text-gray-500">Unggah file Sertifikat, Laporan, atau Bukti Hadir (PDF/JPG/PNG, Maks 5MB).</p>
                          </div>
                        </div>
                        <div className="pt-6 flex justify-end gap-3 border-t border-gray-300 mt-6">
                          <Button type="button" variant="outline" className="bg-white text-black border-gray-300 hover:bg-gray-100" onClick={() => setIsAdding(false)}><X className="w-4 h-4 mr-2"/> Batal</Button>
                          <Button type="submit" className="!bg-black hover:!bg-gray-800 !text-white border-0"><Upload className="w-4 h-4 mr-2"/> Simpan & Unggah Bukti</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}