import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import Cursor from '../components/common/Cursor'
import '../styles/index.css'
import './AdminLogin.css'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef(null)
  const errorRef = useRef(null)

  useEffect(() => {
    // Fade in animation
    if (formRef.current) {
      formRef.current.style.opacity = '0'
      formRef.current.style.transform = 'translateY(20px)'
      setTimeout(() => {
        formRef.current.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        formRef.current.style.opacity = '1'
        formRef.current.style.transform = 'translateY(0)'
      }, 100)
    }
  }, [])

  useEffect(() => {
    // Error animation
    if (error && errorRef.current) {
      errorRef.current.style.opacity = '0'
      errorRef.current.style.transform = 'translateY(-10px)'
      setTimeout(() => {
        errorRef.current.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        errorRef.current.style.opacity = '1'
        errorRef.current.style.transform = 'translateY(0)'
      }, 50)
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Login - Aziz Ayachi Photography</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Cursor />
      
      <div className="admin-login-container">
        <div className="admin-login-background">
          <div className="admin-login-gradient"></div>
        </div>
        
        <div ref={formRef} className="admin-login-form-wrapper">
          <div className="admin-login-header">
            <h1 className="admin-login-title">
              <span className="word-wrapper">
                <span className="word">Admin</span>
              </span>
              <span className="word-break"> </span>
              <span className="word-wrapper">
                <span className="word">Login</span>
              </span>
            </h1>
            <p className="admin-login-subtitle">Access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div ref={errorRef} className="admin-login-error">
                {error}
              </div>
            )}

            <div className="admin-login-field">
              <label className="admin-login-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="admin-login-input"
                placeholder="your@email.com"
              />
            </div>

            <div className="admin-login-field">
              <label className="admin-login-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-login-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-login-button"
            >
              <span className="admin-login-button-text">
                {loading ? 'Logging in...' : 'Login'}
              </span>
              <span className="admin-login-button-arrow">→</span>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default AdminLogin
