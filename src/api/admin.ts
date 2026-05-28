import apiClient from './client'
import type { DashboardResponse, AdminUserResponse, PageResponse } from './types'

export function getDashboard() {
  return apiClient.get<DashboardResponse>('/admin/dashboard')
}

export function getAdminUsers(page = 0, size = 20, sort = 'id,desc') {
  return apiClient.get<PageResponse<AdminUserResponse>>('/admin/users', {
    params: { page, size, sort },
  })
}

export function getAdminUser(id: number) {
  return apiClient.get<AdminUserResponse>(`/admin/users/${id}`)
}

export function updateUserRoles(id: number, roles: string[]) {
  return apiClient.put<AdminUserResponse>(`/admin/users/${id}/roles`, { roles })
}

export function toggleUserStatus(id: number, isActive: boolean) {
  return apiClient.patch<AdminUserResponse>(`/admin/users/${id}/status`, { isActive })
}
