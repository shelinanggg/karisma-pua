import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search, Plus, Save, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';

const PAGE_SIZE = 8;

// --- TIPE DATA SKP ---
type SKPStatus = 'Draft' | 'Menunggu' | 'Disetujui';

interface SKPItem {
  id: string;
  butirName: string;
  uraian: string;
  target: number;
  realisasi: number;
  progress: number;
  status: SKPStatus;
  keterangan: string;
}

const initialSKPData: SKPItem[] = [
  {
    id: '1',
    butirName: 'Memberikan layanan referensi kepada pemustaka',
    uraian: 'Layanan referensi tatap muka dan online kepada mahasiswa dan dosen Universitas Airlangga',
    target: 78,
    realisasi: 77,
    progress: 98.7,
    status: 'Draft',
    keterangan: 'Target tahun 2026',
  },
  {
    id: '2',
    butirName: 'Memberikan bimbingan pemustaka (library instruction)',
    uraian: 'Library class literasi informasi untuk mahasiswa baru semester ganjil 2025/2026',
    target: 49,
    realisasi: 29,
    progress: 59.2,
    status: 'Draft',
    keterangan: 'Target tahun 2026',
  },
  {
    id: '3',
    butirName: 'Melaksanakan penelusuran informasi/literatur',
    uraian: 'Penelusuran literatur ilmiah untuk mendukung penelitian dosen dan mahasiswa pascasarjana',
    target: 37,
    realisasi: 31,
    progress: 83.8,
    status: 'Menunggu',
    keterangan: 'Target tahun 2026',
  },
];

const referensiButirKegiatan = [
  { name: 'Memberikan layanan referensi kepada pemustaka' },
  { name: 'Memberikan bimbingan pemustaka (library instruction)' },
  { name: 'Melaksanakan penelusuran informasi/literatur' },
  { name: 'Menjadi narasumber seminar / workshop' },
];

const getStatusClassName = (status: SKPStatus) => {
  if (status === 'Disetujui') return 'bg-black text-white border-black hover:bg-gray-800';
  if (status === 'Menunggu') return 'bg-gray-200 text-black border-gray-300 hover:bg-gray-300';
  return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
};

