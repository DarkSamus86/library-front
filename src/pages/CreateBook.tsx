import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook } from '../api/books'
import type { CreateBookRequest } from '../api/types'

export default function CreateBook() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CreateBookRequest>({
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
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await createBook(form)
      navigate(`/books/${data.id}`)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create book'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <h1>Create Book</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <label>
          Title *
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Description
          <input name="description" value={form.description} onChange={handleChange} />
        </label>
        <label>
          ISBN
          <input name="isbn" value={form.isbn} onChange={handleChange} maxLength={13} />
        </label>
        <label>
          Price *
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Rental Price
          <input
            name="rentalPrice"
            type="number"
            step="0.01"
            min="0"
            value={form.rentalPrice}
            onChange={handleChange}
          />
        </label>
        <label>
          Deposit Amount
          <input
            name="depositAmount"
            type="number"
            step="0.01"
            min="0"
            value={form.depositAmount}
            onChange={handleChange}
          />
        </label>
        <label>
          Stock Count *
          <input
            name="stockCount"
            type="number"
            min="0"
            value={form.stockCount}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Published Year
          <input
            name="publishedYear"
            type="number"
            min="1000"
            max="2099"
            value={form.publishedYear}
            onChange={handleChange}
          />
        </label>
        <label>
          Cover URL
          <input name="coverUrl" value={form.coverUrl} onChange={handleChange} />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Book'}
        </button>
      </form>
    </div>
  )
}
