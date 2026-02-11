import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import PasswordPrompt from '../components/client/PasswordPrompt'
import MediaGrid from '../components/client/MediaGrid'
import Header from '../components/Portfolio/Header'
import Footer from '../components/Portfolio/Footer'
import Cursor from '../components/common/Cursor'
import api from '../services/api'

const ClientGallery = () => {
  const { token } = useParams()
  const [accessToken, setAccessToken] = useState(null)
  const [galleryData, setGalleryData] = useState(null)
  const [loading, setLoading] = useState(false)

  const authenticated = !!accessToken && !!galleryData

  useEffect(() => {
    if (!accessToken) return
    loadGallery(accessToken)
  }, [accessToken])

  const loadGallery = async (authToken) => {
    setLoading(true)
    try {
      const response = await api.get('/api/client/gallery', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      if (response.data.success) {
        setGalleryData(response.data.data)
      } else {
        setAccessToken(null)
      }
    } catch (error) {
      console.error('Failed to load gallery:', error)
      setAccessToken(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = (data) => {
    setAccessToken(data.access_token)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="client-gallery client-gallery--access">
        <Helmet>
          <title>Gallery Access - Aziz Ayachi Photography</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Cursor />
        <PasswordPrompt token={token} onSuccess={handleAuthSuccess} />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{galleryData?.gallery?.name || 'Gallery'} - Aziz Ayachi Photography</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Cursor />
      <Header />
      <MediaGrid files={galleryData?.files || []} gallery={galleryData?.gallery || {}} accessToken={accessToken} />
      <Footer />
    </>
  )
}

export default ClientGallery
