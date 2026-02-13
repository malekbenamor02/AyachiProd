import React, { useState } from 'react'
import api from '../../services/api'
import '../../styles/index.css'

const PasswordPrompt = ({ token, onSuccess, backgroundUrl }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/client/authenticate', { token, password })
      if (response.data.success) {
        onSuccess(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="client-access-page" style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      backgroundColor: '#FFFFFF',
      overflow: 'hidden'
    }}>
      {backgroundUrl && (
        <>
          <div
            className="client-access-page__bg"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            aria-hidden="true"
          />
          <div
            className="client-access-page__overlay"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)'
            }}
            aria-hidden="true"
          />
        </>
      )}
      <div
        className="client-access-page__card"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: 'clamp(24px, 6vw, 48px)',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          backgroundColor: backgroundUrl ? 'rgba(255, 255, 255, 0.65)' : '#FFFFFF',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 32px)',
          fontWeight: 700,
          letterSpacing: '-0.05em',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#000000'
        }}>
          Gallery Access
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 3vw, 16px)',
          color: '#525252',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Enter the password to access this gallery
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '24px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c00',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 400,
              color: '#000000'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 400,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Verifying...' : 'Access Gallery'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PasswordPrompt
