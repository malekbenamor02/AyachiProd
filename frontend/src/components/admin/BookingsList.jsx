import React, { useState, useEffect } from 'react'
import { bookingsService } from '../../services/bookingsService'
import '../../styles/index.css'

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', label: 'Pending' },
  approved: { bg: '#D1FAE5', border: '#10B981', text: '#065F46', label: 'Approved' },
  declined: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', label: 'Declined' },
}

const BookingsList = ({ onBack }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await bookingsService.list()
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load bookings')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await bookingsService.update(id, { status })
      await load()
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const categoryName = (row) => {
    const cat = row.section_categories
    if (cat && (cat.name || cat.id)) return cat.name || '—'
    return row.category_id ? '—' : '—'
  }

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
    } catch {
      return d
    }
  }

  const formatTime = (t) => {
    if (!t) return ''
    if (typeof t === 'string' && t.match(/^\d{2}:\d{2}/)) return t.slice(0, 5)
    return t
  }

  if (loading) {
    return (
      <div className="bookings-list bookings-list--loading">
        <div className="admin-dashboard-loading-spinner" />
        <p>Loading bookings…</p>
      </div>
    )
  }

  return (
    <div className="bookings-list">
      <div className="bookings-list-header">
        <button type="button" onClick={onBack} className="sections-editor-back">
          ← Back
        </button>
        <h2 className="bookings-list-title">Session bookings</h2>
        <p className="bookings-list-desc">View and approve or decline requests. Use the calendar for a full schedule.</p>
      </div>

      {error && (
        <div className="sections-editor-error" role="alert">
          {error}
        </div>
      )}

      <div className="bookings-list-table-wrap">
        <table className="bookings-list-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Date</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className="bookings-list-empty">No bookings yet.</td>
              </tr>
            ) : (
              list.map((row) => {
                const sc = STATUS_COLORS[row.status] || STATUS_COLORS.pending
                return (
                  <tr key={row.id} className="bookings-list-row">
                    <td>
                      <strong>{row.full_name || '—'}</strong>
                    </td>
                    <td>
                      <div>{row.email}</div>
                      <div className="bookings-list-meta">{row.phone}</div>
                    </td>
                    <td>{categoryName(row)}</td>
                    <td>
                      {formatDate(row.session_date)}
                      {formatTime(row.session_time) && (
                        <span className="bookings-list-meta"> {formatTime(row.session_time)}</span>
                      )}
                    </td>
                    <td className="bookings-list-desc-cell">
                      <span title={row.description}>{row.description?.slice(0, 80)}{row.description?.length > 80 ? '…' : ''}</span>
                    </td>
                    <td>
                      <span
                        className="bookings-list-badge"
                        style={{ backgroundColor: sc.bg, borderColor: sc.border, color: sc.text }}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td>
                      <div className="bookings-list-actions">
                        <button
                          type="button"
                          className="bookings-list-btn bookings-list-btn--approve"
                          onClick={() => setStatus(row.id, 'approved')}
                          disabled={updatingId === row.id || row.status === 'approved'}
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="bookings-list-btn bookings-list-btn--decline"
                          onClick={() => setStatus(row.id, 'declined')}
                          disabled={updatingId === row.id || row.status === 'declined'}
                          title="Decline"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          className="bookings-list-btn bookings-list-btn--pending"
                          onClick={() => setStatus(row.id, 'pending')}
                          disabled={updatingId === row.id || row.status === 'pending'}
                          title="Pending"
                        >
                          Pending
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BookingsList
