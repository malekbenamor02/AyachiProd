import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../../styles/index.css'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [inTopHalf, setInTopHalf] = useState(true) // mobile: dark logo in first half so visible on white
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!menuOpen) return
    const onEscape = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches
    const update = () => {
      if (!isMobile()) return
      const threshold = window.innerHeight * 0.5
      setInTopHalf(window.scrollY < threshold)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const handleContactClick = () => {
    closeMenu()
    if (location.pathname === '/') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollToContact: true } })
    }
  }

  return (
    <header className={`header ${inTopHalf ? 'header--top-half' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          Aziz Ayachi
        </Link>
        <button
          type="button"
          className={`menu-toggle ${menuOpen ? 'menu-toggle--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="plus-icon">{menuOpen ? '×' : '+'}</span>
        </button>
      </div>

      {menuOpen && (
        <div
          className="menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Actions menu"
        >
          <div className="menu-overlay-backdrop" onClick={closeMenu} aria-hidden="true" />
          <div className="menu-overlay-panel">
            <button
              type="button"
              className="menu-overlay-close"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              ×
            </button>
            <nav className="menu-overlay-nav">
              <Link to="/book" className="menu-overlay-link" onClick={closeMenu}>
                Book a session
              </Link>
              <button
                type="button"
                className="menu-overlay-link menu-overlay-link-button"
                onClick={handleContactClick}
              >
                Contact
              </button>
              <Link to="/admin/login" className="menu-overlay-link" onClick={closeMenu}>
                Login
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
