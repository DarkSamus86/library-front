import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import CreateBook from './pages/CreateBook'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminBooks from './pages/AdminBooks'
import AdminBookEdit from './pages/AdminBookEdit'
import AdminBookPrices from './pages/AdminBookPrices'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/books" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/books"
              element={
                <ProtectedRoute>
                  <Books />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books/create"
              element={
                <AdminRoute>
                  <CreateBook />
                </AdminRoute>
              }
            />
            <Route
              path="/books/:id"
              element={
                <ProtectedRoute>
                  <BookDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <AdminRoute>
                  <AdminBooks />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books/:id/edit"
              element={
                <AdminRoute>
                  <AdminBookEdit />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books/:id/prices"
              element={
                <AdminRoute>
                  <AdminBookPrices />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
