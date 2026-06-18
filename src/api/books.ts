import apiClient from './client'
import type {
  BookResponse,
  CreateBookRequest,
  PageResponse,
  UpdateBookRequest,
  BookPricesRequest,
  BookImportRequest,
} from './types'

export function getBooksPaginated(page = 0, size = 10, sort = 'title,asc') {
  return apiClient.get<PageResponse<BookResponse>>('/api/v1/books', {
    params: { page, size, sort },
  })
}

export function getAllBooks() {
  return apiClient.get<BookResponse[]>('/api/v1/books/all')
}

export function getBookById(id: number) {
  return apiClient.get<BookResponse>(`/api/v1/books/${id}`)
}

export function searchBooks(title: string) {
  return apiClient.get<BookResponse[]>('/api/v1/books/search', {
    params: { title },
  })
}

export function createBook(data: CreateBookRequest) {
  return apiClient.post<BookResponse>('/api/v1/books', data)
}

export function updateBook(id: number, data: UpdateBookRequest) {
  return apiClient.put<BookResponse>(`/api/v1/books/${id}`, data)
}

export function patchBook(id: number, data: Partial<UpdateBookRequest>) {
  return apiClient.patch<BookResponse>(`/api/v1/books/${id}`, data)
}

export function updateBookPrices(id: number, data: BookPricesRequest) {
  return apiClient.patch<BookResponse>(`/api/v1/books/${id}/prices`, data)
}

export function softDeleteBook(id: number) {
  return apiClient.delete<void>(`/api/v1/books/${id}`)
}

export function hardDeleteBook(id: number) {
  return apiClient.delete<void>(`/api/v1/books/hard-delete/${id}`)
}

export function importBooks(data: BookImportRequest) {
  return apiClient.post<void>('/api/v1/books/import', data)
}
