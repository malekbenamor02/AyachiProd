import React, { useState, useEffect } from 'react'
import { settingsService } from '../../services/settingsService'

const MaintenanceEditor = ({ onBack }) => {
  const [enabled, setEnabled] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    settingsService
      .getMaintenance()
      .then((data) => {
        setEnabled(!!data?.enabled)
        setMessage(data?.message || "We're currently performing scheduled maintenance. Please check back soon.")
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      await settingsService.updateMaintenance({ enabled, message })
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-loading-spinner" />
        <p>Loading maintenance settings...</p>
      </div>
    )
  }

  return (
    <div className="maintenance-editor">
      <button type="button" onClick={onBack} className="admin-dashboard-logout-button" style={{ marginBottom: 24, background: 'transparent', color: '#000', border: '1px solid #000' }}>
        ← Back to dashboard
      </button>
      <h2 className="maintenance-editor__title">Maintenance mode</h2>
      <p className="maintenance-editor__desc">When enabled, visitors see a maintenance page instead of the site. Admin dashboard remains accessible.</p>
      <div className="maintenance-editor__toggle-wrap">
        <span className="maintenance-editor__label">Status</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          className={`maintenance-editor__toggle ${enabled ? 'maintenance-editor__toggle--on' : ''}`}
          onClick={() => setEnabled((e) => !e)}
        >
          <span className="maintenance-editor__toggle-knob" />
        </button>
        <span className="maintenance-editor__status">{enabled ? 'On' : 'Off'}</span>
      </div>
      <div className="maintenance-editor__field">
        <label className="maintenance-editor__label" htmlFor="maintenance-message">Custom message</label>
        <textarea
          id="maintenance-message"
          className="maintenance-editor__textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="We're currently performing scheduled maintenance. Please check back soon."
          rows={4}
        />
      </div>
      {error && <p className="maintenance-editor__error">{error}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="admin-dashboard-logout-button"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}

export default MaintenanceEditor
