import apiClient from './client'
import type { UserResponse, UpdateUserRequest } from './types'

export function getUserProfile(id: number) {
  return apiClient.get<UserResponse>(`/user/${id}`)
}

export function updateUserProfile(id: number, data: UpdateUserRequest) {
  return apiClient.put<UserResponse>(`/user/${id}`, data)
}
