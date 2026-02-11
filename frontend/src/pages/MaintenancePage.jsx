import React from 'react'
import { Helmet } from 'react-helmet-async'

const MaintenancePage = ({ message = "We're currently performing scheduled maintenance. Please check back soon." }) => {
  return (
    <>
      <Helmet>
        <title>Maintenance - Aziz Ayachi Photography</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="maintenance-page">
        <div className="maintenance-page__bg" aria-hidden="true" />
        <div className="maintenance-page__content">
          <div className="maintenance-page__icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="maintenance-page__title">Under maintenance</h1>
          <p className="maintenance-page__message">{message}</p>
          <div className="maintenance-page__bar">
            <div className="maintenance-page__bar-fill" />
          </div>
          <p className="maintenance-page__footer">Aziz Ayachi Photography</p>
        </div>
      </div>
    </>
  )
}

export default MaintenancePage
