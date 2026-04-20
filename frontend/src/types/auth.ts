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