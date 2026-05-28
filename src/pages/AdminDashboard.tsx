import { useEffect, useState } from 'react'
import { getDashboard, getAdminUsers, updateUserRoles, toggleUserStatus } from '../api/admin'
import { Link } from 'react-router-dom'
import type { DashboardResponse, AdminUserResponse } from '../api/types'

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState<number | null>(null)
  const [editRoles, setEditRoles] = useState('')

  async function loadDashboard() {
    try {
      const { data } = await getDashboard()
      setDashboard(data)
    } catch {
      setError('Failed to load dashboard')
    }
  }

  async function loadUsers() {
    try {
      const { data } = await getAdminUsers(page)
      setUsers(data.content)
      setTotalPages(data.totalPages)
    } catch {
      setError('Failed to load users')
    }
  }

  useEffect(() => {
    Promise.all([loadDashboard(), loadUsers()]).finally(() => setLoading(false))
  }, [page])

  async function handleRoleSave(userId: number) {
    const roles = editRoles.split(',').map((r) => r.trim()).filter(Boolean)
    try {
      await updateUserRoles(userId, roles)
      setEditingUser(null)
      loadUsers()
    } catch {
      setError('Failed to update roles')
    }
  }

  async function handleToggleStatus(userId: number, current: boolean) {
    try {
      await toggleUserStatus(userId, !current)
      loadUsers()
    } catch {
      setError('Failed to toggle status')
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <div className="error">{error}</div>}

      {dashboard && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{dashboard.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p>{dashboard.activeUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Books</h3>
            <p>{dashboard.totalBooks}</p>
          </div>
          <div className="stat-card">
            <h3>Active Books</h3>
            <p>{dashboard.activeBooks}</p>
          </div>
        </div>
      )}

      <div className="admin-actions">
        <Link to="/books/create" className="btn-primary">Create Book</Link>
      </div>

      <h2>Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                {editingUser === u.id ? (
                  <>
                    <input
                      value={editRoles}
                      onChange={(e) => setEditRoles(e.target.value)}
                      placeholder="ROLE_USER,ROLE_ADMIN"
                    />
                    <button onClick={() => handleRoleSave(u.id)}>Save</button>
                    <button onClick={() => setEditingUser(null)}>Cancel</button>
                  </>
                ) : (
                  u.roles.join(', ')
                )}
              </td>
              <td>{u.isActive ? 'Yes' : 'No'}</td>
              <td>
                <button
                  onClick={() => {
                    setEditingUser(u.id)
                    setEditRoles(u.roles.join(', '))
                  }}
                >
                  Edit Roles
                </button>
                <button onClick={() => handleToggleStatus(u.id, u.isActive)}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
