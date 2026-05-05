import { Card, CardContent, CardHeader } from "../ui/card";

type ProfileDetailsViewProps = {
  subtitle?: string;
};

// ── Mock Data Relasi ─────────────────────────────────────────────────────────

const relationMaps = {
  role_id: [
    { id: 'role-admin', label: 'Admin' },
    { id: 'role-pimpinan', label: 'Pimpinan' },
    { id: 'role-pegawai', label: 'Pegawai' },
  ],
  jabatan_id: [
    { id: 'jab-1', label: 'Pustakawan Ahli Pertama' },
    { id: 'jab-2', label: 'Pustakawan Ahli Muda' },
    { id: 'jab-3', label: 'Pustakawan Ahli Madya' },
    { id: 'jab-4', label: 'Pranata Komputer Ahli Pertama' },
    { id: 'jab-5', label: 'Analis SDM Aparatur' },
  ],
  pangkat_id: [
    { id: 'pkt-1', label: 'Penata Muda' },
    { id: 'pkt-2', label: 'Penata Muda Tk. I' },
    { id: 'pkt-3', label: 'Penata' },
    { id: 'pkt-4', label: 'Penata Tk. I' },
    { id: 'pkt-5', label: 'Pembina' },
  ],
  golongan_id: [
    { id: 'gol-1', label: 'III/a' },
    { id: 'gol-2', label: 'III/b' },
    { id: 'gol-3', label: 'III/c' },
    { id: 'gol-4', label: 'III/d' },
    { id: 'gol-5', label: 'IV/a' },
  ],
  penempatan_id: [
    { id: 'pen-1', label: 'Perpustakaan Kampus A' },
    { id: 'pen-2', label: 'Perpustakaan Kampus B' },
    { id: 'pen-3', label: 'Perpustakaan Kampus C' },
    { id: 'pen-4', label: 'Bidang Pengolahan Koleksi' },
    { id: 'pen-5', label: 'Bidang Layanan Pemustaka' },
  ],
  sertifikasi_id: [
    { id: 'ser-1', label: 'Tersertifikasi Pustakawan' },
    { id: 'ser-2', label: 'Belum Tersertifikasi' },
    { id: 'ser-3', label: 'Sertifikasi Dalam Proses' },
  ],
} as const;

// ── Mock Data Profil (Contoh: Sarah Johnson) ─────────────────────────────────

const mockProfile = {
  nip: '198801052010012001',
  nama: 'Sarah Johnson',
  tempat_lahir: 'Jakarta',
  tanggal_lahir: '1988-01-05',
  role_id: 'role-admin',
  fungsional: 'Pustakawan Ahli Muda',
  tmt_golongan: '2022-04-01',
  pendidikan: 'S2 Ilmu Perpustakaan',
  kualifikasi: 'Manajemen perpustakaan digital',
  tmt_kgb: '2025-04-01',
  tmt_jabatan: '2021-08-01',
  tmt_pensiun: '2048-01-05',
  jabatan_id: 'jab-2',
  pangkat_id: 'pkt-3',
  golongan_id: 'gol-3',
  penempatan_id: 'pen-1',
  sertifikasi_id: 'ser-1',
};

// ── Struktur Kelompok Data ───────────────────────────────────────────────────

const detailSections = [
  {
    title: 'Data Pribadi',
    fields: [
      ['nip', 'NIP'],
      ['nama', 'Nama'],
      ['tempat_lahir', 'Tempat Lahir'],
      ['tanggal_lahir', 'Tanggal Lahir'],
      ['pendidikan', 'Pendidikan'],
      ['kualifikasi', 'Kualifikasi'],
    ],
  },
  {
    title: 'Data Kepegawaian',
    fields: [
      ['role_id', 'Role'],
      ['fungsional', 'Fungsional'],
      ['jabatan_id', 'Jabatan'],
      ['pangkat_id', 'Pangkat'],
      ['golongan_id', 'Golongan'],
      ['penempatan_id', 'Penempatan'],
      ['sertifikasi_id', 'Sertifikasi'],
    ],
  },
  {
    title: 'Tanggal TMT',
    fields: [
      ['tmt_golongan', 'TMT Golongan'],
      ['tmt_kgb', 'TMT KGB'],
      ['tmt_jabatan', 'TMT Jabatan'],
      ['tmt_pensiun', 'TMT Pensiun'],
    ],
  },
] as const;

// ── Helper Functions ─────────────────────────────────────────────────────────

function getRelationLabel(key: keyof typeof relationMaps, value: string) {
  return relationMaps[key].find((item) => item.id === value)?.label ?? '-';
}

function getProfileFieldValue(key: string) {
  const value = mockProfile[key as keyof typeof mockProfile];
  if (key in relationMaps) {
    return getRelationLabel(key as keyof typeof relationMaps, value);
  }
  return value || '-';
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Komponen Utama ───────────────────────────────────────────────────────────

export function ProfileDetailsView({ subtitle = "Data pengguna" }: ProfileDetailsViewProps) {
  const roleLabel = getRelationLabel('role_id', mockProfile.role_id);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profil</h1>
        <p className="text-gray-500 mt-1 text-base">{subtitle}</p>
      </div>

      <Card>
        <CardHeader className="pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {getInitials(mockProfile.nama)}
            </div>
            <div className="ml-1">
              <p className="text-lg font-semibold text-gray-900">{mockProfile.nama}</p>
              <p className="text-sm text-gray-500">
                {mockProfile.nip} - {roleLabel}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-col gap-6">
            {detailSections.map((section) => (
              <section key={section.title} className="flex flex-col gap-4">
                {/* Judul Kelompok */}
                <h3 className="font-semibold text-gray-900 text-[14px] border-b border-gray-100 pb-2 mb-1">
                  {section.title}
                </h3>
                
                {/* Daftar Field Tanpa Kotak Tepi, jarak diperbesar menjadi gap-y-6 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  {section.fields.map(([key, label]) => (
                    <div key={key} className="flex flex-col">
                      <p className="font-medium uppercase tracking-wide text-gray-500 text-[11px]">
                        {label}
                      </p>
                      <p className="font-medium text-gray-900 mt-0.5 text-[14px]">
                        {getProfileFieldValue(key)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}