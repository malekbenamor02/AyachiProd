import React, { useState, useEffect } from 'react'
import { galleryService } from '../../services/galleryService'
import '../../styles/index.css'

const GalleryList = ({ onSelectGallery, onCreateNew }) => {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    loadGalleries()
  }, [page, search])

  const loadGalleries = async () => {
    setLoading(true)
    try {
      const data = await galleryService.getGalleries(page, 20, search)
      setGalleries(data.data || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load galleries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery?')) return

    try {
      await galleryService.deleteGallery(id)
      loadGalleries()
    } catch (error) {
      alert('Failed to delete gallery: ' + error.message)
    }
  }

  if (loading && galleries.length === 0) {
    return <div style={{ padding: '48px', textAlign: 'center' }}>Loading galleries...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.05em' }}>Galleries</h2>
        <button
          onClick={onCreateNew}
          style={{
            padding: '12px 24px',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          + New Gallery
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search galleries..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif'
          }}
        />
      </div>

      {galleries.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#525252' }}>
          <p style={{ marginBottom: '16px' }}>No galleries found.</p>
          <button
            onClick={onCreateNew}
            style={{
              padding: '12px 24px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create Your First Gallery
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
            {galleries.map(gallery => (
              <div
                key={gallery.id}
                style={{
                  padding: '24px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)'}
                onClick={() => onSelectGallery(gallery.id)}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                    {gallery.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#525252', marginBottom: '4px' }}>
                    Client: {gallery.client_name || 'N/A'}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#737373', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    <span>{gallery.file_count || 0} Files</span>
                    <span>{gallery.access_count || 0} Views</span>
                    {gallery.event_date && <span>{new Date(gallery.event_date).getFullYear()}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectGallery(gallery.id)
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid #000000',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(gallery.id)
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid #c00',
                      color: '#c00',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <span style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px',
                  cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === pagination.totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GalleryList
