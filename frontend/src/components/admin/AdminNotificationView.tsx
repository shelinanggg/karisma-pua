import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Send } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

// --- MOCK DATA ---
const promotionData = Array.from({ length: 45 }).map((_, i) => ({
  id: `user-p-${i}`,
  name: `Pegawai Promotion ${i + 1}`,
  currentScore: Math.floor(Math.random() * (150 - 50) + 50),
  requiredScore: 150,
}));

const today = new Date();
const kgbData = Array.from({ length: 12 }).map((_, i) => {
  // Generate dates within the next 31 days
  const daysLeft = Math.floor(Math.random() * 30) + 1;
  const tmtDate = new Date(today);
  tmtDate.setDate(today.getDate() + daysLeft);

  return {
    id: `user-k-${i}`,
    name: `Pegawai KGB ${i + 1}`,
    tmtKgb: tmtDate.toISOString(),
    daysLeft,
  };
});

// --- HELPER COMPONENT ---
function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const startPage = Math.min(Math.max(1, currentPage), totalPages - 2);
  const pages = [startPage, startPage + 1, startPage + 2].filter((page) => page <= totalPages);

  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages;
}

type CustomPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

function CustomPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: CustomPaginationProps) {
  const visiblePages = getAdaptivePages(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
          <span className="text-xs text-muted-foreground">Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="text-xs font-medium outline-none"
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40"
        >
          Sebelumnya
        </button>
        {visiblePages.map((page, idx) => (
          <React.Fragment key={page}>
            {idx > 0 && page - visiblePages[idx - 1] > 1 && (
              <span className="px-1 text-xs text-muted-foreground">...</span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className="rounded-lg border py-1 text-xs font-medium transition"
              style={{
                minWidth: "2rem",
                paddingLeft: "0.1rem",
                paddingRight: "0.1rem",
                ...(page === currentPage
                  ? { background: "var(--primary)", color: "var(--primary-foreground)", borderColor: "var(--primary)" }
                  : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }),
              }}
            >
              {page}
            </button>
          </React.Fragment>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

export function AdminNotificationView() {
  const [promoPage, setPromoPage] = useState(1);
  const [promoPageSize, setPromoPageSize] = useState(10);
  const [kgbPage, setKgbPage] = useState(1);
  const [kgbPageSize, setKgbPageSize] = useState(10);

  const [selectedPromoUser, setSelectedPromoUser] = useState<string>("");
  const [selectedKgbUser, setSelectedKgbUser] = useState<string>("");

  const totalPromoPages = Math.max(1, Math.ceil(promotionData.length / promoPageSize));
  const normalizedPromoPage = Math.min(promoPage, totalPromoPages);
  const paginatedPromo = promotionData.slice((normalizedPromoPage - 1) * promoPageSize, normalizedPromoPage * promoPageSize);

  const totalKgbPages = Math.max(1, Math.ceil(kgbData.length / kgbPageSize));
  const normalizedKgbPage = Math.min(kgbPage, totalKgbPages);
  const paginatedKgb = kgbData.slice((normalizedKgbPage - 1) * kgbPageSize, normalizedKgbPage * kgbPageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifikasi Kepegawaian</h1>
        <p className="text-gray-600 mt-1">Kelola dan kirim notifikasi terkait kenaikan jabatan dan gaji berkala</p>
      </div>

      <Tabs defaultValue="jabatan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="jabatan">Kenaikan Jabatan</TabsTrigger>
          <TabsTrigger value="kgb">Kenaikan Gaji Berkala</TabsTrigger>
        </TabsList>

        {/* TAB 1: Kenaikan Jabatan */}
        <TabsContent value="jabatan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Kandidat Kenaikan Jabatan</CardTitle>
              <CardDescription>
                Pegawai dengan progres angka ketercapaian menuju target yang dipersyaratkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ paddingLeft: '1.5rem' }}>Nama Pegawai</TableHead>
                      <TableHead>Angka Ketercapaian</TableHead>
                      <TableHead style={{ width: '300px', paddingRight: '1.5rem' }}>Progres</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPromo.map((user) => {
                      const percentage = Math.min(100, Math.round((user.currentScore / user.requiredScore) * 100));
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium" style={{ paddingLeft: '1.5rem' }}>{user.name}</TableCell>
                          <TableCell>
                            <span className="font-semibold">{user.currentScore}</span> / <span className="text-gray-500">{user.requiredScore}</span>
                          </TableCell>
                          <TableCell style={{ paddingRight: '1.5rem' }}>
                            <div className="flex items-center gap-3">
                              <Progress value={percentage} className="w-full" />
                              <span className="text-sm text-gray-500 w-12">{percentage}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <CustomPagination
                  currentPage={normalizedPromoPage}
                  totalPages={totalPromoPages}
                  totalItems={promotionData.length}
                  pageSize={promoPageSize}
                  onPageChange={setPromoPage}
                  onPageSizeChange={setPromoPageSize}
                />
              </div>

              <div className="mt-4 pt-4 flex justify-end px-4 sm:px-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Notifikasi
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Kirim Notifikasi Kenaikan Jabatan</DialogTitle>
                      <DialogDescription>
                        Pilih pegawai untuk dikirimkan notifikasi pengingat atau ucapan selamat.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Select value={selectedPromoUser} onValueChange={setSelectedPromoUser}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Pegawai" />
                        </SelectTrigger>
                        <SelectContent>
                          {promotionData.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} (Progres: {Math.round((user.currentScore / user.requiredScore) * 100)}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1">
                        <Checkbox id="send-all-promo" />
                        <label
                          htmlFor="send-all-promo"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          Kirim untuk semua
                        </label>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline">Batal</Button>
                        <Button>Kirim via Sistem</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Kenaikan Gaji Berkala (KGB) */}
        <TabsContent value="kgb" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Peserta Kenaikan Gaji Berkala</CardTitle>
              <CardDescription>
                Hanya menampilkan pegawai yang TMT KGB-nya kurang dari sama dengan 31 hari lagi.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: '33.33%', paddingLeft: '1.5rem' }}>Nama Pegawai</TableHead>
                      <TableHead className="text-center" style={{ width: '33.33%' }}>Tanggal TMT KGB</TableHead>
                      <TableHead className="text-right" style={{ width: '33.33%', paddingRight: '1.5rem' }}>Waktu Tersisa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedKgb.length > 0 ? (
                      paginatedKgb.map((user) => {
                        const tmtDateObj = new Date(user.tmtKgb);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium" style={{ width: '33.33%', paddingLeft: '1.5rem' }}>{user.name}</TableCell>
                            <TableCell className="text-center" style={{ width: '33.33%' }}>{tmtDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                            <TableCell className="text-right" style={{ width: '33.33%', paddingRight: '1.5rem' }}>
                              <div className="flex justify-end">
                                <Badge variant={user.daysLeft <= 14 ? "destructive" : "secondary"}>
                                  {user.daysLeft} Hari Lagi
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                          Tidak ada data KGB dalam 31 hari ke depan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {kgbData.length > 0 && (
                  <CustomPagination
                    currentPage={normalizedKgbPage}
                    totalPages={totalKgbPages}
                    totalItems={kgbData.length}
                    pageSize={kgbPageSize}
                    onPageChange={setKgbPage}
                    onPageSizeChange={setKgbPageSize}
                  />
                )}
              </div>

              <div className="mt-4 pt-4 flex justify-end px-4 sm:px-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={kgbData.length === 0}>
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Notifikasi
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Kirim Notifikasi KGB</DialogTitle>
                      <DialogDescription>
                        Pilih pegawai untuk dikirimkan notifikasi persiapan KGB.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Select value={selectedKgbUser} onValueChange={setSelectedKgbUser}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Pegawai" />
                        </SelectTrigger>
                        <SelectContent>
                          {kgbData.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.daysLeft} Hari Lagi)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <Checkbox id="send-all-kgb" />
                        <label
                          htmlFor="send-all-kgb"
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          Kirim untuk semua
                        </label>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline">Batal</Button>
                        <Button>Kirim via Sistem</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

