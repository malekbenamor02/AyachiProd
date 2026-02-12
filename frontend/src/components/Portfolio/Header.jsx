import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../../styles/index.css'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
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
    <header className="header">
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
