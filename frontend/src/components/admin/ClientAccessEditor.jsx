import React, { useState, useEffect } from 'react'
import { settingsService } from '../../services/settingsService'
import '../../styles/index.css'

const ClientAccessEditor = ({ onBack }) => {
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await settingsService.getClientAccessSettings()
      setBackgroundUrl(data?.background_url || '')
    } catch (e) {
      setError(e?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)')
      return
    }
    setUploading(true)
    setError('')
    try {
      const url = await settingsService.uploadClientAccessBackground(file)
      setBackgroundUrl(url || '')
      e.target.value = ''
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-loading-spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="maintenance-editor">
      <button
        type="button"
        onClick={onBack}
        className="admin-dashboard-logout-button"
        style={{ marginBottom: 24, background: 'transparent', color: '#000', border: '1px solid #000' }}
      >
        ← Back to dashboard
      </button>
      <h2 className="maintenance-editor__title">Client access background</h2>
      <p className="maintenance-editor__desc">
        This image is shown behind the password screen when clients open a gallery link. Use a high‑resolution image; it will scale responsively on desktop and mobile.
      </p>

      {error && <p className="maintenance-editor__error">{error}</p>}

      {backgroundUrl && (
        <div style={{ marginBottom: 24 }}>
          <p className="maintenance-editor__label" style={{ marginBottom: 8 }}>Current background</p>
          <div
            style={{
              maxWidth: 400,
              aspectRatio: '16/10',
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.1)',
              backgroundColor: '#f5f5f5'
            }}
          >
            <img
              src={backgroundUrl}
              alt="Current client access background"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      )}

      <div className="maintenance-editor__field">
        <label className="maintenance-editor__label" htmlFor="client-access-bg">
          {backgroundUrl ? 'Replace background image' : 'Upload background image'}
        </label>
        <input
          id="client-access-bg"
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={handleFile}
          style={{ display: 'block', marginTop: 8, fontSize: 14 }}
        />
        {uploading && <p style={{ marginTop: 8, color: '#525252', fontSize: 14 }}>Uploading…</p>}
      </div>
    </div>
  )
}

export default ClientAccessEditor
