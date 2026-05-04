export interface LoginRequest {
  nip: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  role: string
  message: string
}

export interface UserProfile {
  id_pengguna: number
  nip: string | null
  nama: string
  tempat_lahir: string | null
  tanggal_lahir: string | null
  fungsional: string | null
  tmt_golongan: string | null
  pendidikan: string | null
  kualifikasi: string | null
  tmt_kgb: string | null
  status_aktif: boolean
  tmt_jabatan: string | null
  tmt_pensiun: string | null
  created_at: string
  role: string
  jabatan: string | null
  pangkat: string | null
  golongan: string | null
  penempatan: string | null
  sertifikasi: string | null
}

export interface ProfileResponse {
  message: string
  data: UserProfile
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordResponse {
  message: string
}
