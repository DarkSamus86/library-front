import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBooksPaginated, searchBooks } from '../api/books'
import type { BookResponse } from '../api/types'

export default function Books() {
  const [books, setBooks] = useState<BookResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchTitle, setSearchTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadBooks() {
    setLoading(true)
    setError('')
    try {
      if (searchTitle) {
        const { data } = await searchBooks(searchTitle)
        setBooks(data)
        setTotalPages(1)
        setTotalElements(data.length)
      } else {
        const { data } = await getBooksPaginated(page)
        setBooks(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      }
    } catch {
      setError('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [page])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(0)
    loadBooks()
  }

  return (
    <div>
      <h1>Books</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <button type="submit">Search</button>
        {searchTitle && (
          <button
            type="button"
            onClick={() => {
              setSearchTitle('')
              setPage(0)
            }}
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : books.length === 0 ? (
        <p className="empty">No books found</p>
      ) : (
        <>
          <p className="total-count">Total: {totalElements} books</p>
          <div className="book-grid">
            {books.map((book) => (
              <Link to={`/books/${book.id}`} key={book.id} className="book-card">
                <h3>{book.title}</h3>
                <p className="book-description">{book.description}</p>
                <div className="book-meta">
                  <span className="price">${book.price.toFixed(2)}</span>
                  <span className="stock">Stock: {book.stockCount}</span>
                </div>
              </Link>
            ))}
          </div>

          {!searchTitle && totalPages > 1 && (
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
        </>
      )}
    </div>
  )
}
