import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Header from '../components/Portfolio/Header'
import Footer from '../components/Portfolio/Footer'
import Cursor from '../components/common/Cursor'
import ThemeDatePicker from '../components/common/ThemeDatePicker'
import ThemeTimePicker from '../components/common/ThemeTimePicker'
import api from '../services/api'
import { bookingsService } from '../services/bookingsService'
import '../styles/index.css'

const BookSession = () => {
  const [categories, setCategories] = useState([])
  const [loadingCat, setLoadingCat] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    category_id: '',
    session_date: '',
    session_time: '',
    description: '',
  })

  // Scroll to top when page loads (e.g. from home "Book Session" click)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/api/section-categories')
        const data = res.data?.data ?? []
        if (!cancelled) setCategories(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!cancelled) setCategories([])
      } finally {
        if (!cancelled) setLoadingCat(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const today = new Date().toISOString().slice(0, 10)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^\d\s]/g, '')
    const digitsOnly = raw.replace(/\s/g, '')
    if (digitsOnly.length <= 8) {
      setForm((prev) => ({ ...prev, phone: raw }))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { full_name, phone, email, category_id, session_date, description } = form
    if (!full_name?.trim()) {
      setError('Full name is required.')
      return
    }
    if (!phone?.trim() || !phone.replace(/\D/g, '')) {
      setError('Phone number is required.')
      return
    }
    if (!email?.trim()) {
      setError('Email is required.')
      return
    }
    if (!session_date) {
      setError('Date is required.')
      return
    }
    if (!description?.trim()) {
      setError('Description / notes are required. Tell us what you want or any notes.')
      return
    }
    setSubmitting(true)
    try {
      const phoneDigits = phone.replace(/\D/g, '')
      const fullPhone = phoneDigits ? `+216${phoneDigits}` : ''
      await bookingsService.create({
        full_name: full_name.trim(),
        phone: fullPhone,
        email: email.trim(),
        category_id: category_id || undefined,
        session_date,
        session_time: form.session_time?.trim() || undefined,
        description: description.trim(),
      })
      setSubmitted(true)
      window.scrollTo(0, 0)
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Booking Received - Ayachi Prod</title>
          <meta name="description" content="Your session request has been received. We will get back to you soon." />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href="https://ayachiprod.com/book" />
        </Helmet>
        <Cursor />
        <Header />
        <section className="book-session book-session--success">
          <div className="book-session-hero">
            <span className="book-session-hero-label">Request received</span>
            <h1 className="book-session-hero-title">Thank you</h1>
          </div>
          <div className="book-session-inner book-session-inner--narrow">
            <p className="book-session-success-text">
              Your session request has been received. We will get back to you soon to confirm date and details.
            </p>
            <Link to="/" className="book-session-back">Back to home</Link>
          </div>
        </section>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Book a Session - Ayachi Prod | Professional Photography</title>
        <meta name="description" content="Book a photography session with Ayachi Prod. Weddings, portraits, fashion, and events. Fill in your details and we'll get back to you." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ayachiprod.com/book" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ayachiprod.com/book" />
        <meta property="og:title" content="Book a Session - Ayachi Prod" />
        <meta property="og:description" content="Book a photography session. Weddings, portraits, fashion, and events. We'll get back to you to confirm." />
        <meta property="og:image" content="https://ayachiprod.com/og-image.png" />
        <meta property="og:site_name" content="Ayachi Prod" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://ayachiprod.com/book" />
        <meta name="twitter:title" content="Book a Session - Ayachi Prod" />
        <meta name="twitter:description" content="Book a photography session. Weddings, portraits, fashion, and events." />
        <meta name="twitter:image" content="https://ayachiprod.com/og-image.png" />
      </Helmet>
      <Cursor />
      <Header />
      <div className="book-session">
        <section className="book-session-hero" aria-label="Book a session">
          <span className="book-session-hero-label">Reserve your session</span>
          <h1 className="book-session-hero-title">Book a session</h1>
          <p className="book-session-hero-intro">
            Fill in your details and what you have in mind. All fields are required.
          </p>
        </section>

        <section className="book-session-form-wrap">
          <form className="book-session-form" onSubmit={handleSubmit}>
            {error && <p className="book-session-error">{error}</p>}

            <div className="book-session-form-grid">
              <div className="book-session-field book-session-field--reveal">
                <label className="book-session-label" htmlFor="full_name">Full name</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  className="book-session-input"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="book-session-field book-session-field--reveal">
                <label className="book-session-label" htmlFor="phone">Phone number</label>
                <div className="book-session-phone-wrap">
                  <span className="book-session-phone-prefix">+216</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className="book-session-input book-session-phone-input"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    required
                    placeholder="12 345 678"
                  />
                </div>
              </div>

              <div className="book-session-field book-session-field--reveal">
                <label className="book-session-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="book-session-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="book-session-field book-session-field--reveal">
                <label className="book-session-label" htmlFor="category_id">Category</label>
                <select
                  id="category_id"
                  name="category_id"
                  className="book-session-input book-session-select"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {loadingCat && <span className="book-session-hint">Loading categories�</span>}
              </div>

              <div className="book-session-field book-session-field--reveal">
                <label className="book-session-label" htmlFor="session_date">Date</label>
                <ThemeDatePicker
                  id="session_date"
                  name="session_date"
                  value={form.session_date}
                  onChange={(val) => setForm((prev) => ({ ...prev, session_date: val }))}
                  min={today}
                  className="book-session-input"
                  placeholder="Select date"
                  required
                />
              </div>

              <div className="book-session-field book-session-field--reveal">
                <label className="book-session-label" htmlFor="session_time">Time (optional)</label>
                <ThemeTimePicker
                  id="session_time"
                  name="session_time"
                  value={form.session_time}
                  onChange={(v) => setForm((prev) => ({ ...prev, session_time: v }))}
                  placeholder="Select time (optional)"
                />
              </div>
            </div>

            <div className="book-session-field book-session-field--full book-session-field--reveal">
              <label className="book-session-label" htmlFor="description">Description / notes</label>
              <textarea
                id="description"
                name="description"
                className="book-session-input book-session-textarea"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="What you want exactly, location ideas, or any notes�"
                rows={4}
              />
            </div>

            <div className="book-session-submit-wrap">
              <button type="submit" className="book-session-submit" disabled={submitting}>
                {submitting ? 'Sending�' : 'Send request'}
              </button>
            </div>
          </form>
        </section>
      </div>
      <Footer />
    </>
  )
}

export default BookSession
