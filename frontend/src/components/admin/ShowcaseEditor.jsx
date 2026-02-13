import React, { useState, useEffect } from 'react'
import { showcaseService } from '../../services/showcaseService'
import ConfirmDialog from '../common/ConfirmDialog'
import '../../styles/index.css'

const ShowcaseEditor = ({ onBack, onStatsRefresh }) => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState(null)
  const [altText, setAltText] = useState('')
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await showcaseService.getImages()
      setImages(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load images')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleFile = async (e) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    const files = Array.from(fileList).filter((f) => f && f.type?.startsWith('image/'))
    if (files.length === 0) {
      setError('Please select image file(s) (JPEG, PNG, etc.)')
      return
    }
    if (files.length !== fileList.length) {
      setError('Some files were skipped (not images).')
    }
    setUploading(true)
    setError('')
    setUploadProgress({ current: 0, total: files.length })
    const input = e.target
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length })
        await showcaseService.uploadImage(files[i], altText)
      }
      setAltText('')
      if (input) input.value = ''
      await load()
      if (typeof onStatsRefresh === 'function') onStatsRefresh()
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Upload failed'
      setError(msg)
      await load()
    } finally {
      setUploading(false)
      setUploadProgress({ current: 0, total: 0 })
    }
  }

  const handleRemoveClick = (id) => {
    setConfirmRemoveId(id)
  }

  const handleConfirmRemove = async () => {
    const id = confirmRemoveId
    setConfirmRemoveId(null)
    if (!id) return
    setRemovingId(id)
    setError('')
    try {
      await showcaseService.deleteImage(id)
      setImages((prev) => prev.filter((img) => img.id !== id))
      onStatsRefresh?.()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Delete failed')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="showcase-editor">
      <ConfirmDialog
        open={!!confirmRemoveId}
        title="Remove image?"
        message="Remove this image from the homepage section?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmRemoveId(null)}
      />
      <div className="showcase-editor-header">
        <h2 className="showcase-editor-title">Homepage showcase (marquee)</h2>
        <p className="showcase-editor-desc">These images appear in the horizontal strip on the homepage. Add, remove, or reorder.</p>
        <button type="button" onClick={onBack} className="showcase-editor-back">
          ← Back to dashboard
        </button>
      </div>

      {error && <div className="showcase-editor-error">{error}</div>}

      <div className="showcase-editor-upload">
        <label className="showcase-editor-upload-label">
          <span>Add image(s)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
        <input
          type="text"
          placeholder="Alt text (optional, for all)"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          className="showcase-editor-alt"
        />
        {uploading && (
          <span className="showcase-editor-uploading">
            {uploadProgress.total > 1
              ? `Uploading ${uploadProgress.current}/${uploadProgress.total}…`
              : 'Uploading…'}
          </span>
        )}
      </div>

      {loading ? (
        <p className="showcase-editor-loading">Loading images…</p>
      ) : (
        <div className="showcase-editor-grid">
          {images.map((img) => (
            <div key={img.id} className="showcase-editor-item">
              <img src={img.file_url} alt={img.alt_text || ''} />
              <button
                type="button"
                className="showcase-editor-remove"
                disabled={removingId === img.id}
                onClick={() => handleRemoveClick(img.id)}
              >
                {removingId === img.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          ))}
          {images.length === 0 && !loading && (
            <p className="showcase-editor-empty">No images yet. Upload one to show in the homepage section.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ShowcaseEditor
