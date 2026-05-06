import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../ui/button';

// ─── TYPES ─────────────────────

type StatusKegiatan = 'pending' | 'in-progress' | 'completed' | 'rejected';

interface Kegiatan {
  id: number;
  butir: string;
  uraian: string;
  status: StatusKegiatan;
  progress: number;
  bukti?: string;
}

interface Pegawai {
  id: number;
  nama: string;
  nip: string;
  kegiatan: Kegiatan[];
}

// ─── DATA KEGIATAN SKP ─────────────────

const DATA: Pegawai[] = [
  {
    id: 1,
    nama: 'Dr. Siti Rahayu',
    nip: '19850101',
    kegiatan: [
      {
        id: 1,
        butir: 'Perencanaan Program Kerja Triwulan',
        uraian: 'Menyusun rencana kerja triwulan unit kepegawaian beserta indikator output, timeline pelaksanaan, dan penanggung jawab kegiatan.',
        status: 'completed',
        progress: 100,
        bukti: 'Dokumen RKT Triwulan I-2026',
      },
      {
        id: 2,
        butir: 'Penyusunan Laporan Capaian Kinerja Bulanan',
        uraian: 'Mengompilasi realisasi target bulanan, analisis deviasi capaian, serta rekomendasi tindak lanjut per unit kerja.',
        status: 'pending',
        progress: 85,
        bukti: 'Draft Laporan Capaian April 2026',
      },
      {
        id: 3,
        butir: 'Monitoring Disiplin Kehadiran Pegawai',
        uraian: 'Melakukan verifikasi rekap absensi, keterlambatan, dan kepatuhan jam kerja untuk bahan evaluasi pimpinan.',
        status: 'in-progress',
        progress: 70,
        bukti: 'Rekap Kehadiran Semester I',
      },
      {
        id: 4,
        butir: 'Validasi Data Usulan Kenaikan Pangkat',
        uraian: 'Memeriksa kelengkapan administrasi usulan kenaikan pangkat pegawai sesuai ketentuan periode berjalan.',
        status: 'pending',
        progress: 90,
        bukti: 'Checklist Berkas Kenaikan Pangkat',
      },
      {
        id: 5,
        butir: 'Pendampingan Penyusunan SKP Pegawai Baru',
        uraian: 'Memberikan bimbingan teknis penyusunan sasaran kinerja pegawai baru agar selaras dengan target unit.',
        status: 'completed',
        progress: 100,
        bukti: 'Berita Acara Bimtek SKP',
      },
      {
        id: 6,
        butir: 'Evaluasi Kebutuhan Pelatihan Kompetensi',
        uraian: 'Mengidentifikasi gap kompetensi jabatan dan menyusun prioritas pelatihan berbasis hasil evaluasi kinerja.',
        status: 'pending',
        progress: 75,
        bukti: 'Matriks Gap Kompetensi',
      },
      {
        id: 7,
        butir: 'Pemutakhiran Data Kepegawaian SIMPEG',
        uraian: 'Memperbarui data riwayat jabatan, pendidikan, dan penugasan tambahan pada sistem informasi kepegawaian.',
        status: 'in-progress',
        progress: 65,
        bukti: 'Log Pembaruan Data SIMPEG',
      },
      {
        id: 8,
        butir: 'Penyusunan Notulensi Rapat Evaluasi SDM',
        uraian: 'Menyusun notulensi rapat evaluasi SDM, termasuk daftar keputusan, risiko, dan rencana aksi tindak lanjut.',
        status: 'completed',
        progress: 100,
        bukti: 'Notulensi Rapat SDM 22 April 2026',
      },
      {
        id: 9,
        butir: 'Verifikasi Bukti Dukung Capaian SKP',
        uraian: 'Menelaah validitas dokumen bukti dukung capaian SKP agar memenuhi standar audit internal.',
        status: 'pending',
        progress: 80,
        bukti: 'Daftar Verifikasi Bukti SKP',
      },
      {
        id: 10,
        butir: 'Penyusunan Rekomendasi Pembinaan Kinerja',
        uraian: 'Menyusun rekomendasi pembinaan untuk pegawai dengan capaian di bawah target berdasarkan hasil monitoring triwulan.',
        status: 'pending',
        progress: 78,
        bukti: 'Draft Rekomendasi Pembinaan',
      },
    ],
  },
  {
    id: 2,
    nama: 'Dewi Permatasari',
    nip: '19880808',
    kegiatan: [
      {
        id: 11,
        butir: 'Koordinasi Penetapan Target Kinerja Unit',
        uraian: 'Memfasilitasi penyelarasan target kinerja antar subbagian agar selaras dengan target kinerja organisasi.',
        status: 'pending',
        progress: 88,
        bukti: 'Notulen Koordinasi Target Kinerja',
      },
      {
        id: 12,
        butir: 'Review Laporan Realisasi Kinerja Pegawai',
        uraian: 'Melakukan review atas laporan realisasi kinerja bulanan dan menyampaikan catatan perbaikan ke masing-masing unit.',
        status: 'in-progress',
        progress: 72,
        bukti: 'Lembar Review Realisasi Kinerja',
      },
      {
        id: 13,
        butir: 'Penguatan Kepatuhan Administrasi Kepegawaian',
        uraian: 'Menyusun panduan singkat dan sosialisasi untuk meningkatkan kepatuhan administrasi kepegawaian periodik.',
        status: 'completed',
        progress: 100,
        bukti: 'Materi Sosialisasi Administrasi',
      },
    ],
  },
];

