import { useMemo, useState } from 'react';

import {
  Download,
  FileText,
  Search,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type PenugasanTambahan = {
  id: string;
  namaKegiatan: string;
  deskripsiKegiatan: string;
  tanggalKegiatan: string;
  suratTugas: string; // nama file surat tugas
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const initialData: PenugasanTambahan[] = [
  {
    id: 'pt-1',
    namaKegiatan: 'Pendampingan penyusunan laporan akreditasi',
    deskripsiKegiatan:
      'Mendampingi tim unit dalam melengkapi bukti dukung dan menyusun ringkasan dokumen akreditasi sesuai standar BAN-PT.',
    tanggalKegiatan: '2026-05-15',
    suratTugas: 'ST-001-Akreditasi-Mei2026.pdf',
  },
  {
    id: 'pt-2',
    namaKegiatan: 'Rapat koordinasi pengelolaan arsip digital',
    deskripsiKegiatan:
      'Koordinasi lintas unit untuk menyamakan format arsip dan alur validasi dokumen elektronik.',
    tanggalKegiatan: '2026-05-24',
    suratTugas: 'ST-002-Arsip-Digital-Mei2026.pdf',
  },
  {
    id: 'pt-3',
    namaKegiatan: 'Sosialisasi kebijakan pengelolaan kinerja',
    deskripsiKegiatan:
      'Mengikuti dan melaporkan hasil sosialisasi kebijakan SKP terbaru dari Biro SDM kepada seluruh anggota unit.',
    tanggalKegiatan: '2026-04-10',
    suratTugas: 'ST-003-Sosialisasi-SKP-Apr2026.pdf',
  },
];

const pageSizeOptions = [5, 10, 20];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTanggal(iso: string): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  const bulan = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  return `${d} ${bulan[Number(m)]} ${y}`;
}


function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage === 1) return [1, 2, 3, totalPages];
  if (currentPage >= totalPages - 1)
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return Array.from(
    new Set(
      [currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (p) => p >= 1 && p <= totalPages,
      ),
    ),
  ).sort((a, b) => a - b);
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const visiblePages = getAdaptivePages(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col items-start gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        Menampilkan {startItem}–{endItem} dari {totalItems} data
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
          <span className="text-xs text-gray-500">Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="bg-transparent text-xs font-medium outline-none"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition disabled:opacity-40"
        >
          Sebelumnya
        </button>
        {visiblePages.map((page, idx) => (
          <span key={page} className="flex items-center gap-2">
            {idx > 0 && page - visiblePages[idx - 1] > 1 && (
              <span className="px-1 text-xs text-gray-500">...</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-8 rounded-lg border px-2 py-1 text-xs font-medium transition',
                page === currentPage
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {page}
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function PenugasanTambahanView() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialData;
    return initialData.filter((item) =>
      [item.namaKegiatan, item.deskripsiKegiatan, item.tanggalKegiatan, item.suratTugas]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Penugasan Tambahan</h1>
        <p className="mt-1 text-base text-gray-500">
          Kelola seluruh penugasan tambahan yang diberikan kepegawaian beserta surat tugas
          pendukungnya.
        </p>
      </div>

      <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Daftar Penugasan Tambahan</CardTitle>
            <CardDescription className="mt-1">
              Seluruh penugasan tambahan yang telah dicatat beserta surat tugas dari kepegawaian.
            </CardDescription>
          </div>
          <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 lg:w-80">
            <Search className="size-4 shrink-0 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari kegiatan, tanggal..."
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <th className="px-6 py-3 w-[28%]">Nama Kegiatan</th>
                  <th className="px-6 py-3 w-[38%]">Deskripsi Kegiatan</th>
                  <th className="px-6 py-3 w-[16%]">Tanggal</th>
                  <th className="px-6 py-3 w-[18%]">Surat Tugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginated.length > 0 ? (
                  paginated.map((item) => (
                    <tr key={item.id} className="align-top transition hover:bg-gray-50">
                      <td className="px-6 py-4 pr-8">
                        <p className="text-sm font-semibold text-gray-900">{item.namaKegiatan}</p>
                      </td>
                      <td className="px-6 py-4 pr-8">
                        <p className="line-clamp-3 text-sm text-gray-600">
                          {item.deskripsiKegiatan}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatTanggal(item.tanggalKegiatan)}
                      </td>
                      <td className="px-6 py-4">
                        {item.suratTugas ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`/surat-tugas/${item.suratTugas}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Buka ${item.suratTugas}`}
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                            >
                              <FileText className="size-4" />
                            </a>
                            <a
                              href={`/surat-tugas/${item.suratTugas}`}
                              download={item.suratTugas}
                              title={`Unduh ${item.suratTugas}`}
                              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                            >
                              <Download className="size-4" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Belum diunggah</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                      Tidak ada penugasan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

export default PenugasanTambahanView;
