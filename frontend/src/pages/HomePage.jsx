import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Portfolio/Header'
import Hero from '../components/Portfolio/Hero'
import Marquee from '../components/Portfolio/Marquee'
import Intro from '../components/Portfolio/Intro'
import ProjectGrid from '../components/Portfolio/ProjectGrid'
import Footer from '../components/Portfolio/Footer'
import Cursor from '../components/common/Cursor'

const HomePage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.scrollToContact) {
      const el = document.getElementById('contact')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  // Structured Data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Photographer",
    "name": "Ayachi Prod",
    "description": "Professional photographer specializing in weddings, portraits, fashion, and commercial photography",
    "url": "https://ayachiprod.com",
    "logo": "https://ayachiprod.com/logo.png",
    "image": "https://ayachiprod.com/hero-image.jpg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+21620775492",
      "contactType": "customer service",
      "email": "Azizayachi12123@gmail.com"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61587716110169",
      "https://www.instagram.com/ayachi_prod"
    ],
    "priceRange": "$$"
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Photography Services",
    "provider": {
      "@type": "Photographer",
      "name": "Aziz Ayachi"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Photography Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Wedding Photography"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Portrait Photography"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Event Photography"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fashion Photography"
          }
        }
      ]
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Ayachi Prod",
    "url": "https://ayachiprod.com",
    "description": "Professional photographer specializing in weddings, portraits, fashion, and commercial photography",
    "publisher": { "@type": "Photographer", "name": "Aziz Ayachi" },
    "inLanguage": "en"
  }

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Ayachi Prod - Professional Photographer | Wedding, Portrait & Event Photography</title>
        <meta name="title" content="Ayachi Prod - Professional Photographer | Wedding, Portrait & Event Photography" />
        <meta name="description" content="Ayachi Prod is a professional photographer specializing in weddings, portraits, fashion, and commercial photography. View portfolio and book your session." />
        <meta name="keywords" content="Ayachi Prod, photographer, wedding photography, portrait photography, event photography, fashion photography, professional photographer" />
        <meta name="author" content="Ayachi Prod" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ayachiprod.com" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ayachiprod.com" />
        <meta property="og:title" content="Ayachi Prod - Professional Photographer | Wedding, Portrait & Event Photography" />
        <meta property="og:description" content="Professional photographer specializing in weddings, portraits, fashion, and commercial photography. View portfolio and book your session." />
        <meta property="og:image" content="https://ayachiprod.com/og-image.png" />
        <meta property="og:image:alt" content="Ayachi Prod - Professional Photographer" />
        <meta property="og:site_name" content="Ayachi Prod" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://ayachiprod.com" />
        <meta name="twitter:title" content="Ayachi Prod - Professional Photographer | Wedding, Portrait & Event Photography" />
        <meta name="twitter:description" content="Professional photographer specializing in weddings, portraits, fashion, and commercial photography." />
        <meta name="twitter:image" content="https://ayachiprod.com/og-image.png" />
        <meta name="twitter:image:alt" content="Ayachi Prod - Professional Photographer" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>

      <Cursor />
      <Header />
      <Hero />
      <Marquee />
      <Intro />
      <ProjectGrid />
      <section className="cta-section">
        <div className="cta-section-inner">
          <h2 className="cta-section-title">Ready to create something together?</h2>
          <p className="cta-section-text">Book a session and let’s bring your vision to life.</p>
          <Link to="/book" className="cta-section-button">Book Session</Link>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default HomePage
