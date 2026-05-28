import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../api/auth'
import { updateUserProfile } from '../api/users'
import type { UpdateUserRequest } from '../api/types'

export default function Profile() {
  const { user, isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<UpdateUserRequest>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    currentPassword: '',
  })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' })
  const [showPassChange, setShowPassChange] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        currentPassword: '',
      })
    }
  }, [user])

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await updateUserProfile(user.id, form)
      setSuccess('Profile updated')
      setEditing(false)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Update failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await changePassword(passForm)
      setSuccess('Password changed')
      setShowPassChange(false)
      setPassForm({ currentPassword: '', newPassword: '' })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Password change failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return <div className="loading">Loading...</div>

  return (
    <div className="profile-page">
      <h1>Profile</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <table className="detail-table">
        <tbody>
          <tr><td>ID</td><td>{user.id}</td></tr>
          <tr><td>Username</td><td>{user.username}</td></tr>
          <tr><td>Email</td><td>{user.email}</td></tr>
          <tr><td>Name</td><td>{user.firstName} {user.lastName}</td></tr>
          <tr><td>Roles</td><td>{user.roles.join(', ')}</td></tr>
          <tr><td>Active</td><td>{user.isActive ? 'Yes' : 'No'}</td></tr>
          <tr><td>Email Verified</td><td>{user.isEmailVerified ? 'Yes' : 'No'}</td></tr>
        </tbody>
      </table>

      <button onClick={() => setEditing(!editing)}>
        {editing ? 'Cancel' : 'Edit Profile'}
      </button>

      <button onClick={() => setShowPassChange(!showPassChange)}>
        {showPassChange ? 'Cancel' : 'Change Password'}
      </button>

      {isAdmin && <span className="admin-badge">ADMIN</span>}

      {editing && (
        <form onSubmit={handleProfileUpdate} className="profile-form">
          <h2>Edit Profile</h2>
          <label>
            Email
            <input
              name="email"
              value={form.email ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </label>
          <label>
            Username
            <input
              name="username"
              value={form.username ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
          </label>
          <label>
            First Name
            <input
              name="firstName"
              value={form.firstName ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
            />
          </label>
          <label>
            Last Name
            <input
              name="lastName"
              value={form.lastName ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
            />
          </label>
          <label>
            Current Password *
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>Save</button>
        </form>
      )}

      {showPassChange && (
        <form onSubmit={handlePasswordChange} className="profile-form">
          <h2>Change Password</h2>
          <label>
            Current Password
            <input
              name="currentPassword"
              type="password"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
          </label>
          <label>
            New Password
            <input
              name="newPassword"
              type="password"
              value={passForm.newPassword}
              onChange={(e) => setPassForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>Change Password</button>
        </form>
      )}
    </div>
  )
}
