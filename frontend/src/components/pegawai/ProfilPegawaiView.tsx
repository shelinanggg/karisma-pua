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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profil</h1>
        <p className="text-gray-500 mt-1 text-sm">Data kepegawaian</p>
      </div>

      <Card>
        <CardHeader className="pb-1">
          <div className="flex items-center" style={{ gap: 24 }}>
            <div>
              <p className="text-lg font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.nip ?? '-'}</p>
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