import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBookById, updateBook, softDeleteBook, hardDeleteBook } from '../api/books'
import { useAuth } from '../context/AuthContext'
import type { BookResponse, UpdateBookRequest } from '../api/types'
import { parseErrorMessage, parseValidationErrors, type ValidationErrors } from '../utils/errors'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [book, setBook] = useState<BookResponse | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<UpdateBookRequest>({})
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getBookById(Number(id))
      .then(({ data }) => {
        setBook(data)
        setEditForm({
          title: data.title,
          description: data.description,
          price: data.price,
          rentalPrice: data.rentalPrice,
          depositAmount: data.depositAmount,
          stockCount: data.stockCount,
          publishedYear: data.publishedYear,
        })
      })
      .catch((err) => setError(parseErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }))
    setValidationErrors((prev: ValidationErrors) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!book) return
    setError('')
    setValidationErrors({})
    try {
      const { data } = await updateBook(book.id, editForm)
      setBook(data)
      setEditing(false)
    } catch (err) {
      const fieldErrors = parseValidationErrors(err)
      if (fieldErrors) {
        setValidationErrors(fieldErrors)
      } else {
        setError(parseErrorMessage(err))
      }
    }
  }

  async function handleSoftDelete() {
    if (!book || !confirm('Soft-delete this book?')) return
    try {
      await softDeleteBook(book.id)
      navigate('/books')
    } catch (err) {
      setError(parseErrorMessage(err))
    }
  }

  async function handleHardDelete() {
    if (!book || !confirm('Permanently delete this book? This cannot be undone!')) return
    try {
      await hardDeleteBook(book.id)
      navigate('/books')
    } catch (err) {
      setError(parseErrorMessage(err))
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!book) return <div className="error">Book not found</div>

  if (editing && isAdmin) {
    return (
      <div className="form-page">
        <h1>Edit Book</h1>
        <form onSubmit={handleUpdate}>
          {error && <div className="error">{error}</div>}
          <label>
            Title
            <input name="title" value={editForm.title ?? ''} onChange={handleChange} required />
            {validationErrors.title && (
              <span className="field-error">{validationErrors.title}</span>
            )}
          </label>
          <label>
            Description
            <input
              name="description"
              value={editForm.description ?? ''}
              onChange={handleChange}
            />
            {validationErrors.description && (
              <span className="field-error">{validationErrors.description}</span>
            )}
          </label>
          <label>
            Price
            <input
              name="price"
              type="number"
              step="0.01"
              value={editForm.price ?? ''}
              onChange={handleChange}
              required
            />
            {validationErrors.price && (
              <span className="field-error">{validationErrors.price}</span>
            )}
          </label>
          <label>
            Rental Price
            <input
              name="rentalPrice"
              type="number"
              step="0.01"
              value={editForm.rentalPrice ?? ''}
              onChange={handleChange}
            />
            {validationErrors.rentalPrice && (
              <span className="field-error">{validationErrors.rentalPrice}</span>
            )}
          </label>
          <label>
            Deposit Amount
            <input
              name="depositAmount"
              type="number"
              step="0.01"
              value={editForm.depositAmount ?? ''}
              onChange={handleChange}
            />
            {validationErrors.depositAmount && (
              <span className="field-error">{validationErrors.depositAmount}</span>
            )}
          </label>
          <label>
            Stock Count
            <input
              name="stockCount"
              type="number"
              value={editForm.stockCount ?? ''}
              onChange={handleChange}
              required
            />
            {validationErrors.stockCount && (
              <span className="field-error">{validationErrors.stockCount}</span>
            )}
          </label>
          <label>
            Published Year
            <input
              name="publishedYear"
              type="number"
              value={editForm.publishedYear ?? ''}
              onChange={handleChange}
            />
            {validationErrors.publishedYear && (
              <span className="field-error">{validationErrors.publishedYear}</span>
            )}
          </label>
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="book-detail">
      <Link to="/books" className="back-link">← Back to Books</Link>
      <h1>{book.title}</h1>
      <p className="book-description">{book.description}</p>
      <table className="detail-table">
        <tbody>
          <tr><td>Price</td><td>${book.price.toFixed(2)}</td></tr>
          <tr><td>Rental Price</td><td>${book.rentalPrice.toFixed(2)}</td></tr>
          <tr><td>Deposit</td><td>${book.depositAmount.toFixed(2)}</td></tr>
          <tr><td>Stock</td><td>{book.stockCount}</td></tr>
          <tr><td>Published Year</td><td>{book.publishedYear}</td></tr>
        </tbody>
      </table>

      {isAdmin && (
        <div className="admin-actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={() => navigate(`/admin/books/${book.id}/prices`)}>Update Prices</button>
          <button className="btn-danger" onClick={handleSoftDelete}>
            Soft Delete
          </button>
          <button className="btn-danger" onClick={handleHardDelete}>
            Hard Delete
          </button>
        </div>
      )}
    </div>
  )
}
