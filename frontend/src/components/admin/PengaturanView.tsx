import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ paddingRight: '2.5rem' }}
        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:bg-white [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        tabIndex={-1}
        style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          color: '#9ca3af',
        }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export function PengaturanView() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError('');
    setSuccess('');
  }

  function handleSubmit() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    setSuccess('Password berhasil diubah.');
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 mt-1 text-base">Kelola keamanan akun</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lock className="w-5 h-5 text-gray-700" />
            Ganti Password
          </CardTitle>
          <CardDescription className="text-sm">Pastikan password baru minimal 8 karakter</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Password Saat Ini</Label>
            <PasswordInput
              id="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Masukkan password saat ini"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">Password Baru</Label>
            <PasswordInput
              id="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Masukkan password baru"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</Label>
            <PasswordInput
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password baru"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          {success && <p className="text-sm font-medium text-green-700 bg-green-50 p-3 rounded-md">{success}</p>}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} className="h-11 px-6 text-base">Update Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
