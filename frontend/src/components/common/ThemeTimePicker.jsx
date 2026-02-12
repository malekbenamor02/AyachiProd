import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/index.css'

function formatDisplay(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  if (h === 0 && m === 0) return '12:00 AM'
  if (h === 12 && m === 0) return '12:00 PM'
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  const min = String(m).padStart(2, '0')
  return `${h12}:${min} ${ampm}`
}

const TIME_OPTIONS = (() => {
  const opts = []
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return opts
})()

const ThemeTimePicker = ({ value, onChange, id, name, className = '', placeholder = 'Select time (optional)' }) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 200 })

  useEffect(() => {
    if (!open || !containerRef.current) return
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: Math.max(200, Math.min(280, rect.width)),
        })
      }
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handle = (e) => {
      const inTrigger = containerRef.current && containerRef.current.contains(e.target)
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target)
      if (!inTrigger && !inDropdown) setOpen(false)
    }
    const escape = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const clear = () => {
    onChange('')
    setOpen(false)
  }

  const displayText = value ? formatDisplay(value) : ''

  return (
    <div className={`theme-time-picker ${open ? 'theme-time-picker--open' : ''} ${className}`} ref={containerRef}>
      <input type="hidden" name={name} value={value || ''} />
      <button
        type="button"
        id={id}
        className="theme-time-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={displayText ? '' : 'theme-time-picker-placeholder'}>{displayText || placeholder}</span>
        <span className="theme-time-picker-chevron" aria-hidden>▼</span>
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="theme-time-picker-dropdown theme-time-picker-dropdown--portal"
          role="listbox"
          aria-label="Choose time"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            minWidth: 200,
            maxWidth: 280,
            zIndex: 10001,
          }}
        >
          <div className="theme-time-picker-list">
            {TIME_OPTIONS.map((opt) => {
              const isSelected = value === opt
              return (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`theme-time-picker-option ${isSelected ? 'theme-time-picker-option--selected' : ''}`}
                  onClick={() => {
                    onChange(opt)
                    setOpen(false)
                  }}
                >
                  {formatDisplay(opt)}
                </button>
              )
            })}
          </div>
          <div className="theme-time-picker-actions">
            <button type="button" className="theme-time-picker-action" onClick={clear}>
              Clear
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default ThemeTimePicker
