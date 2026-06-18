import { useEffect, useMemo, useState } from 'react';

import { Search } from 'lucide-react';

import {
  getMyPenugasanTambahanList,
  type PenugasanTambahan as ApiPenugasanTambahan,
} from '../../api/penugasanApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DocumentLinkButton } from '../ui/document-link-button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

const pageSizeOptions = [5, 10, 20];

function normalizeDate(iso: string): string {
  return iso ? iso.slice(0, 10) : '';
}

function formatTanggal(iso: string): string {
  const normalized = normalizeDate(iso);
  if (!normalized) return '-';

  const [year, month, day] = normalized.split('-');
  const monthNames = [
    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];

  return `${day} ${monthNames[Number(month)] ?? month} ${year}`;
}

function formatPeriode(item: ApiPenugasanTambahan): string {
  const start = normalizeDate(item.tanggalMulai);
  const end = normalizeDate(item.tanggalSelesai);

  if (!start && !end) return '-';
  if (start && (!end || start === end)) return formatTanggal(start);
  return `${formatTanggal(start)} - ${formatTanggal(end)}`;
}

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage === 1) return [1, 2, 3, totalPages];
  if (currentPage >= totalPages - 1) {
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return Array.from(
    new Set(
      [currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (page) => page >= 1 && page <= totalPages,
      ),
    ),
  ).sort((a, b) => a - b);
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styleMap: Record<string, string> = {
    aktif: 'bg-blue-50 text-blue-700',
    selesai: 'bg-green-50 text-green-700',
    batal: 'bg-red-50 text-red-700',
  };

  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        styleMap[normalized] ?? 'bg-gray-100 text-gray-700',
      )}
    >
      {status || '-'}
    </span>
  );
}

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
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
          <span className="text-xs text-gray-500">Tampilkan</span>
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value));
              onPageChange(1);
            }}
            className="bg-transparent text-xs font-medium outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
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

export function PenugasanTambahanView() {
  const [items, setItems] = useState<ApiPenugasanTambahan[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadAssignments = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await getMyPenugasanTambahanList();
        if (!ignore) setItems(data);
      } catch {
        if (!ignore) setError('Gagal memuat penugasan tambahan.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadAssignments();

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [
        item.namaKegiatan,
        item.deskripsiKegiatan,
        item.status,
        item.tanggalMulai,
        item.tanggalSelesai,
        item.linkSurat,
        formatPeriode(item),
        item.assignedEmployees.map((employee) => `${employee.nama} ${employee.nip}`).join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Penugasan Tambahan</h1>
        <p className="mt-1 text-base text-gray-500">
          Pantau penugasan tambahan yang diberikan kepegawaian beserta surat tugas pendukungnya.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Daftar Penugasan Tambahan</CardTitle>
              <CardDescription className="mt-1">
                Seluruh penugasan tambahan yang tercatat untuk akun Anda.
              </CardDescription>
            </div>
            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 lg:w-80">
              <Search className="size-4 shrink-0 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari kegiatan, status, tanggal..."
                className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="w-[28%] px-6 py-3">Nama Kegiatan</th>
                    <th className="w-[34%] px-6 py-3">Deskripsi Kegiatan</th>
                    <th className="w-[16%] px-6 py-3">Tanggal</th>
                    <th className="w-[10%] px-6 py-3">Status</th>
                    <th className="w-[12%] px-6 py-3 text-center">Surat Tugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                        Memuat penugasan tambahan...
                      </td>
                    </tr>
                  ) : paginated.length > 0 ? (
                    paginated.map((item) => (
                      <tr key={item.id} className="align-top transition hover:bg-gray-50">
                        <td className="px-6 py-4 pr-8">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.namaKegiatan}
                          </p>
                        </td>
                        <td className="px-6 py-4 pr-8">
                          <p className="line-clamp-3 text-sm text-gray-600">
                            {item.deskripsiKegiatan || '-'}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          {formatPeriode(item)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <DocumentLinkButton href={item.linkSurat} title="Buka Link Drive Surat Tugas" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
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
