import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/index.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">Aziz Ayachi</Link>
        <button className="menu-toggle" aria-label="Menu">
          <span className="plus-icon">+</span>
        </button>
      </div>
    </header>
  )
}

export default Header
