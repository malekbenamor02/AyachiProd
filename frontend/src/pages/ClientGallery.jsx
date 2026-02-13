import React, { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import PasswordPrompt from '../components/client/PasswordPrompt'
import ClientIntroMessage from '../components/client/ClientIntroMessage'
import MediaGrid from '../components/client/MediaGrid'
import Header from '../components/Portfolio/Header'
import Footer from '../components/Portfolio/Footer'
import Cursor from '../components/common/Cursor'
import api from '../services/api'

const INTRO_SEEN_KEY = 'client_gallery_intro_seen'

const ClientGallery = () => {
  const { token } = useParams()
  const [accessToken, setAccessToken] = useState(null)
  const [galleryData, setGalleryData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [introMessageSeen, setIntroMessageSeen] = useState(false)

  const authenticated = !!accessToken && !!galleryData
  const introMessage = (galleryData?.gallery?.client_access_intro_message || '').trim()
  const showIntro = authenticated && introMessage.length > 0 && !introMessageSeen

  useEffect(() => {
    if (!token) return
    api.get(`/api/client/settings/${token}`).then((res) => {
      const url = res?.data?.data?.client_access_background_url ?? res?.data?.client_access_background_url ?? ''
      setBackgroundUrl(String(url || ''))
    }).catch(() => setBackgroundUrl(''))
  }, [token])

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

  const markIntroSeen = useCallback(() => {
    setIntroMessageSeen(true)
    try {
      const id = galleryData?.gallery?.id
      if (id) sessionStorage.setItem(INTRO_SEEN_KEY, id)
    } catch (_) {}
  }, [galleryData?.gallery?.id])

  useEffect(() => {
    try {
      const seenId = sessionStorage.getItem(INTRO_SEEN_KEY)
      if (seenId && galleryData?.gallery?.id === seenId) setIntroMessageSeen(true)
    } catch (_) {}
  }, [galleryData?.gallery?.id])

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
        <PasswordPrompt token={token} onSuccess={handleAuthSuccess} backgroundUrl={backgroundUrl} />
      </div>
    )
  }

  if (showIntro) {
    return (
      <>
        <Helmet>
          <title>{galleryData?.gallery?.name || 'Gallery'} - Aziz Ayachi Photography</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Cursor />
        <ClientIntroMessage message={introMessage} onComplete={markIntroSeen} />
      </>
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
