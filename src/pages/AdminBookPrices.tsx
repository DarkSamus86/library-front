import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBookById, updateBookPrices } from '../api/books'
import type { BookPricesRequest } from '../api/types'
import { parseErrorMessage, parseValidationErrors, type ValidationErrors } from '../utils/errors'

export default function AdminBookPrices() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<BookPricesRequest>({ price: 0 })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bookTitle, setBookTitle] = useState('')

  useEffect(() => {
    if (!id) return
    getBookById(Number(id))
      .then(({ data }) => {
        setBookTitle(data.title)
        setForm({
          price: data.price,
          rentalPrice: data.rentalPrice,
          depositAmount: data.depositAmount,
        })
      })
      .catch((err) => setError(parseErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
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
    setSuccess('')
    setValidationErrors({})
    setSubmitting(true)
    try {
      await updateBookPrices(Number(id), form)
      setSuccess('Prices updated successfully')
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
      <h1>Update Prices — {bookTitle}</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit}>
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
        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Prices'}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
