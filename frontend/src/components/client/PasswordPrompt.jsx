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
        <div
          className="client-access-page__bg"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(3px)',
            WebkitFilter: 'blur(px)',
            transform: 'scale(1.02)'
          }}
          aria-hidden="true"
        />
      )}
      <div
        className="client-access-page__card"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: 'clamp(24px, 6vw, 48px)',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          position: 'relative',
          zIndex: 1
        }}
      >
        <form onSubmit={handleSubmit} className="client-access-form">
          {error && (
            <div className="client-access-error">
              {error}
            </div>
          )}

          <div className="client-access-field">
            <input
              id="client-access-password"
              type="password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              placeholder="Enter your password"
              className="client-access-input"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="client-access-btn"
          >
            {loading ? 'Verifying…' : 'Access Gallery'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PasswordPrompt
