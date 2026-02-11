import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { sectionsService } from '../../services/sectionsService'
import '../../styles/index.css'

const ProjectGrid = () => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let cancelled = false
    sectionsService.getSections().then((data) => {
      if (!cancelled && Array.isArray(data)) setProjects(data)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <section id="projects" className="projects-section">
      <div className="projects-grid">
        {projects.map((project) => (
          <Link key={project.id} to={`/work/${project.id}`} className="project-item project-item-link">
            <div className="project-image-container">
              <div className="project-image">
                <LazyLoadImage
                  src={project.file_url}
                  alt={project.alt_text || project.title}
                  effect="blur"
                  threshold={100}
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
