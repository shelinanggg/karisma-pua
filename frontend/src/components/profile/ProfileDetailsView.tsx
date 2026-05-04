import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { useProfile } from "../../hooks/useProfile";
import { getInitials, getProfileFields, getRoleLabel } from "../../utils/profile";

type ProfileDetailsViewProps = {
  subtitle?: string;
};

export function ProfileDetailsView({ subtitle = "Data pengguna" }: ProfileDetailsViewProps) {
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profil</h1>
          <p className="text-gray-500 mt-1 text-base">{subtitle}</p>
        </div>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profil</h1>
          <p className="text-gray-500 mt-1 text-base">{subtitle}</p>
        </div>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error || "Data profil tidak ditemukan."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fields = getProfileFields(profile);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profil</h1>
        <p className="text-gray-500 mt-1 text-base">{subtitle}</p>
      </div>

      <Card>
        <CardHeader className="pb-1">
          <div className="flex items-center" style={{ gap: 24 }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {getInitials(profile.nama)}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{profile.nama}</p>
              <p className="text-sm text-gray-500">
                {profile.nip ?? "-"} - {getRoleLabel(profile.role)}
              </p>
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
                  className="bg-gray-50 border-gray-200 text-gray-500 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
