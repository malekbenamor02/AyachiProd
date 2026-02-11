import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { sectionsService } from '../../services/sectionsService'
import '../../styles/index.css'

const SECTIONS_CACHE_KEY = 'sections_grid'
const SECTIONS_CACHE_TS_KEY = 'sections_grid_ts'
const CACHE_TTL_MS = 5 * 60 * 1000
const PRELOAD_LIMIT = 12

function getCachedSections() {
  if (typeof window === 'undefined') return null
  try {
    const ts = sessionStorage.getItem(SECTIONS_CACHE_TS_KEY)
    const raw = sessionStorage.getItem(SECTIONS_CACHE_KEY)
    if (!raw || !ts) return null
    if (Date.now() - parseInt(ts, 10) > CACHE_TTL_MS) return null
    const data = JSON.parse(raw)
    return Array.isArray(data) && data.length > 0 ? data : null
  } catch {
    return null
  }
}

function setCachedSections(data) {
  if (typeof window === 'undefined') return
  try {
    if (Array.isArray(data) && data.length > 0) {
      sessionStorage.setItem(SECTIONS_CACHE_KEY, JSON.stringify(data))
      sessionStorage.setItem(SECTIONS_CACHE_TS_KEY, String(Date.now()))
    }
  } catch (_) {}
}

function ensureProjectPreconnects(items) {
  if (typeof document === 'undefined') return
  const origins = new Set()
  items.forEach(item => {
    if (!item?.file_url) return
    try {
      const origin = new URL(item.file_url).origin
      origins.add(origin)
    } catch (_) {}
  })
  origins.forEach(origin => {
    if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = origin
      link.crossOrigin = ''
      document.head.appendChild(link)
    }
  })
}

function injectProjectPreloadLinks(items) {
  if (typeof document === 'undefined') return []
  const links = []
  items.slice(0, PRELOAD_LIMIT).forEach(item => {
    if (!item?.file_url) return
    if (document.querySelector(`link[rel="preload"][as="image"][href="${item.file_url}"]`)) return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = item.file_url
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
    links.push(link)
  })
  return links
}

function preloadProjectImages(items) {
  if (typeof window === 'undefined') return Promise.resolve()
  const targets = items.slice(0, PRELOAD_LIMIT).filter(item => item?.file_url)
  if (targets.length === 0) return Promise.resolve()
  const tasks = targets.map(item => new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.fetchPriority = 'high'
    img.onload = finish
    img.onerror = finish
    img.src = item.file_url
    if (typeof img.decode === 'function') {
      img.decode().then(finish).catch(finish)
    }
  }))
  const timeout = new Promise(resolve => { setTimeout(resolve, 1500) })
  return Promise.race([Promise.all(tasks), timeout])
}

const ProjectCard = ({ project, isEager }) => {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef(null)

  const handleLoad = useCallback(() => setLoaded(true), [])
  const handleError = useCallback(() => setLoaded(true), [])

  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete) setLoaded(true)
  }, [])

  const altText = project.alt_text || project.title || 'Project'

  return (
    <Link to={`/work/${project.id}`} className="project-item project-item-link">
      <div className="project-image-container">
        <div className={`project-image ${loaded ? 'project-image-loaded' : ''}`}>
          <img
            ref={imgRef}
            src={project.file_url}
            alt={altText}
            loading={isEager ? 'eager' : 'lazy'}
            fetchpriority={isEager ? 'high' : undefined}
            decoding="async"
            draggable="false"
            onLoad={handleLoad}
            onError={handleError}
            className="project-image-layer project-image-layer--color"
            style={{ objectFit: 'cover' }}
          />
          <img
            src={project.file_url}
            alt=""
            aria-hidden="true"
            loading={isEager ? 'eager' : 'lazy'}
            fetchpriority={isEager ? 'high' : undefined}
            decoding="async"
            draggable="false"
            onLoad={handleLoad}
            onError={handleError}
            className="project-image-layer project-image-layer--gray"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="project-overlay"></div>
        <div className="project-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M7 7h10v10"/>
          </svg>
        </div>
      </div>
      <div className="project-meta">
        <h3 className="project-title">{project.title}</h3>
        <div className="project-details">
          <span className="project-category">{project.category}</span>
          <span className="project-year">{project.date_display || project.year}</span>
        </div>
      </div>
    </Link>
  )
}

const ProjectGrid = () => {
  const cached = getCachedSections()
  const [projects, setProjects] = useState(() => cached || [])

  useEffect(() => {
    let cancelled = false
    sectionsService.getSections()
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return
        if (data.length > 0) {
          setCachedSections(data)
          setProjects(data)
        } else {
          setProjects([])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!projects || projects.length === 0) return
    let cancelled = false
    let preloadLinks = []
    ensureProjectPreconnects(projects)
    preloadLinks = injectProjectPreloadLinks(projects)
    preloadProjectImages(projects)
      .catch(() => {})
      .finally(() => {
        if (cancelled || preloadLinks.length === 0) return
        preloadLinks.forEach(link => {
          if (link && link.parentNode) {
            link.parentNode.removeChild(link)
          }
        })
        preloadLinks = []
      })
    return () => {
      cancelled = true
      if (preloadLinks.length) {
        preloadLinks.forEach(link => {
          if (link && link.parentNode) {
            link.parentNode.removeChild(link)
          }
        })
        preloadLinks = []
      }
    }
  }, [projects])

  const eagerThreshold = Math.min(projects.length, PRELOAD_LIMIT)

  return (
    <section id="projects" className="projects-section">
      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} isEager={index < eagerThreshold} />
        ))}
        {projects.length === 0 && (
          <div className="project-item project-item-placeholder" aria-hidden="true" style={{ pointerEvents: 'none' }}>
            <div className="project-image-container">
              <div className="project-image" style={{ background: 'var(--projects-placeholder-bg, #f0f0f0)', minHeight: 280 }} />
            </div>
            <div className="project-meta">
              <h3 className="project-title">Sections</h3>
              <div className="project-details"><span>Add sections in the admin</span></div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectGrid
