import React, { useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import api from '../../services/api'
import '../../styles/index.css'

const DESCRIPTION_PREVIEW_LENGTH = 120

const MediaGrid = ({ files, gallery, accessToken }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [downloading, setDownloading] = useState(false)
  const [dimensions, setDimensions] = useState({})
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const description = gallery?.description || ''
  const showSeeMore = description.length > DESCRIPTION_PREVIEW_LENGTH
  const descriptionText = showSeeMore && !descriptionExpanded
    ? description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + '...'
    : description

  const getAspectRatio = (file) => {
    const d = dimensions[file.id]
    if (d?.w && d?.h) return d.w / d.h
    if (file.width && file.height) return file.width / file.height
    return 4 / 3
  }

  const onImageLoad = (e, fileId) => {
    const img = e.target
    if (img?.naturalWidth && img?.naturalHeight) {
      setDimensions((prev) => ({
        ...prev,
        [fileId]: { w: img.naturalWidth, h: img.naturalHeight },
      }))
    }
  }

  const toggleSelect = (e, fileId) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) next.delete(fileId)
      else next.add(fileId)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === files.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(files.map((f) => f.id)))
  }

  const getDownloadUrl = async (fileId) => {
    if (!accessToken) return null
    const res = await api.get(`/api/client/download/${fileId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res.data?.data?.download_url || null
  }

  // Trigger download without leaving the page (no redirect, no popup blocking)
  const triggerDownload = (url) => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;visibility:hidden'
    document.body.appendChild(iframe)
    iframe.src = url
    setTimeout(() => document.body.removeChild(iframe), 2000)
  }

  const handleDownload = async (file) => {
    try {
      if (accessToken) {
        const url = await getDownloadUrl(file.id)
        if (url) {
          triggerDownload(url)
          return
        }
      }
      const link = document.createElement('a')
      link.href = file.file_url
      link.download = file.original_name || file.file_name
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const downloadSelected = async () => {
    const toDownload = files.filter((f) => selectedIds.has(f.id))
    setDownloading(true)
    try {
      for (let i = 0; i < toDownload.length; i++) {
        const url = accessToken ? await getDownloadUrl(toDownload[i].id) : toDownload[i].file_url
        if (url) triggerDownload(url)
        if (i < toDownload.length - 1) {
          await new Promise((r) => setTimeout(r, 600))
        }
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  if (!files || files.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#525252' }}>
        <p>No files in this gallery yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="client-gallery-content">
        <div className="client-gallery-header">
          <h1 className="client-gallery-title">{gallery.name}</h1>
          {gallery.client_name && (
            <p className="client-gallery-client">{gallery.client_name}</p>
          )}
          {description ? (
            <div className="client-gallery-description">
              <p className="client-gallery-description-text">{descriptionText}</p>
              {showSeeMore && (
                <button
                  type="button"
                  className="client-gallery-see-more"
                  onClick={() => setDescriptionExpanded((e) => !e)}
                >
                  {descriptionExpanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          ) : null}
        </div>

        <div className="media-grid-toolbar" style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={selectAll}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: '1px solid #000',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {selectedIds.size === files.length ? 'Deselect all' : 'Select all'}
          </button>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={downloadSelected}
              disabled={downloading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: downloading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: downloading ? 0.7 : 1
              }}
            >
              {downloading ? 'Downloading…' : `Download ${selectedIds.size} file${selectedIds.size !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        <div className="client-gallery-grid">
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                position: 'relative',
                aspectRatio: getAspectRatio(file),
                overflow: 'hidden',
                borderRadius: '8px',
                cursor: 'pointer',
                border: selectedIds.has(file.id) ? '3px solid #000' : '1px solid rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box',
                backgroundColor: '#f5f5f5'
              }}
              onClick={() => setSelectedImage(file)}
            >
              <div
                className="media-grid-select"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  zIndex: 2,
                  width: '24px',
                  height: '24px',
                  border: '2px solid #fff',
                  borderRadius: '4px',
                  backgroundColor: selectedIds.has(file.id) ? '#000' : 'rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={(e) => toggleSelect(e, file.id)}
              >
                {selectedIds.has(file.id) && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </div>
              {file.file_type === 'image' ? (
                <LazyLoadImage
                  src={file.thumbnail_url || file.file_url}
                  alt={file.original_name || file.file_name}
                  effect="blur"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'grayscale(100%)',
                    transition: 'filter 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onLoad={(e) => onImageLoad(e, file.id)}
                  onMouseEnter={(e) => e.target.style.filter = 'grayscale(0%)'}
                  onMouseLeave={(e) => e.target.style.filter = 'grayscale(100%)'}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>▶</div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Video
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  zIndex: 2
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(file)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            ×
          </button>
          {selectedImage.file_type === 'image' ? (
            <img
              src={selectedImage.file_url}
              alt={selectedImage.original_name}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain'
              }}
            />
          ) : (
            <video
              src={selectedImage.file_url}
              controls
              style={{
                maxWidth: '90%',
                maxHeight: '90%'
              }}
            />
          )}
        </div>
      )}
    </>
  )
}

export default MediaGrid
