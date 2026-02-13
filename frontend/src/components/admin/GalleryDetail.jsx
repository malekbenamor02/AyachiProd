import React, { useState, useEffect } from 'react'
import { galleryService } from '../../services/galleryService'
import QRCodeDisplay from './QRCodeDisplay'
import FileUpload from './FileUpload'
import GalleryForm from './GalleryForm'
import ConfirmDialog from '../common/ConfirmDialog'
import '../../styles/index.css'

const GalleryDetail = ({ galleryId, onBack, onStatsRefresh }) => {
  const [gallery, setGallery] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('view') // 'view', 'edit', 'upload'
  const [selectedFileIds, setSelectedFileIds] = useState(new Set())
  const [removing, setRemoving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

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

  const toggleFileSelection = (id) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllFiles = () => {
    setSelectedFileIds(new Set(files.map((f) => f.id)))
  }

  const clearSelection = () => {
    setSelectedFileIds(new Set())
  }

  const handleConfirmRemoveFiles = async () => {
    const ids = Array.from(selectedFileIds)
    setConfirmRemove(false)
    if (ids.length === 0) return
    setRemoving(true)
    try {
      await galleryService.deleteGalleryFiles(galleryId, ids)
      setSelectedFileIds(new Set())
      await loadGallery()
      onStatsRefresh?.()
    } catch (err) {
      console.error('Failed to remove files:', err)
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return <div className="gallery-detail" style={{ textAlign: 'center' }}>Loading...</div>
  }

  if (!gallery) {
    return <div className="gallery-detail">Gallery not found</div>
  }

  return (
    <div className="gallery-detail">
      <div className="gallery-detail-header">
        <div className="gallery-detail-header-left">
          <button
            type="button"
            onClick={onBack}
            className="gallery-detail-back"
          >
            ← Back to Galleries
          </button>
          <h1 className="gallery-detail-title">{gallery.name}</h1>
        </div>
        <div className="gallery-detail-actions">
          <button
            type="button"
            onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
            className="gallery-detail-btn"
            style={{
              backgroundColor: mode === 'edit' ? '#000000' : 'transparent',
              color: mode === 'edit' ? '#FFFFFF' : '#000000'
            }}
          >
            {mode === 'edit' ? 'Cancel Edit' : 'Edit'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'upload' ? 'view' : 'upload')}
            className="gallery-detail-btn"
            style={{
              backgroundColor: mode === 'upload' ? '#000000' : 'transparent',
              color: mode === 'upload' ? '#FFFFFF' : '#000000'
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
          <div className="gallery-detail-info-grid">
            <div className="gallery-detail-info-block">
              <h2 className="gallery-detail-info-title">Gallery Information</h2>
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
            <div className="gallery-detail-qr-wrap">
              <QRCodeDisplay galleryId={galleryId} />
            </div>
          </div>

          <div className="gallery-detail-files">
            <div className="gallery-detail-files-toolbar">
              <h2 className="gallery-detail-files-title">Files ({files.length})</h2>
              {files.length > 0 && (
                <>
                  <button type="button" onClick={selectAllFiles} className="gallery-detail-files-btn gallery-detail-files-btn--secondary">
                    Select all
                  </button>
                  <button type="button" onClick={clearSelection} className="gallery-detail-files-btn gallery-detail-files-btn--secondary">
                    Deselect all
                  </button>
                  {selectedFileIds.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(true)}
                      disabled={removing}
                      className="gallery-detail-files-btn gallery-detail-files-btn--primary"
                    >
                      {removing ? 'Removing…' : `Remove selected (${selectedFileIds.size})`}
                    </button>
                  )}
                </>
              )}
            </div>
            {files.length === 0 ? (
              <div className="gallery-detail-empty">
                <p>No files uploaded yet.</p>
                <button
                  type="button"
                  onClick={() => setMode('upload')}
                  className="gallery-detail-btn gallery-detail-files-btn--primary"
                >
                  Upload Files
                </button>
              </div>
            ) : (
              <>
                <ConfirmDialog
                  open={confirmRemove}
                  title="Remove selected files?"
                  message={`This will permanently remove ${selectedFileIds.size} file(s) from this gallery.`}
                  confirmLabel="Remove"
                  cancelLabel="Cancel"
                  variant="danger"
                  onConfirm={handleConfirmRemoveFiles}
                  onCancel={() => setConfirmRemove(false)}
                />
                <div className="gallery-detail-files-grid">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        aspectRatio: '4/3',
                        border: selectedFileIds.has(file.id) ? '2px solid #000' : '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleFileSelection(file.id)}
                    >
                      <img
                        src={file.thumbnail_url || file.file_url}
                        alt={file.original_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <input
                        type="checkbox"
                        checked={selectedFileIds.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${file.original_name || 'file'}`}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: '#000'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default GalleryDetail