export function TargetKinerjaView() {
  const [skpList, setSkpList] = useState<SKPItem[]>(initialSKPData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  
  // State untuk Layout Master-Detail
  const [selectedId, setSelectedId] = useState<string>(initialSKPData[0]?.id ?? '');
  const [isDetailExpanded, setIsDetailExpanded] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    butirName: '',
    uraian: '',
    target: '',
    keterangan: '',
  });

  // --- FILTERING & PAGINATION ---
  const filteredData = useMemo(() => {
    return skpList.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        item.butirName.toLowerCase().includes(q) ||
        item.uraian.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, skpList]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredData]);

  const selectedItem = useMemo(() => {
    if (isAdding) return null;
    return skpList.find((item) => item.id === selectedId) || rows[0] || filteredData[0] || null;
  }, [isAdding, skpList, selectedId, rows, filteredData]);

  // --- HANDLERS ---
  const handleRowClick = (item: SKPItem) => {
    setIsAdding(false);
    setSelectedId(item.id);
    setIsDetailExpanded(true);
    setFormData({
      butirName: item.butirName,
      uraian: item.uraian,
      target: item.target.toString(),
      keterangan: item.keterangan,
    });
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setSelectedId('');
    setIsDetailExpanded(true);
    setFormData({ butirName: '', uraian: '', target: '', keterangan: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseInt(formData.target) || 0;

    if (isAdding) {
      const newItem: SKPItem = {
        id: Math.random().toString(36).substr(2, 9),
        butirName: formData.butirName,
        uraian: formData.uraian,
        target: targetNum,
        realisasi: 0,
        progress: 0,
        status: 'Draft',
        keterangan: formData.keterangan,
      };
      setSkpList([...skpList, newItem]);
      setIsAdding(false);
      setSelectedId(newItem.id);
    } else if (selectedItem) {
      setSkpList((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, ...formData, target: targetNum }
            : item
        )
      );
    }
  };

  return (
    <Card className="h-[calc(100vh-9.5rem)] flex flex-col shadow-none border-gray-200 bg-white">
      <CardHeader className="pb-3 border-b border-gray-200">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-xl font-extrabold leading-tight text-black">Target Kinerja SKP</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-10 w-full items-center gap-2 rounded-xl bg-white px-3 border border-gray-300 sm:w-64">
              <Search className="h-4 w-4 shrink-0 text-gray-500" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari kegiatan..."
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
            {/* Pakai !important agar warna override varian bawaan Shadcn */}
            <Button onClick={handleAddNew} className="!bg-black hover:!bg-gray-800 !text-white h-10 border-0">
              <Plus className="h-4 w-4 mr-2" /> Tambah
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
                <TableHead className="w-[50%] py-3 text-black font-bold">Butir & Uraian Kegiatan</TableHead>
                <TableHead className="w-[15%] text-black font-bold">Status</TableHead>
                <TableHead className="w-[35%] text-black font-bold">Progress</TableHead>
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
                        <Badge className={getStatusClassName(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <div className="space-y-1.5 pr-4">
                          <div className="flex justify-between text-xs text-black">
                            <span>{item.realisasi} / {item.target} target</span>
                            <span className="font-bold">{item.progress}%</span>
                          </div>
                          <Progress value={item.progress} className="h-2 bg-gray-300 [&>div]:bg-black" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-black">
                    Data kegiatan tidak ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-black shrink-0">
          <p>Menampilkan {rows.length} dari {filteredData.length} kegiatan</p>
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
                {isAdding ? 'Tambah Kegiatan Baru' : 'Detail Kegiatan'}
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
                          <CardDescription className="text-gray-600 font-medium">Target Kinerja</CardDescription>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-black">{selectedItem.target}</div></CardContent>
                      </Card>
                      <Card className="min-w-[180px] flex-1 bg-white border-gray-300 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-600 font-medium">Realisasi</CardDescription>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-black">{selectedItem.realisasi}</div></CardContent>
                      </Card>
                      <Card className="min-w-[180px] flex-1 bg-white border-gray-300 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-600 font-medium">Progress Ketercapaian</CardDescription>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-black">{selectedItem.progress}%</div></CardContent>
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
                        <TabsTrigger value="ringkasan" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Ringkasan</TabsTrigger>
                        <TabsTrigger value="edit" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">Formulir Edit</TabsTrigger>
                      </TabsList>

                      <TabsContent value="ringkasan" className="mt-4">
                        <Card className="border-gray-300 shadow-sm bg-white">
                          <CardContent className="p-6 space-y-4">
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Butir Kegiatan</p>
                              <p className="text-sm font-bold text-black">{selectedItem.butirName}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Uraian Kegiatan</p>
                              <p className="text-sm text-black leading-relaxed">{selectedItem.uraian}</p>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Keterangan</p>
                              <p className="text-sm text-gray-700 italic">{selectedItem.keterangan || 'Tidak ada keterangan.'}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="edit" className="mt-4">
                        <Card className="shadow-sm border-gray-300 bg-white">
                          <CardContent className="p-6">
                            {/* Form Edit */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-bold text-black">Butir Kegiatan</label>
                                  <Select value={formData.butirName} onValueChange={(val: string) => setFormData({ ...formData, butirName: val })} required>
                                    <SelectTrigger className="bg-white border-gray-300 text-black focus:ring-black"><SelectValue placeholder="Pilih butir kegiatan..." /></SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                      {referensiButirKegiatan.map((ref) => (
                                        <SelectItem key={ref.name} value={ref.name} className="text-black focus:bg-gray-100">{ref.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <label className="text-sm font-bold text-black">Uraian Kegiatan</label>
                                  <textarea value={formData.uraian} onChange={(e) => setFormData({ ...formData, uraian: e.target.value })} required rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black bg-white focus:ring-2 focus:ring-black outline-none" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-black">Target Angka</label>
                                  <Input type="number" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} required className="bg-white border-gray-300 text-black focus-visible:ring-black" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-black">Keterangan</label>
                                  <Input value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} className="bg-white border-gray-300 text-black focus-visible:ring-black" />
                                </div>
                              </div>
                              <div className="pt-4 flex justify-end">
                                {/* Pakai !important di sini juga */}
                                <Button type="submit" className="!bg-black hover:!bg-gray-800 !text-white border-0"><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </>
                )}

                {/* Form Render KHUSUS UNTUK TAMBAH DATA (isAdding = true) */}
                {isAdding && (
                  <Card className="shadow-sm border-gray-300 bg-gray-50">
                    <CardHeader className="pb-4 border-b border-gray-300 bg-white rounded-t-xl">
                      <CardTitle className="text-lg font-bold text-black">Formulir Rencana Kegiatan</CardTitle>
                      <CardDescription className="text-gray-600">Lengkapi detail di bawah ini untuk menambahkan rencana target SKP baru.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 bg-white rounded-b-xl border-x border-b border-gray-300">
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-black">Pilih Butir Kegiatan</label>
                          <Select value={formData.butirName} onValueChange={(val: string) => setFormData({ ...formData, butirName: val })} required>
                            <SelectTrigger className="bg-white border-gray-300 text-black focus:ring-black"><SelectValue placeholder="Klik untuk memilih..." className="text-gray-500" /></SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {referensiButirKegiatan.map((ref) => (
                                <SelectItem key={ref.name} value={ref.name} className="text-black focus:bg-gray-100">{ref.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-black">Uraian Kegiatan</label>
                          <textarea value={formData.uraian} onChange={(e) => setFormData({ ...formData, uraian: e.target.value })} required rows={3} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:ring-2 focus:ring-black outline-none resize-none placeholder:text-gray-400" placeholder="Masukkan rincian kegiatan..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-black">Target Angka</label>
                            <Input type="number" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} required min="1" placeholder="Cth: 10" className="bg-white border-gray-300 text-black focus-visible:ring-black placeholder:text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-black">Keterangan Tambahan</label>
                            <Input value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} placeholder="Cth: Target Tahun 2026" className="bg-white border-gray-300 text-black focus-visible:ring-black placeholder:text-gray-400" />
                          </div>
                        </div>
                        <div className="pt-6 flex justify-end gap-3 border-t border-gray-300 mt-6">
                          <Button type="button" variant="outline" className="bg-white text-black border-gray-300 hover:bg-gray-100" onClick={() => setIsAdding(false)}><X className="w-4 h-4 mr-2"/> Batal</Button>
                          {/* Pakai !important di tombol simpan ini juga */}
                          <Button type="submit" className="!bg-black hover:!bg-gray-800 !text-white border-0"><Save className="w-4 h-4 mr-2"/> Simpan Kegiatan Baru</Button>
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