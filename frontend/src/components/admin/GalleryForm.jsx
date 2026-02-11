import React, { useState, useEffect } from 'react'
import { galleryService } from '../../services/galleryService'
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
        password: '', // Don't load password
        description: gallery.description || '',
        event_date: gallery.event_date || ''
      })
    } catch (error) {
      setError('Failed to load gallery: ' + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (galleryId) {
        await galleryService.updateGallery(galleryId, formData)
      } else {
        await galleryService.createGallery(formData)
      }
      onSave()
    } catch (error) {
      setError(error.message || 'Failed to save gallery')
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
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!galleryId}
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
            Event Date
          </label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
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
