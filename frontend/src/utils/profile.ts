import { UserProfile } from "../types/auth";

export const getRoleLabel = (role?: string | null) => {
  const normalizedRole = (role || "").toLowerCase();

  if (normalizedRole === "pimpinan") return "Pimpinan";
  if (normalizedRole === "pegawai") return "Pegawai";
  if (normalizedRole === "admin") return "Admin";

  return role || "-";
};

export const getInitials = (name?: string | null) => {
  const initials = (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "U";
};

export const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const displayValue = (value?: string | number | boolean | null) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Aktif" : "Tidak Aktif";
  return String(value);
};

export const getProfileSections = (profile: UserProfile) => [
  {
    title: "Data Pribadi",
    fields: [
      { label: "NIP", value: displayValue(profile.nip) },
      { label: "Nama", value: displayValue(profile.nama) },
      { label: "Tempat Lahir", value: displayValue(profile.tempat_lahir) },
      { label: "Tanggal Lahir", value: formatDate(profile.tanggal_lahir) },
      { label: "Pendidikan", value: displayValue(profile.pendidikan) },
      { label: "Kualifikasi", value: displayValue(profile.kualifikasi) },
    ],
  },
  {
    title: "Data Kepegawaian",
    fields: [
      { label: "Status", value: displayValue(profile.status_aktif) },
      { label: "Fungsional", value: displayValue(profile.fungsional) },
      { label: "Jabatan", value: displayValue(profile.jabatan) },
      { label: "Pangkat", value: displayValue(profile.pangkat) },
      { label: "Golongan", value: displayValue(profile.golongan) },
      { label: "Penempatan", value: displayValue(profile.penempatan) },
      { label: "Sertifikasi", value: displayValue(profile.sertifikasi) },
    ],
  },
  {
    title: "Tanggal TMT",
    fields: [
      { label: "TMT Golongan", value: formatDate(profile.tmt_golongan) },
      { label: "TMT KGB", value: formatDate(profile.tmt_kgb) },
      { label: "TMT Jabatan", value: formatDate(profile.tmt_jabatan) },
      { label: "TMT Pensiun", value: formatDate(profile.tmt_pensiun) },
    ],
  },
];
