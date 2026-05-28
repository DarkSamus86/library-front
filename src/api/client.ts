import axios, { type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken: string | null = null
let refreshToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
}

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb
}

export function getStoredRefreshToken(): string | null {
  return refreshToken
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error)
    else if (token) p.resolve(token)
  })
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        })
        accessToken = data.accessToken
        refreshToken = data.refreshToken
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (err) {
        processQueue(err, null)
        clearTokens()
        onUnauthorized?.()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
