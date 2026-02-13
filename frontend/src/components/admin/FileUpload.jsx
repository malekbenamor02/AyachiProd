import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { galleryService } from '../../services/galleryService'
import '../../styles/index.css'

const FileUpload = ({ galleryId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(false), 4000)
    return () => clearTimeout(t)
  }, [success])

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!galleryId) {
      setError('Please select a gallery first')
      return
    }
    const files = Array.from(acceptedFiles || []).filter((f) => f && (f.size !== undefined))
    if (files.length === 0) return

    setUploading(true)
    setError('')
    setSuccess(false)
    setProgress({ current: 0, total: files.length })

    try {
      for (let i = 0; i < files.length; i++) {
        setProgress((p) => ({ ...p, current: i + 1 }))
        await galleryService.uploadFile(galleryId, files[i], (loaded, total) => {
          const part = total ? loaded / total : 0
          setProgress((p) => ({ ...p, percent: Math.round(((i + part) / files.length) * 100) }))
        })
      }
      setProgress((p) => ({ ...p, percent: 100 }))
      try {
        if (typeof onUploadComplete === 'function') onUploadComplete()
      } catch (cbErr) {
        console.error('onUploadComplete error:', cbErr)
      }
      setSuccess(true)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.data?.error || err?.message || 'Failed to upload files'
      setError(msg)
      try {
        if (typeof onUploadComplete === 'function') onUploadComplete()
      } catch (cbErr) {
        console.error('onUploadComplete error:', cbErr)
      }
    } finally {
      setUploading(false)
      setProgress({ current: 0, total: 0 })
    }
  }, [galleryId, onUploadComplete])

  const progressPercent = progress.total > 0 ? (progress.percent != null ? progress.percent : Math.round((progress.current / progress.total) * 100)) : 0

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    multiple: true
  })

  if (!galleryId) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        border: '2px dashed rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        color: '#525252'
      }}>
        <p>Please select a gallery to upload files</p>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
        Upload Files
      </h3>

      {success && (
        <div className="upload-success-toast" role="alert">
          <span className="upload-success-icon">✓</span>
          <span>Files uploaded successfully</span>
        </div>
      )}

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

      <div
        {...getRootProps()}
        style={{
          padding: '48px',
          border: '2px dashed',
          borderColor: isDragActive ? '#000000' : 'rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.02)' : '#FFFFFF',
          transition: 'all 0.3s',
          opacity: uploading ? 0.6 : 1
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        {uploading ? (
          <div>
            <p style={{ fontSize: '16px', marginBottom: '16px' }}>
              {progress.total > 1 ? `Uploading ${progress.current}/${progress.total}…` : 'Uploading…'}
            </p>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: '#000000',
                transition: 'width 0.3s'
              }} />
            </div>
            <p style={{ fontSize: '14px', color: '#525252' }}>{progressPercent}%</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p style={{ fontSize: '14px', color: '#525252' }}>
              or click to select files
            </p>
            <p style={{ fontSize: '12px', color: '#737373', marginTop: '16px' }}>
              Supports: Images (JPG, PNG, HEIC) and Videos (MP4, MOV)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