// ─── COMPONENT ─────────────────

export function PimpinanApprovalSKPView() {
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [acceptFilter, setAcceptFilter] = useState<'all' | 'accepted' | 'not-accepted'>('all');

  const statusLabelMap: Record<StatusKegiatan, string> = {
    pending: 'Menunggu',
    'in-progress': 'Dalam Proses',
    completed: 'Selesai',
    rejected: 'Ditolak',
  };

  const statusClassMap: Record<StatusKegiatan, string> = {
    pending: 'bg-amber-100 text-amber-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };

  // ── LIST VIEW ─────────────────
  if (!selectedPegawai) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Monitoring SKP</h1>

        <div className="bg-white rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-3">Pegawai</th>
                <th className="p-3">SKP Menunggu</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {DATA.map((p) => {
                const pending = p.kegiatan.filter(k => k.status === 'pending').length;

                return (
                  <tr key={p.id} className="border-b">
                    <td className="p-3">
                      <div className="font-medium">{p.nama}</div>
                      <div className="text-xs text-gray-500">{p.nip}</div>
                    </td>

                    <td className="p-3 text-amber-600 font-medium">
                      {pending} menunggu
                    </td>

                    <td className="p-3">
                      <Button size="sm" onClick={() => {
                        setSelectedPegawai(p);
                        setSelectedItems(new Set());
                      }}>
                        Detail
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ─────────────────

  const pendingList = selectedPegawai.kegiatan.filter(k => k.status === 'pending');
  const filteredKegiatan = selectedPegawai.kegiatan.filter((k) => {
    if (acceptFilter === 'accepted') return k.status === 'completed';
    if (acceptFilter === 'not-accepted') return k.status !== 'completed';
    return true;
  });

  const toggle = (id: number) => {
    const newSet = new Set(selectedItems);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedItems(newSet);
  };

  const selectAll = () => {
    setSelectedItems(new Set(pendingList.map(k => k.id)));
  };

  const clear = () => setSelectedItems(new Set());

  const approve = () => {
    if (selectedItems.size === 0) {
      alert('Pilih minimal satu kegiatan untuk disetujui.');
      return;
    }

    // Update local state: mark selected pending items as completed
    setSelectedPegawai((prev) => {
      if (!prev) return prev;
      const updated: Pegawai = {
        ...prev,
        kegiatan: prev.kegiatan.map((k) => {
          if (selectedItems.has(k.id) && k.status === 'pending') {
            return { ...k, status: 'completed', progress: 100 };
          }
          return k;
        }),
      };

      return updated;
    });

    alert(`Berhasil menyetujui ${selectedItems.size} kegiatan.`);
    clear();
  };

  const reject = () => {
    if (selectedItems.size === 0) {
      alert('Pilih minimal satu kegiatan untuk ditolak.');
      return;
    }

    // Update local state: mark selected pending items as rejected
    setSelectedPegawai((prev) => {
      if (!prev) return prev;
      const updated: Pegawai = {
        ...prev,
        kegiatan: prev.kegiatan.map((k) => {
          if (selectedItems.has(k.id) && k.status === 'pending') {
            return { ...k, status: 'rejected' };
          }
          return k;
        }),
      };

      return updated;
    });

    alert(`Berhasil menolak ${selectedItems.size} kegiatan.`);
    clear();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setSelectedPegawai(null)}
        className="text-sm text-blue-600"
      >
        ← Kembali
      </button>

      <h2 className="text-xl font-semibold">{selectedPegawai.nama}</h2>

      {/* PATCH APPROVAL */}
      <div className="flex gap-2 bg-white p-3 rounded-xl border">
        <button onClick={selectAll} className="text-sm text-blue-600">
          Pilih semua
        </button>
        <button onClick={clear} className="text-sm text-gray-500">
          Reset
        </button>
        <select
          value={acceptFilter}
          onChange={(event) => setAcceptFilter(event.target.value as 'all' | 'accepted' | 'not-accepted')}
          className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
        >
          <option value="all">Semua Status Accept</option>
          <option value="accepted">Sudah di-accept</option>
          <option value="not-accepted">Belum di-accept</option>
        </select>
        <span className="ml-auto text-sm text-gray-600">
          {selectedItems.size} item dipilih
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-3"></th>
              <th className="p-3">Butir</th>
              <th className="p-3">Uraian</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Progress</th>
              <th className="p-3">Bukti</th>
            </tr>
          </thead>

          <tbody>
            {filteredKegiatan.map((k) => (
              <tr key={k.id} className="border-b">
                <td className="p-3">
                  {k.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedItems.has(k.id)}
                      onChange={() => toggle(k.id)}
                    />
                  )}
                </td>

                <td className="p-3">{k.butir}</td>
                <td className="p-3">{k.uraian}</td>
                <td className="p-3 text-center">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClassMap[k.status]}`}>
                    {statusLabelMap[k.status]}
                  </span>
                </td>
                <td className="p-3 text-center">{k.progress}%</td>
                <td className="p-3">{k.bukti || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={reject}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: '#dc2626' }}
        >
          <X className="h-4 w-4 text-white" />
          Tolak ({selectedItems.size})
        </button>
        <button
          type="button"
          onClick={approve}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: '#059669' }}
        >
          <Check className="h-4 w-4 text-white" />
          Setujui ({selectedItems.size})
        </button>
      </div>
    </div>
  );
}