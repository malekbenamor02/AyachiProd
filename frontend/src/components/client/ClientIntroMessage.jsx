import React, { useState, useEffect, useCallback } from 'react'
import '../../styles/index.css'

const INTRO_DURATION_MS = 1500
const SHOW_DURATION_MS = 4500
const OUTRO_DURATION_MS = 1000

const ClientIntroMessage = ({ message, onComplete }) => {
  const [phase, setPhase] = useState('intro') // 'intro' | 'visible' | 'outro' | 'done'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const startOutro = useCallback(() => {
    setPhase('outro')
  }, [])

  useEffect(() => {
    if (!mounted || phase === 'done') return
    if (phase === 'intro') {
      const id = setTimeout(() => setPhase('visible'), INTRO_DURATION_MS)
      return () => clearTimeout(id)
    }
    if (phase === 'visible') {
      const id = setTimeout(startOutro, SHOW_DURATION_MS)
      return () => clearTimeout(id)
    }
    if (phase === 'outro') {
      const id = setTimeout(() => {
        setPhase('done')
        onComplete()
      }, OUTRO_DURATION_MS)
      return () => clearTimeout(id)
    }
  }, [mounted, phase, startOutro, onComplete])

  const handleContinue = () => {
    if (phase === 'visible') startOutro()
  }

  const isOutro = phase === 'outro' || phase === 'done'
  const isIntro = phase === 'intro'

  return (
    <div
      className="client-intro-message"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#FFFFFF',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 9999,
        fontFamily: "'Caveat', cursive",
      }}
      aria-live="polite"
      aria-label="Transition message"
    >
      <div
        style={{
          maxWidth: 'min(90vw, 560px)',
          textAlign: 'center',
          opacity: !mounted || isIntro ? 0 : isOutro ? 0 : 1,
          transform: `scale(${!mounted || isIntro ? 0.92 : isOutro ? 0.98 : 1})`,
          transition: isIntro
            ? `opacity ${INTRO_DURATION_MS}ms ease-out, transform ${INTRO_DURATION_MS}ms ease-out`
            : isOutro
              ? `opacity ${OUTRO_DURATION_MS}ms ease-in, transform ${OUTRO_DURATION_MS}ms ease-in`
              : 'none',
        }}
      >
        <p
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 500,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {message}
        </p>
        <button
          type="button"
          onClick={handleContinue}
          style={{
            marginTop: '32px',
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: '#000000',
            border: '2px solid #000000',
            borderRadius: '8px',
            fontFamily: "'Caveat', cursive",
            fontSize: '24px',
            cursor: 'pointer',
            opacity: phase === 'visible' ? 1 : 0,
            pointerEvents: phase === 'visible' ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        >
          See my photos
        </button>
      </div>
    </div>
  )
}

export default ClientIntroMessage
