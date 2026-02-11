import React, { useState, useEffect, useCallback } from 'react'
import { showcaseService } from '../../services/showcaseService'
import '../../styles/index.css'

const FALLBACK_ITEMS = [
  { src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=560&fit=crop', alt: 'Portrait Photography', cardClass: 'card-a' },
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=560&fit=crop', alt: 'Wedding Photography', cardClass: 'card-b' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=560&fit=crop', alt: 'Fashion Photography', cardClass: 'card-c' },
  { src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=560&fit=crop', alt: 'Event Photography', cardClass: 'card-a' },
  { src: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=560&fit=crop', alt: 'Commercial Photography', cardClass: 'card-b' },
  { src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=560&fit=crop', alt: 'Editorial Photography', cardClass: 'card-c' },
]

const CARD_CLASSES = ['card-a', 'card-b', 'card-c']
const SHOWCASE_CACHE_KEY = 'showcase_images'
const SHOWCASE_CACHE_TS_KEY = 'showcase_images_ts'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 min
const PRELOAD_LIMIT = 12

function getCachedShowcase() {
  try {
    const ts = sessionStorage.getItem(SHOWCASE_CACHE_TS_KEY)
    const raw = sessionStorage.getItem(SHOWCASE_CACHE_KEY)
    if (!raw || !ts) return null
    if (Date.now() - parseInt(ts, 10) > CACHE_TTL_MS) return null
    const data = JSON.parse(raw)
    return Array.isArray(data) && data.length > 0 ? data : null
  } catch {
    return null
  }
}

function setCachedShowcase(data) {
  try {
    if (Array.isArray(data) && data.length > 0) {
      sessionStorage.setItem(SHOWCASE_CACHE_KEY, JSON.stringify(data))
      sessionStorage.setItem(SHOWCASE_CACHE_TS_KEY, String(Date.now()))
    }
  } catch (_) {}
}

function mapApiToItems(data) {
  return data.map((img, i) => ({
    src: img.file_url,
    alt: img.alt_text || 'Showcase',
    cardClass: CARD_CLASSES[i % CARD_CLASSES.length],
  }))
}

function ensureImagePreconnects(items) {
  if (typeof document === 'undefined') return
  const origins = new Set()
  items.forEach(item => {
    try {
      const origin = new URL(item.src).origin
      origins.add(origin)
    } catch (_) {}
  })
  origins.forEach(origin => {
    if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = origin
      link.crossOrigin = ''
      document.head.appendChild(link)
    }
  })
}

function injectPreloadLinks(items) {
  if (typeof document === 'undefined') return []
  const links = []
  items.slice(0, PRELOAD_LIMIT).forEach(item => {
    if (document.querySelector(`link[rel="preload"][as="image"][href="${item.src}"]`)) return
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = item.src
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
    links.push(link)
  })
  return links
}

function preloadShowcaseImages(items) {
  if (typeof window === 'undefined') return Promise.resolve()
  const targets = items.slice(0, PRELOAD_LIMIT)
  const tasks = targets.map(item => new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    const img = new Image()
    img.decoding = 'async'
    img.crossOrigin = 'anonymous'
    img.fetchPriority = 'high'
    img.onload = finish
    img.onerror = finish
    img.src = item.src
    if (typeof img.decode === 'function') {
      img.decode().then(finish).catch(finish)
    }
  }))
  const timeout = new Promise(resolve => {
    setTimeout(resolve, 1500)
  })
  return Promise.race([Promise.all(tasks), timeout])
}

const MarqueeImage = ({ item, isEager }) => {
  const [loaded, setLoaded] = useState(false)
  const onLoad = useCallback(() => setLoaded(true), [])
  return (
    <div className={`marquee-item ${item.cardClass}`}>
      <div className={`marquee-image ${loaded ? 'marquee-image-loaded' : ''}`}>
        <img
          src={item.src}
          alt={item.alt}
          loading={isEager ? 'eager' : 'lazy'}
          fetchpriority={isEager ? 'high' : undefined}
          decoding="async"
          draggable="false"
          onLoad={onLoad}
        />
      </div>
    </div>
  )
}

const Marquee = () => {
  const cached = getCachedShowcase()
  const [items, setItems] = useState(() => cached ? mapApiToItems(cached) : FALLBACK_ITEMS)

  useEffect(() => {
    const apiUrl =
      import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
        ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
        : import.meta.env.DEV
          ? 'http://localhost:3001'
          : window.location.origin
    if (!apiUrl) return
    let link = document.querySelector(`link[rel="preconnect"][href="${apiUrl}"]`)
    if (!link) {
      link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = apiUrl
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let preloadLinks = []
    showcaseService.getImages()
      .then((data) => {
        if (cancelled) return
        if (Array.isArray(data) && data.length > 0) {
          const next = mapApiToItems(data)
          setCachedShowcase(data)
          setItems(next)
          ensureImagePreconnects(next)
          preloadLinks = injectPreloadLinks(next)
          preloadShowcaseImages(next)
            .catch(() => {})
            .finally(() => {
              if (cancelled || preloadLinks.length === 0) return
              preloadLinks.forEach(link => {
                if (link && link.parentNode) {
                  link.parentNode.removeChild(link)
                }
              })
              preloadLinks = []
            })
        } else {
          setItems(FALLBACK_ITEMS)
        }
      })
      .catch(() => {
        if (!cancelled) setItems(FALLBACK_ITEMS)
      })
    return () => {
      cancelled = true
      if (preloadLinks.length) {
        preloadLinks.forEach(link => {
          if (link && link.parentNode) {
            link.parentNode.removeChild(link)
          }
        })
        preloadLinks = []
      }
    }
  }, [])

  const marqueeItems = items.length > 0 ? items : FALLBACK_ITEMS
  const duplicatedItems = [...marqueeItems, ...marqueeItems]
  const count = marqueeItems.length
  const eagerThreshold = Math.min(count, PRELOAD_LIMIT)

  return (
    <section className="marquee-section">
      <div className="marquee-container">
        <div className="marquee-track">
          {duplicatedItems.map((item, index) => (
            <MarqueeImage
              key={`${item.src}-${index}`}
              item={item}
              isEager={index < eagerThreshold}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Marquee
