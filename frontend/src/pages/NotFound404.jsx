import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const NotFound404 = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Aziz Ayachi Photography</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="not-found-page">
        <div className="not-found-page__bg" aria-hidden="true" />
        <div className="not-found-page__content">
          <span className="not-found-page__code" aria-hidden="true">404</span>
          <h1 className="not-found-page__title">Page not found</h1>
          <p className="not-found-page__text">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="not-found-page__link">
            Back to home
          </Link>
        </div>
      </div>
    </>
  )
}

export default NotFound404
