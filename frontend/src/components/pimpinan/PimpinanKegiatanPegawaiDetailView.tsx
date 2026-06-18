import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getPegawaiList,
  getPegawaiReferences,
  type Pegawai,
  type PegawaiReferences,
} from '../../api/pegawaiApi';
import {
  getPimpinanKinerjaByPegawai,
  type MyPenugasanButir,
} from '../../api/penugasanApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

type AssignmentStatus =
  | 'Belum Ditetapkan'
  | 'Belum Ada Realisasi'
  | 'Sedang Berjalan'
  | 'Selesai'
  | 'Terlambat';

const pageSizeOptions = [5, 10, 20];

function getAdaptivePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 4) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage === 1) return [1, 2, 3, totalPages];
  if (currentPage >= totalPages - 1) {
    return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return Array.from(
    new Set(
      [currentPage - 1, currentPage, currentPage + 1, totalPages]
        .filter((page) => page >= 1 && page <= totalPages),
    ),
  ).sort((first, second) => first - second);
}

function toNumber(value: string | number | null | undefined) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

function getTarget(item: MyPenugasanButir) {
  return toNumber(item.targetKetercapaian);
}

function getStatus(item: MyPenugasanButir): AssignmentStatus {
  const target = getTarget(item);
  if (target <= 0) return 'Belum Ditetapkan';
  if (item.realisasiTotal >= target) return 'Selesai';

  const deadline = item.tanggalSelesai
    ? new Date(`${item.tanggalSelesai}T23:59:59`)
    : null;
  if (deadline && deadline.getTime() < Date.now()) return 'Terlambat';
  if (item.realisasiTotal > 0) return 'Sedang Berjalan';
  return 'Belum Ada Realisasi';
}

function getRelationLabel(
  options: Array<{ id: string; label: string }>,
  value: string,
) {
  return options.find((option) => option.id === value)?.label ?? '-';
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="min-w-[260px]">
      <p className="mb-1.5 text-xs text-gray-500">
        {formatNumber(value)} / {formatNumber(max)}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: percentage >= 100 ? '#16a34a' : '#2563eb',
          }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs font-medium text-gray-500">
        {percentage}%
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: AssignmentStatus }) {
  const styleMap: Record<AssignmentStatus, { backgroundColor: string; color: string }> = {
    'Belum Ditetapkan': { backgroundColor: '#f3f4f6', color: '#374151' },
    'Belum Ada Realisasi': { backgroundColor: '#f1f5f9', color: '#334155' },
    'Sedang Berjalan': { backgroundColor: '#dbeafe', color: '#1d4ed8' },
    Selesai: { backgroundColor: '#dcfce7', color: '#15803d' },
    Terlambat: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  };

  return (
    <span
      className="inline-flex min-w-28 max-w-full items-center justify-center rounded-full px-3 py-1 text-xs font-medium"
      style={styleMap[status]}
    >
      <span className="truncate">{status}</span>
    </span>
  );
}

export function PimpinanKegiatanPegawaiDetailView() {
  const navigate = useNavigate();
  const { pegawaiId } = useParams();
  const [employee, setEmployee] = useState<Pegawai | null>(null);
  const [references, setReferences] = useState<PegawaiReferences | null>(null);
  const [items, setItems] = useState<MyPenugasanButir[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!pegawaiId) {
        setErrorMessage('ID pegawai tidak valid.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');
        const [employees, referenceData, activityData] = await Promise.all([
          getPegawaiList(),
          getPegawaiReferences(),
          getPimpinanKinerjaByPegawai(pegawaiId),
        ]);

        if (!ignore) {
          setEmployee(employees.find((item) => String(item.id) === pegawaiId) ?? null);
          setReferences(referenceData);
          setItems(activityData);
        }
      } catch (error: any) {
        if (!ignore) {
          setErrorMessage(error.response?.data?.message || 'Gagal mengambil kegiatan pegawai.');
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [pegawaiId]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.namaKegiatan, item.uraian, item.deskripsi, getStatus(item), item.tahun]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visiblePages = getAdaptivePages(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalTarget = items.reduce((total, item) => total + getTarget(item), 0);
  const totalRealisasi = items.reduce((total, item) => total + item.realisasiTotal, 0);

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/pimpinan/data-kepegawaian')}
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Kegiatan Pegawai</h1>
        <p className="mt-1 text-sm text-gray-500">
          Daftar kegiatan dan progres pekerjaan pegawai pada periode tahun berjalan.
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{employee?.nama || (isLoading ? 'Memuat pegawai...' : 'Pegawai tidak ditemukan')}</CardTitle>
          <CardDescription>NIP {employee?.nip || '-'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
          >
            {[
              ['Jabatan', employee && references ? getRelationLabel(references.jabatan, employee.jabatan_id) : '-'],
              ['Fungsional', employee?.fungsional || '-'],
              ['Pangkat', employee && references ? getRelationLabel(references.pangkat, employee.pangkat_id) : '-'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border bg-gray-50"
                style={{ padding: '0.625rem 1rem' }}
              >
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {[
              ['Total Realisasi', formatNumber(totalRealisasi)],
              ['Total Target', formatNumber(totalTarget)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border bg-gray-50"
                style={{ padding: '0.625rem 1rem' }}
              >
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          className="gap-4"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <CardTitle>Daftar Kegiatan</CardTitle>
            <CardDescription className="mt-1">
              Informasi target, realisasi, progres, periode, dan status kegiatan.
            </CardDescription>
          </div>
          <div
            className="relative w-full"
            style={{ width: '18rem', maxWidth: '100%', flexShrink: 0 }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari kegiatan..."
              className="h-10 w-full rounded-lg border-gray-200 bg-white shadow-none"
              style={{ paddingLeft: '2.5rem', paddingRight: '0.75rem' }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] table-fixed border-collapse text-sm">
                <colgroup>
                  <col style={{ width: '37%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '35%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-gray-100 text-left font-semibold text-gray-700">
                    <th className="px-6 py-3">Nama Kegiatan</th>
                    <th className="px-6 py-3">Periode</th>
                    <th className="px-6 py-3">Progress</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        Memuat kegiatan pegawai...
                      </td>
                    </tr>
                  ) : paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="align-top hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{item.namaKegiatan}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                            {item.uraian || item.deskripsi || 'Belum ada uraian kegiatan.'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-700">Tahun {item.tahun}</td>
                        <td className="px-6 py-4">
                          <ProgressBar value={item.realisasiTotal} max={getTarget(item)} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={getStatus(item)} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        Belum ada kegiatan pada periode tahun berjalan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredItems.length > 0 && (
              <div className="flex flex-col items-start gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Menampilkan {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filteredItems.length)} dari {filteredItems.length} data
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
                    <span className="text-xs text-gray-500">Tampilkan</span>
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                      className="bg-transparent text-xs font-medium outline-none"
                    >
                      {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  {visiblePages.map((visiblePage, index) => (
                    <span key={visiblePage} className="flex items-center gap-2">
                      {index > 0 && visiblePage - visiblePages[index - 1] > 1 && (
                        <span className="px-1 text-xs text-gray-500">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPage(visiblePage)}
                        className={`min-w-8 rounded-lg border px-2 py-1 text-xs font-medium transition ${
                          visiblePage === currentPage
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {visiblePage}
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 transition disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
