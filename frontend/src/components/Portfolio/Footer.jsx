import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/index.css'

const Footer = () => {
  return (
    <footer id="contact" className="footer">
      <div className="footer-content">
        <div className="footer-column footer-brand">
          <h2 className="footer-brand-name">Ayachi Prod</h2>
          <p className="footer-bio">
            We specialize in weddings, portraits, fashion, and commercial photography. Based in the heart of creative excellence, we deliver visual stories that resonate.
          </p>
          <Link to="/book" className="footer-cta-button">Book Session</Link>
        </div>
        <div className="footer-column footer-socials">
          <h3 className="footer-heading">Socials</h3>
          <ul className="footer-list">
            <li>
              <a href="https://www.facebook.com/profile.php?id=61587716110169&mibextid=wwXIfr&rdid=G3zqovXH42pRK1nR&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17v44Gi3gu%2F%3Fmibextid%3DwwXIfr#" className="footer-link" target="_blank" rel="noopener noreferrer">
                <span className="footer-link-inner">
                  <svg className="footer-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </span>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/ayachi_prod?igsh=ZG5tNXZxbzBhM2Iy" className="footer-link" target="_blank" rel="noopener noreferrer">
                <span className="footer-link-inner">
                  <svg className="footer-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </span>
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-column footer-contact">
          <h3 className="footer-heading">Contact</h3>
          <ul className="footer-list">
            <li>
              <Link to="/book" className="footer-link">
                <span className="footer-link-inner">
                  <svg className="footer-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Book a session
                </span>
              </Link>
            </li>
            <li>
              <a href="mailto:Azizayachi12123@gmail.com" className="footer-link">
                <span className="footer-link-inner">
                  <svg className="footer-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Azizayachi12123@gmail.com
                </span>
              </a>
            </li>
            <li>
              <a href="tel:+21620775492" className="footer-link">
                <span className="footer-link-inner">
                  <svg className="footer-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  +21620775492
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 Ayachi Prod. All rights reserved.</p>
        <p className="footer-credits">
          Developed by <a href="https://malekbenamor.dev" className="footer-link">Malek Ben Amor</a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
