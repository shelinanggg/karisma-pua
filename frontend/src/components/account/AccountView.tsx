import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { currentUser } from '../../data/mockData';

export function AccountView() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Profil</h1>
        <p className="text-gray-600 mt-1">Kelola data profil akun pengguna</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Perbarui informasi dasar akun</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input id="fullName" defaultValue={currentUser.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={currentUser.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Peran</Label>
            <Input id="role" defaultValue={currentUser.role} disabled />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Batal</Button>
            <Button>Simpan Perubahan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
