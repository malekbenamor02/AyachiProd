import React, { useState, useEffect } from 'react'
import { galleryService } from '../../services/galleryService'
import QRCodeDisplay from './QRCodeDisplay'
import FileUpload from './FileUpload'
import GalleryForm from './GalleryForm'
import '../../styles/index.css'

const GalleryDetail = ({ galleryId, onBack, onStatsRefresh }) => {
  const [gallery, setGallery] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('view') // 'view', 'edit', 'upload'

  useEffect(() => {
    if (galleryId) {
      loadGallery()
    }
  }, [galleryId])

  const loadGallery = async () => {
    setLoading(true)
    try {
      const [galleryData, filesData] = await Promise.all([
        galleryService.getGalleryById(galleryId),
        galleryService.getGalleryFiles(galleryId),
      ])
      setGallery(galleryData ?? null)
      setFiles(Array.isArray(filesData) ? filesData : [])
    } catch (error) {
      console.error('Failed to load gallery:', error)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    setMode('view')
    loadGallery()
    onStatsRefresh?.()
  }

  if (loading) {
    return <div style={{ padding: '48px', textAlign: 'center' }}>Loading...</div>
  }

  if (!gallery) {
    return <div>Gallery not found</div>
  }

  return (
    <div style={{ padding: '48px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '16px',
              fontSize: '14px'
            }}
          >
            ← Back to Galleries
          </button>
          <h1 style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.05em' }}>
            {gallery.name}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
            style={{
              padding: '12px 24px',
              backgroundColor: mode === 'edit' ? '#000000' : 'transparent',
              color: mode === 'edit' ? '#FFFFFF' : '#000000',
              border: '1px solid #000000',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {mode === 'edit' ? 'Cancel Edit' : 'Edit'}
          </button>
          <button
            onClick={() => setMode(mode === 'upload' ? 'view' : 'upload')}
            style={{
              padding: '12px 24px',
              backgroundColor: mode === 'upload' ? '#000000' : 'transparent',
              color: mode === 'upload' ? '#FFFFFF' : '#000000',
              border: '1px solid #000000',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {mode === 'upload' ? 'Cancel Upload' : 'Upload Files'}
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <GalleryForm
          galleryId={galleryId}
          onSave={handleSave}
          onCancel={() => setMode('view')}
        />
      ) : mode === 'upload' ? (
        <div style={{ marginBottom: '48px' }}>
          <FileUpload
            galleryId={galleryId}
            onUploadComplete={() => {
              loadGallery()
              onStatsRefresh?.()
            }}
          />
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '48px'
          }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
                Gallery Information
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    Client Name
                  </p>
                  <p style={{ fontSize: '16px' }}>{gallery.client_name || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    Client Email
                  </p>
                  <p style={{ fontSize: '16px' }}>{gallery.client_email || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    Event Date
                  </p>
                  <p style={{ fontSize: '16px' }}>
                    {gallery.event_date ? new Date(gallery.event_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    Files
                  </p>
                  <p style={{ fontSize: '16px' }}>{gallery.file_count || 0} files</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    Access Count
                  </p>
                  <p style={{ fontSize: '16px' }}>{gallery.access_count || 0} views</p>
                </div>
              </div>
            </div>
            <div>
              <QRCodeDisplay galleryId={galleryId} />
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              Files ({files.length})
            </h2>
            {files.length === 0 ? (
              <div style={{
                padding: '48px',
                textAlign: 'center',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                color: '#525252'
              }}>
                <p style={{ marginBottom: '16px' }}>No files uploaded yet.</p>
                <button
                  onClick={() => setMode('upload')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Upload Files
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {files.map(file => (
                  <div key={file.id} style={{
                    aspectRatio: '4/3',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={file.thumbnail_url || file.file_url}
                      alt={file.original_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default GalleryDetail
