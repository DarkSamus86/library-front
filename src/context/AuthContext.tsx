import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import apiClient, { setTokens, clearTokens, setOnUnauthorized, getStoredRefreshToken } from '../api/client'
import type { UserResponse } from '../api/types'
import { getUserProfile } from '../api/users'

interface AuthState {
  user: UserResponse | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>
  register: (data: {
    email: string
    username: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function parseUserIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId ?? (payload.sub ? Number(payload.sub) : null)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
  })

  const fetchUser = useCallback(async (userId: number) => {
    try {
      const { data } = await getUserProfile(userId)
      setState({
        user: data,
        isAuthenticated: true,
        isAdmin: data.roles.includes('ROLE_ADMIN'),
        loading: false,
      })
    } catch (err) {
      clearTokens()
      setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false })
      throw err
    }
  }, [])

  useEffect(() => {
    const refresh = getStoredRefreshToken()
    if (refresh) {
      apiClient
        .post('/auth/refresh', { refreshToken: refresh })
        .then(({ data }) => {
          setTokens(data.accessToken, data.refreshToken)
          const userId = parseUserIdFromToken(data.accessToken)
          if (userId) fetchUser(userId)
          else setState((prev) => ({ ...prev, loading: false }))
        })
        .catch(() => {
          clearTokens()
          setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false })
        })
    } else {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [fetchUser])

  useEffect(() => {
    setOnUnauthorized(() => {
      setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false })
      navigate('/login')
    })
  }, [navigate])

  const login = useCallback(
    async (username: string, password: string) => {
      const { data } = await authApi.login({ username, password })
      setTokens(data.accessToken, data.refreshToken)
      const userId = parseUserIdFromToken(data.accessToken)
      if (userId) await fetchUser(userId)
    },
    [fetchUser],
  )

  const register = useCallback(
    async (regData: {
      email: string
      username: string
      password: string
      firstName: string
      lastName: string
    }) => {
      const { data } = await authApi.register(regData)
      setTokens(data.accessToken, data.refreshToken)
      const userId = parseUserIdFromToken(data.accessToken)
      if (userId) await fetchUser(userId)
    },
    [fetchUser],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearTokens()
      setState({ user: null, isAuthenticated: false, isAdmin: false, loading: false })
      navigate('/login')
    }
  }, [navigate])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
