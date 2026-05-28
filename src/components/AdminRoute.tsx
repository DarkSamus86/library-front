import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
