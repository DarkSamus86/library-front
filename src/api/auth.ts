import apiClient from './client'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
} from './types'

export function login(data: LoginRequest) {
  return apiClient.post<AuthResponse>('/auth/login', data)
}

export function register(data: RegisterRequest) {
  return apiClient.post<AuthResponse>('/auth/register', data)
}

export function changePassword(data: ChangePasswordRequest) {
  return apiClient.post<void>('/auth/change-password', data)
}

export function logout() {
  return apiClient.post<void>('/auth/logout')
}
