import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBooksPaginated, softDeleteBook, hardDeleteBook, importBooks } from '../api/books'
import type { BookResponse, BookImportRequest } from '../api/types'
import { parseErrorMessage } from '../utils/errors'

export default function AdminBooks() {
  const navigate = useNavigate()
  const [books, setBooks] = useState<BookResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sort, setSort] = useState('title,asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importForm, setImportForm] = useState<BookImportRequest>({ query: '', limit: 20 })
  const [importing, setImporting] = useState(false)

  const loadBooks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getBooksPaginated(page, 20, sort)
      setBooks(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch {
      setError('Failed to load books')
    } finally {
      setLoading(false)
    }
  }, [page, sort])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  async function handleSoftDelete(id: number) {
    if (!confirm('Soft-delete this book?')) return
    try {
      await softDeleteBook(id)
      loadBooks()
    } catch (err) {
      setError(parseErrorMessage(err))
    }
  }

  async function handleHardDelete(id: number) {
    if (!confirm('Permanently delete this book? This cannot be undone!')) return
    try {
      await hardDeleteBook(id)
      loadBooks()
    } catch (err) {
      setError(parseErrorMessage(err))
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setImporting(true)
    try {
      if (!importForm.query && !importForm.title && !importForm.author) {
        setError('Specify at least one of: query, title, or author')
        return
      }
      await importBooks(importForm)
      setShowImport(false)
      setImportForm({ query: '', limit: 20 })
      setError('')
    } catch (err) {
      setError(parseErrorMessage(err))
    } finally {
      setImporting(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div>
      <h1>Manage Books</h1>
      {error && <div className="error">{error}</div>}

      <div className="admin-actions">
        <Link to="/books/create" className="btn-primary">Create Book</Link>
        <button onClick={() => setShowImport(!showImport)}>Import from Open Library</button>
      </div>

      {showImport && (
        <form onSubmit={handleImport} className="import-form">
          <h2>Import Books</h2>
          <label>
            Query
            <input
              value={importForm.query ?? ''}
              onChange={(e) => setImportForm((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Search query"
            />
          </label>
          <label>
            Title
            <input
              value={importForm.title ?? ''}
              onChange={(e) => setImportForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Filter by title"
            />
          </label>
          <label>
            Author
            <input
              value={importForm.author ?? ''}
              onChange={(e) => setImportForm((prev) => ({ ...prev, author: e.target.value }))}
              placeholder="Filter by author"
            />
          </label>
          <label>
            Limit
            <input
              type="number"
              min="1"
              max="100"
              value={importForm.limit ?? 20}
              onChange={(e) => setImportForm((prev) => ({ ...prev, limit: Number(e.target.value) }))}
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={importing}>
              {importing ? 'Importing...' : 'Import'}
            </button>
            <button type="button" onClick={() => setShowImport(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="sort-controls">
        <label>
          Sort by:
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
            <option value="title,asc">Title (A-Z)</option>
            <option value="title,desc">Title (Z-A)</option>
            <option value="price,asc">Price (Low-High)</option>
            <option value="price,desc">Price (High-Low)</option>
            <option value="publishedYear,desc">Year (Newest)</option>
            <option value="publishedYear,asc">Year (Oldest)</option>
          </select>
        </label>
      </div>

      <p className="total-count">Total: {totalElements} books</p>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Rental Price</th>
            <th>Stock</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </td>
              <td>${book.price.toFixed(2)}</td>
              <td>${book.rentalPrice.toFixed(2)}</td>
              <td>{book.stockCount}</td>
              <td>{book.publishedYear}</td>
              <td>
                <button onClick={() => navigate(`/admin/books/${book.id}/edit`)}>Edit</button>
                <button onClick={() => navigate(`/admin/books/${book.id}/prices`)}>Prices</button>
                <button className="btn-danger" onClick={() => handleSoftDelete(book.id)}>
                  Soft Delete
                </button>
                <button className="btn-danger" onClick={() => handleHardDelete(book.id)}>
                  Hard Delete
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
