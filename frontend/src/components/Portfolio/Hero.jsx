import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/index.css'

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="word-wrapper">
            <span className="letter-reveal">A</span>
            <span className="letter-reveal">y</span>
            <span className="letter-reveal">a</span>
            <span className="letter-reveal">c</span>
            <span className="letter-reveal">h</span>
            <span className="letter-reveal">i</span>
          </span>
          <span className="word-break"></span>
          <span className="word-wrapper">
            <span className="letter-reveal">P</span>
            <span className="letter-reveal">r</span>
            <span className="letter-reveal">o</span>
            <span className="letter-reveal">d</span>
          </span>
        </h1>
        <p className="hero-subtitle">Capturing moments through the lens of artistry</p>
        <Link to="/book" className="hero-cta">Book Session</Link>
      </div>
    </section>
  )
}

export default Hero
