import React, { useState, useEffect, useMemo } from 'react'
import { bookingsService } from '../../services/bookingsService'
import api from '../../services/api'
import '../../styles/index.css'

const STATUS_STYLE = {
  pending: { bg: '#FEF3C7', dot: '#F59E0B' },
  approved: { bg: '#D1FAE5', dot: '#10B981' },
  declined: { bg: '#FEE2E2', dot: '#EF4444' },
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const daysInMonth = last.getDate()
  const total = startPad + daysInMonth
  const rows = Math.ceil(total / 7)
  const grid = []
  let day = 1
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < 7; c++) {
      const i = r * 7 + c
      if (i < startPad || day > daysInMonth) {
        row.push({ date: null, key: `e-${r}-${c}` })
      } else {
        row.push({ date: new Date(year, month, day), key: `d-${year}-${month}-${day}` })
        day++
      }
    }
    grid.push(row)
  }
  return grid
}

function dateKey(d) {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const SessionsCalendar = ({ onBack }) => {
  const [bookings, setBookings] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [current, setCurrent] = useState(() => {
    const n = new Date()
    return { year: n.getFullYear(), month: n.getMonth() }
  })
  const [modal, setModal] = useState(null) // { booking } or null
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState(null)

  const loadBookings = async () => {
    try {
      const data = await bookingsService.list()
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load bookings')
      setBookings([])
    }
  }

  const loadCategories = async () => {
    try {
      const res = await api.get('/api/section-categories')
      setCategories(res.data?.data ?? [])
    } catch {
      setCategories([])
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([loadBookings(), loadCategories()]).finally(() => setLoading(false))
  }, [])

  const byDate = useMemo(() => {
    const map = {}
    bookings.forEach((b) => {
      const k = dateKey(new Date(b.session_date))
      if (!map[k]) map[k] = []
      map[k].push(b)
    })
    return map
  }, [bookings])

  const grid = useMemo(() => getMonthGrid(current.year, current.month), [current.year, current.month])

  const prevMonth = () => {
    setCurrent((c) => {
      if (c.month === 0) return { year: c.year - 1, month: 11 }
      return { year: c.year, month: c.month - 1 }
    })
  }

  const nextMonth = () => {
    setCurrent((c) => {
      if (c.month === 11) return { year: c.year + 1, month: 0 }
      return { year: c.year, month: c.month + 1 }
    })
  }

  const openModal = (booking) => {
    setModal(booking)
    setEditForm({
      session_date: booking.session_date || '',
      session_time: booking.session_time || '',
      description: booking.description || '',
      admin_notes: booking.admin_notes || '',
      status: booking.status || 'pending',
      full_name: booking.full_name || '',
      phone: booking.phone || '',
      email: booking.email || '',
      category_id: booking.category_id || '',
    })
  }

  const closeModal = () => {
    setModal(null)
    setEditForm(null)
    setSaving(false)
  }

  const saveEdit = async () => {
    if (!modal || !editForm) return
    setSaving(true)
    try {
      await bookingsService.update(modal.id, {
        session_date: editForm.session_date,
        session_time: editForm.session_time || null,
        description: editForm.description,
        admin_notes: editForm.admin_notes,
        status: editForm.status,
        full_name: editForm.full_name,
        phone: editForm.phone,
        email: editForm.email,
        category_id: editForm.category_id || null,
      })
      await loadBookings()
      closeModal()
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="sessions-calendar sessions-calendar--loading">
        <div className="admin-dashboard-loading-spinner" />
        <p>Loading calendar…</p>
      </div>
    )
  }

  return (
    <div className="sessions-calendar">
      <div className="sessions-calendar-header">
        <button type="button" onClick={onBack} className="sections-editor-back">
          ← Back
        </button>
        <h2 className="sessions-calendar-title">Work calendar</h2>
        <p className="sessions-calendar-desc">All sessions. Click an event to edit date or details.</p>
      </div>

      {error && (
        <div className="sections-editor-error" role="alert">
          {error}
        </div>
      )}

      <div className="sessions-calendar-toolbar">
        <button type="button" onClick={prevMonth} className="sessions-calendar-nav" aria-label="Previous month">
          ←
        </button>
        <h3 className="sessions-calendar-month">
          {MONTHS[current.month]} {current.year}
        </h3>
        <button type="button" onClick={nextMonth} className="sessions-calendar-nav" aria-label="Next month">
          →
        </button>
      </div>

      <div className="sessions-calendar-grid-wrap">
        <table className="sessions-calendar-grid">
          <thead>
            <tr>
              {DAY_NAMES.map((d) => (
                <th key={d} className="sessions-calendar-day-name">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell) => {
                  const k = cell.date ? dateKey(cell.date) : ''
                  const dayBookings = (byDate[k] || []).sort(
                    (a, b) => (a.session_time || '').localeCompare(b.session_time || '')
                  )
                  const isToday =
                    cell.date &&
                    new Date().toDateString() === cell.date.toDateString()
                  return (
                    <td key={cell.key} className={`sessions-calendar-day ${!cell.date ? 'sessions-calendar-day--empty' : ''} ${isToday ? 'sessions-calendar-day--today' : ''}`}>
                      {cell.date && (
                        <>
                          <span className="sessions-calendar-day-num">{cell.date.getDate()}</span>
                          <div className="sessions-calendar-events">
                            {dayBookings.map((b) => {
                              const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  className="sessions-calendar-event"
                                  style={{ backgroundColor: st.bg, borderLeftColor: st.dot }}
                                  onClick={() => openModal(b)}
                                >
                                  <span className="sessions-calendar-event-name">{b.full_name}</span>
                                  {b.session_time && (
                                    <span className="sessions-calendar-event-time">{String(b.session_time).slice(0, 5)}</span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sessions-calendar-legend">
        <span className="sessions-calendar-legend-item" style={{ backgroundColor: STATUS_STYLE.pending.bg, borderLeftColor: STATUS_STYLE.pending.dot }}>Pending</span>
        <span className="sessions-calendar-legend-item" style={{ backgroundColor: STATUS_STYLE.approved.bg, borderLeftColor: STATUS_STYLE.approved.dot }}>Approved</span>
        <span className="sessions-calendar-legend-item" style={{ backgroundColor: STATUS_STYLE.declined.bg, borderLeftColor: STATUS_STYLE.declined.dot }}>Declined</span>
      </div>

      {modal && editForm && (
        <div className="sessions-calendar-modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="sessions-calendar-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="sessions-calendar-modal-title">Edit session</h3>
            <div className="sessions-calendar-modal-body">
              <div className="book-session-field">
                <label className="book-session-label">Full name</label>
                <input
                  className="book-session-input"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                />
              </div>
              <div className="book-session-field">
                <label className="book-session-label">Phone</label>
                <input
                  className="book-session-input"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="book-session-field">
                <label className="book-session-label">Email</label>
                <input
                  type="email"
                  className="book-session-input"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="book-session-field">
                <label className="book-session-label">Category</label>
                <select
                  className="book-session-input book-session-select"
                  value={editForm.category_id}
                  onChange={(e) => setEditForm((f) => ({ ...f, category_id: e.target.value }))}
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="book-session-row">
                <div className="book-session-field">
                  <label className="book-session-label">Date</label>
                  <input
                    type="date"
                    className="book-session-input"
                    value={editForm.session_date}
                    onChange={(e) => setEditForm((f) => ({ ...f, session_date: e.target.value }))}
                  />
                </div>
                <div className="book-session-field">
                  <label className="book-session-label">Time</label>
                  <input
                    type="time"
                    className="book-session-input"
                    value={editForm.session_time || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, session_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="book-session-field">
                <label className="book-session-label">Description / notes (client)</label>
                <textarea
                  className="book-session-input book-session-textarea"
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="book-session-field">
                <label className="book-session-label">Admin notes</label>
                <textarea
                  className="book-session-input book-session-textarea"
                  rows={2}
                  value={editForm.admin_notes || ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, admin_notes: e.target.value }))}
                  placeholder="Internal notes"
                />
              </div>
              <div className="book-session-field">
                <label className="book-session-label">Status</label>
                <select
                  className="book-session-input book-session-select"
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
            <div className="sessions-calendar-modal-actions">
              <button type="button" onClick={closeModal} className="sections-editor-btn sections-editor-btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={saveEdit} disabled={saving} className="sections-editor-btn sections-editor-btn-primary">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionsCalendar
