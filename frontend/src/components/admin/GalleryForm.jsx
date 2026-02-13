import React, { useState, useEffect } from 'react'
import { galleryService } from '../../services/galleryService'
import ThemeDatePicker from '../common/ThemeDatePicker'
import '../../styles/index.css'

const GalleryForm = ({ galleryId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    client_name: '',
    client_email: '',
    password: '',
    description: '',
    event_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [backgroundFile, setBackgroundFile] = useState(null)
  const [currentBackgroundUrl, setCurrentBackgroundUrl] = useState('')
  const [removeBackground, setRemoveBackground] = useState(false)

  useEffect(() => {
    if (galleryId) {
      loadGallery()
    }
  }, [galleryId])

  const loadGallery = async () => {
    try {
      const gallery = await galleryService.getGalleryById(galleryId)
      setFormData({
        name: gallery.name || '',
        client_name: gallery.client_name || '',
        client_email: gallery.client_email || '',
        password: '',
        description: gallery.description || '',
        event_date: gallery.event_date || ''
      })
      setCurrentBackgroundUrl(gallery.client_access_background_url || '')
      setRemoveBackground(false)
    } catch (err) {
      setError('Failed to load gallery: ' + (err.message || ''))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (galleryId) {
        const updatePayload = { ...formData }
        if (removeBackground) updatePayload.client_access_background_url = null
        await galleryService.updateGallery(galleryId, updatePayload)
        if (backgroundFile) {
          await galleryService.uploadGalleryBackground(galleryId, backgroundFile)
        }
      } else {
        const created = await galleryService.createGallery(formData)
        const id = created?.id
        if (id && backgroundFile) {
          await galleryService.uploadGalleryBackground(id, backgroundFile)
        }
      }
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to save gallery')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div style={{
      padding: '48px',
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>
        {galleryId ? 'Edit Gallery' : 'Create New Gallery'}
      </h2>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '24px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 400 }}>
            Gallery Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 400 }}>
            Client Name
          </label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 400 }}>
            Client Email
          </label>
          <input
            type="email"
            name="client_email"
            value={formData.client_email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 400 }}>
            Password {galleryId ? '(leave empty to keep current)' : '*'}
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!galleryId}
              placeholder={galleryId ? 'Leave empty to keep current' : ''}
              style={{
                width: '100%',
                padding: '12px 44px 12px 12px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                padding: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#525252',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 400 }} htmlFor="event_date">
            Event Date
          </label>
          <ThemeDatePicker
            id="event_date"
            name="event_date"
            value={formData.event_date}
            onChange={(val) => setFormData((prev) => ({ ...prev, event_date: val }))}
            placeholder="Select date"
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 400 }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              resize: 'vertical'
            }}
          />
        </div>

        <div className="gallery-form-field" style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 400 }}>
            Client access background (optional)
          </label>
          <p style={{ fontSize: '13px', color: '#737373', marginBottom: '12px' }}>
            Image shown behind the password screen when clients open this gallery link. Leave empty for white background.
          </p>
          {galleryId && currentBackgroundUrl && !removeBackground && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ maxWidth: 280, aspectRatio: '16/10', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#f5f5f5' }}>
                <img src={currentBackgroundUrl} alt="Current background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button
                type="button"
                onClick={() => { setRemoveBackground(true); setCurrentBackgroundUrl(''); setBackgroundFile(null); }}
                className="gallery-form-btn gallery-form-btn--outline gallery-form-btn--danger"
              >
                Remove background
              </button>
            </div>
          )}
          {(!galleryId || !currentBackgroundUrl || removeBackground || backgroundFile) && (
            <label className="gallery-form-upload-label">
              <span className="gallery-form-upload-text">Choose background image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => { setBackgroundFile(e.target.files?.[0] || null); if (galleryId) setRemoveBackground(false); }}
                className="gallery-form-upload-input"
              />
            </label>
          )}
          {backgroundFile && <p style={{ fontSize: 13, color: '#525252', marginTop: 8 }}>New image selected: {backgroundFile.name}</p>}
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Gallery'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default GalleryForm
