import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { currentUser } from '../../data/mockData2';

const fields = [
  { label: 'Nama', value: currentUser.name },
  { label: 'NIP / NIK', value: currentUser.nip ?? '-' },
  { label: 'Tempat Lahir', value: currentUser.tempatLahir ?? '-' },
  { label: 'Tanggal Lahir', value: currentUser.tanggalLahir ?? '-' },
  { label: 'Jenis Kelamin', value: currentUser.jenisKelamin ?? '-' },
  { label: 'Fungsional', value: currentUser.fungsional ?? '-' },
  { label: 'Jabatan', value: currentUser.jabatan ?? '-' },
  { label: 'TMT Jabatan', value: currentUser.tmtJabatan ?? '-' },
  { label: 'Pangkat', value: currentUser.pangkat ?? '-' },
  { label: 'Golongan', value: currentUser.golongan ?? '-' },
  { label: 'TMT Golongan', value: currentUser.tmtGolongan ?? '-' },
  { label: 'Pendidikan', value: currentUser.pendidikan ?? '-' },
  { label: 'Kualifikasi', value: currentUser.kualifikasi ?? '-' },
  { label: 'TMT KGB', value: currentUser.tmtKgb ?? '-' },
  { label: 'Penempatan', value: currentUser.penempatan ?? '-' },
  { label: 'Tersertifikasi Pustakawan', value: currentUser.tersertifikasiPustakawan ?? '-' },
  { label: 'Batas Usia Pensiun (BUP)', value: currentUser.bup ?? '-' },
  { label: 'Pensiun TMT', value: currentUser.pensiunTmt ?? '-' },
];

export function ProfilPegawaiView() {
  const initials = currentUser.name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profil</h1>
        <p className="text-gray-500 mt-1 text-sm">Data kepegawaian</p>
      </div>

      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-center" style={{ gap: 24 }}>
            <div
              className="bg-blue-100"
              style={{
                flexShrink: 0,
                width: 80,
                height: 80,
                minWidth: 80,
                minHeight: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #e5e7eb',
                marginRight: 8,
              }}
            >
              {currentUser.photoUrl ? (
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <span
                  className="text-blue-600 font-semibold select-none"
                  style={{ fontSize: 24, lineHeight: 1 }}
                >
                  {initials}
                </span>
              )}
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              {currentUser.jabatan && (
                <span className="mt-1 inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {currentUser.jabatan}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <Label className="text-xs text-gray-400">{label}</Label>
                <Input
                  value={value}
                  readOnly
                  className="bg-gray-50 border-gray-200 text-gray-400 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}