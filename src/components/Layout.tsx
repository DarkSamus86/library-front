import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Library</Link>
        <div className="navbar-links">
          <Link to="/books">Books</Link>
          {isAuthenticated && <Link to="/profile">Profile</Link>}
          {isAdmin && <Link to="/admin">Admin</Link>}
          {isAdmin && <Link to="/admin/books">Manage Books</Link>}
        </div>
        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <span>{user?.username}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
