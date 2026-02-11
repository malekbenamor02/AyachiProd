import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../../styles/index.css'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

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

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
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
          <div className="menu-overlay-backdrop" onClick={() => setMenuOpen(false)} />
          <nav className="menu-overlay-nav">
            <Link to="/book" className="menu-overlay-link" onClick={() => setMenuOpen(false)}>
              Book a session
            </Link>
            <a href="/#contact" className="menu-overlay-link" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
            <Link to="/admin/login" className="menu-overlay-link" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
