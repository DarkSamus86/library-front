import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      navigate('/books')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Username
          <input name="username" value={form.username} onChange={handleChange} required />
        </label>
        <label>
          First Name
          <input name="firstName" value={form.firstName} onChange={handleChange} required />
        </label>
        <label>
          Last Name
          <input name="lastName" value={form.lastName} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
