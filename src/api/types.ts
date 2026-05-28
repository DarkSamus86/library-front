export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UserResponse {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  isActive: boolean
  isEmailVerified: boolean
  roles: string[]
}

export interface UpdateUserRequest {
  email?: string
  username?: string
  currentPassword: string
  firstName?: string
  lastName?: string
}

export interface BookResponse {
  id: number
  title: string
  description: string
  price: number
  rentalPrice: number
  depositAmount: number
  stockCount: number
  publishedYear: number
}

export interface CreateBookRequest {
  title: string
  description?: string
  isbn?: string
  price: number
  rentalPrice?: number
  depositAmount?: number
  stockCount: number
  publishedYear?: number
  coverUrl?: string
}

export interface UpdateBookRequest {
  title?: string
  description?: string
  isbn?: string
  price?: number
  rentalPrice?: number
  depositAmount?: number
  stockCount?: number
  publishedYear?: number
  coverUrl?: string
  isActive?: boolean
}

export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: { sorted: boolean; unsorted: boolean; empty: boolean }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  size: number
  number: number
  empty: boolean
}

export interface DashboardResponse {
  totalUsers: number
  activeUsers: number
  totalBooks: number
  activeBooks: number
  usersByRole: Record<string, number>
}

export interface AdminUserResponse {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  isActive: boolean
  isEmailVerified: boolean
  roles: string[]
  createdAt: string
  updatedAt: string
}

export interface ErrorResponse {
  status: number
  message: string
  timestamp: string
}
