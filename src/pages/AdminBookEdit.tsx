import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBookById, updateBook } from '../api/books'
import type { UpdateBookRequest } from '../api/types'
import { parseErrorMessage, parseValidationErrors, type ValidationErrors } from '../utils/errors'

export default function AdminBookEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<UpdateBookRequest>({
    title: '',
    description: '',
    isbn: '',
    price: 0,
    rentalPrice: 0,
    depositAmount: 0,
    stockCount: 0,
    publishedYear: new Date().getFullYear(),
    coverUrl: '',
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getBookById(Number(id))
      .then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description,
          isbn: '',
          price: data.price,
          rentalPrice: data.rentalPrice,
          depositAmount: data.depositAmount,
          stockCount: data.stockCount,
          publishedYear: data.publishedYear,
          coverUrl: '',
        })
      })
      .catch((err) => setError(parseErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }))
    setValidationErrors((prev: ValidationErrors) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError('')
    setValidationErrors({})
    setSubmitting(true)
    try {
      await updateBook(Number(id), form)
      navigate(`/books/${id}`)
    } catch (err) {
      const fieldErrors = parseValidationErrors(err)
      if (fieldErrors) {
        setValidationErrors(fieldErrors)
      } else {
        setError(parseErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error && !id) return <div className="error">{error}</div>

  return (
    <div className="form-page">
      <h1>Edit Book</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Title *
          <input name="title" value={form.title ?? ''} onChange={handleChange} required />
          {validationErrors.title && <span className="field-error">{validationErrors.title}</span>}
        </label>
        <label>
          Description
          <textarea
            name="description"
            value={form.description ?? ''}
            onChange={handleChange}
            rows={3}
          />
          {validationErrors.description && (
            <span className="field-error">{validationErrors.description}</span>
          )}
        </label>
        <label>
          ISBN
          <input name="isbn" value={form.isbn ?? ''} onChange={handleChange} maxLength={50} />
          {validationErrors.isbn && <span className="field-error">{validationErrors.isbn}</span>}
        </label>
        <label>
          Price *
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price ?? ''}
            onChange={handleChange}
            required
          />
          {validationErrors.price && <span className="field-error">{validationErrors.price}</span>}
        </label>
        <label>
          Rental Price
          <input
            name="rentalPrice"
            type="number"
            step="0.01"
            min="0"
            value={form.rentalPrice ?? ''}
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
            min="0"
            value={form.depositAmount ?? ''}
            onChange={handleChange}
          />
          {validationErrors.depositAmount && (
            <span className="field-error">{validationErrors.depositAmount}</span>
          )}
        </label>
        <label>
          Stock Count *
          <input
            name="stockCount"
            type="number"
            min="0"
            value={form.stockCount ?? ''}
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
            min="1000"
            max="2099"
            value={form.publishedYear ?? ''}
            onChange={handleChange}
          />
          {validationErrors.publishedYear && (
            <span className="field-error">{validationErrors.publishedYear}</span>
          )}
        </label>
        <label>
          Cover URL
          <input name="coverUrl" value={form.coverUrl ?? ''} onChange={handleChange} />
          {validationErrors.coverUrl && (
            <span className="field-error">{validationErrors.coverUrl}</span>
          )}
        </label>
        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
