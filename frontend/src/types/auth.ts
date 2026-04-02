export interface LoginRequest {
  nip: string
  password: string
}

export interface LoginResponse {
  token: string
  role: string
  message: string
}