import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { sectionsService } from '../services/sectionsService'
import Header from '../components/Portfolio/Header'
import Footer from '../components/Portfolio/Footer'
import Cursor from '../components/common/Cursor'
import '../styles/index.css'

const WorkDetail = () => {
  const { id } = useParams()
  const [section, setSection] = useState(null)
  const [workImages, setWorkImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [lightboxItem, setLightboxItem] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!id) return
    sectionsService.getSectionById(id).then((data) => {
      if (!cancelled) setSection(data)
    }).catch(() => {
      if (!cancelled) setSection(null)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    let cancelled = false
    if (!id) return
    sectionsService.getWorkImages(id).then((data) => {
      if (!cancelled && Array.isArray(data)) setWorkImages(data)
    }).catch(() => {
      if (!cancelled) setWorkImages([])
    })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="work-detail work-detail-loading">
        <Cursor />
        <div className="work-detail-loader">
          <span className="work-detail-loader-spinner" />
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  if (!section) {
    return (
      <div className="work-detail work-detail-error">
        <Cursor />
        <Header />
        <div className="work-detail-message">
          <h1>Work not found</h1>
          <Link to="/" className="work-detail-back">← Back to home</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{section.title} — Aziz Ayachi Photography</title>
        <meta name="description" content={`${section.title}${section.category ? ` · ${section.category}` : ''}${section.date_display ? ` · ${section.date_display}` : ''}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <Cursor />
      <Header />
      <div className="work-detail">
        <nav className="work-detail-nav" aria-label="Breadcrumb">
          <Link to="/#projects" className="work-detail-nav-back">← All work</Link>
          <span className="work-detail-nav-sep" aria-hidden="true">/</span>
          <span className="work-detail-nav-current">{section.title}</span>
        </nav>

        <div className="work-detail-hero">
          <div className="work-detail-hero-bg" />
          <div className={`work-detail-hero-image-wrap ${imageLoaded ? 'is-visible' : ''}`}>
            <img
              src={section.file_url}
              alt={section.alt_text || section.title}
              className="work-detail-hero-image"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          <div className="work-detail-hero-overlay" />
          <div className="work-detail-hero-content">
            <p className="work-detail-hero-meta">
              {[section.category, section.date_display || section.year].filter(Boolean).join(' · ') || ''}
            </p>
            <h1 className="work-detail-hero-title">{section.title}</h1>
          </div>
        </div>

        {workImages.length > 0 && (
          <section className="work-detail-gallery" aria-labelledby="work-gallery-heading">
            <h2 id="work-gallery-heading" className="work-detail-gallery-title">Work</h2>
            <div className="work-detail-gallery-grid">
              {workImages.map((item) => (
                <div
                  key={item.id}
                  className="work-detail-gallery-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => (item.file_type !== 'file' ? setLightboxItem(item) : null)}
                  onKeyDown={(e) => (e.key === 'Enter' && item.file_type !== 'file' ? setLightboxItem(item) : null)}
                >
                  {item.file_type === 'video' ? (
                    <video
                      src={item.file_url}
                      className="work-detail-gallery-media"
                      controls
                      playsInline
                      preload="metadata"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : item.file_type === 'image' || !item.file_type ? (
                    <img
                      src={item.file_url}
                      alt={item.alt_text || section.title}
                      className="work-detail-gallery-image"
                      loading="lazy"
                    />
                  ) : (
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="work-detail-gallery-file" onClick={(e) => e.stopPropagation()}>
                      <span className="work-detail-gallery-file-icon">↓</span>
                      <span>File</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {lightboxItem && (
        <div
          className="work-detail-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="View media"
          onClick={() => setLightboxItem(null)}
        >
          <button type="button" className="work-detail-lightbox-close" onClick={() => setLightboxItem(null)} aria-label="Close">
            ×
          </button>
          <div className="work-detail-lightbox-content" onClick={(e) => e.stopPropagation()}>
            {lightboxItem.file_type === 'video' ? (
              <video
                src={lightboxItem.file_url}
                className="work-detail-lightbox-media"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={lightboxItem.file_url}
                alt={lightboxItem.alt_text || section?.title}
                className="work-detail-lightbox-image"
              />
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default WorkDetail
