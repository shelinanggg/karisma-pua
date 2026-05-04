import { useState } from 'react';
import { Button } from '../ui/button';

// ─── TYPES ─────────────────────

type StatusKegiatan = 'pending' | 'in-progress' | 'completed';

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

// ─── MOCK DATA ─────────────────

const DATA: Pegawai[] = [
  {
    id: 1,
    nama: 'Dr. Siti Rahayu',
    nip: '19850101',
    kegiatan: [
      { id: 1, butir: 'A', uraian: 'Kegiatan A', status: 'pending', progress: 80 },
      { id: 2, butir: 'B', uraian: 'Kegiatan B', status: 'completed', progress: 100 },
    ],
  },
  {
    id: 2,
    nama: 'Dewi Permatasari',
    nip: '19880808',
    kegiatan: [
      { id: 3, butir: 'C', uraian: 'Kegiatan C', status: 'pending', progress: 90 },
    ],
  },
];

// ─── COMPONENT ─────────────────

export function PimpinanApprovalSKPView() {
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

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
    alert(`Approve ${selectedItems.size} kegiatan`);
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
        <button
          onClick={approve}
          className="ml-auto bg-emerald-600 text-white px-3 py-1 rounded"
          disabled={selectedItems.size === 0}
        >
          Approve ({selectedItems.size})
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-3"></th>
              <th className="p-3">Butir</th>
              <th className="p-3">Uraian</th>
              <th className="p-3">Status</th>
              <th className="p-3">Progress</th>
              <th className="p-3">Bukti</th>
            </tr>
          </thead>

          <tbody>
            {selectedPegawai.kegiatan.map((k) => (
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
                <td className="p-3">{k.status}</td>
                <td className="p-3">{k.progress}%</td>
                <td className="p-3">{k.bukti || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}