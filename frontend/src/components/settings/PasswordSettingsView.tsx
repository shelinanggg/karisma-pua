import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useProfile } from "../../hooks/useProfile";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{ paddingRight: "2.5rem" }}
        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        tabIndex={-1}
        disabled={disabled}
        style={{
          position: "absolute",
          right: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          color: "#9ca3af",
        }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function RequiredStar() {
  return <span className="admin-required-star">*</span>;
}

function focusSettingField(id: string) {
  const element = document.getElementById(id) as HTMLInputElement | null;
  if (!element) return;

  element.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => element.focus(), 250);
}

export function PasswordSettingsView() {
  const { changePassword, saving } = useProfile(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError("");
    setSuccess("");
  }

  async function handleSubmit() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Semua kolom wajib diisi.");
      const firstEmptyField = !form.currentPassword ? "currentPassword" : !form.newPassword ? "newPassword" : "confirmPassword";
      focusSettingField(firstEmptyField);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    try {
      const result = await changePassword(form);
      setSuccess(result.message || "Password berhasil diubah.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengubah password.");
    }
  }

  const isFormComplete = Boolean(form.currentPassword && form.newPassword && form.confirmPassword);

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
            <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Password Saat Ini<RequiredStar /></Label>
            <PasswordInput
              id="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Masukkan password saat ini"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">Password Baru<RequiredStar /></Label>
            <PasswordInput
              id="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Masukkan password baru"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Konfirmasi Password Baru<RequiredStar /></Label>
            <PasswordInput
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password baru"
              disabled={saving}
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          {success && <p className="text-sm font-medium text-green-700 bg-green-50 p-3 rounded-md">{success}</p>}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={!isFormComplete || saving} className="admin-proceed-button h-11 px-6 text-base">
              {saving ? "Menyimpan..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
