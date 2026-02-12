import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/index.css'

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function toYMD(d) {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYMD(str) {
  if (!str) return null
  const [y, m, day] = str.split('-').map(Number)
  if (!y || !m || !day) return null
  const d = new Date(y, m - 1, day)
  return isNaN(d.getTime()) ? null : d
}

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const daysInMonth = last.getDate()
  const total = startPad + daysInMonth
  const rows = Math.ceil(total / 7)
  const grid = []
  let day = 1
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < 7; c++) {
      const i = r * 7 + c
      if (i < startPad || day > daysInMonth) {
        row.push({ date: null, key: `e-${r}-${c}` })
      } else {
        row.push({ date: new Date(year, month, day), key: `d-${year}-${month}-${day}` })
        day++
      }
    }
    grid.push(row)
  }
  return grid
}

const ThemeDatePicker = ({ value, onChange, min, id, name, className = '', placeholder = 'Select date', required }) => {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const d = value ? parseYMD(value) : new Date()
    return d ? { year: d.getFullYear(), month: d.getMonth() } : { year: new Date().getFullYear(), month: new Date().getMonth() }
  })
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 280 })

  const minDate = min ? parseYMD(min) : null
  const valueDate = value ? parseYMD(value) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    if (!open || !containerRef.current) return
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: Math.max(280, Math.min(320, rect.width)),
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

  const grid = getMonthGrid(view.year, view.month)

  const prevMonth = () => {
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }))
  }

  const nextMonth = () => {
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }))
  }

  const isDisabled = (d) => {
    if (!d) return true
    const t = new Date(d)
    t.setHours(0, 0, 0, 0)
    if (minDate) {
      const m = new Date(minDate)
      m.setHours(0, 0, 0, 0)
      if (t < m) return true
    }
    return false
  }

  const selectDate = (d) => {
    if (!d || isDisabled(d)) return
    onChange(toYMD(d))
    setOpen(false)
  }

  const setToday = () => {
    if (!minDate || today >= minDate) {
      onChange(toYMD(today))
      setView({ year: today.getFullYear(), month: today.getMonth() })
      setOpen(false)
    }
  }

  const clear = () => {
    onChange('')
    setOpen(false)
  }

  const displayText = valueDate
    ? `${MONTHS[valueDate.getMonth()]} ${valueDate.getDate()}, ${valueDate.getFullYear()}`
    : ''

  return (
    <div className={`theme-date-picker ${open ? 'theme-date-picker--open' : ''} ${className}`} ref={containerRef}>
      <input type="hidden" name={name} value={value || ''} required={required} />
      <button
        type="button"
        id={id}
        className="theme-date-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={displayText ? '' : 'theme-date-picker-placeholder'}>{displayText || placeholder}</span>
        <span className="theme-date-picker-chevron" aria-hidden>▼</span>
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="theme-date-picker-dropdown theme-date-picker-dropdown--portal"
          role="dialog"
          aria-label="Choose date"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            minWidth: 280,
            maxWidth: 320,
            zIndex: 10001,
          }}
        >
          <div className="theme-date-picker-header">
            <button type="button" className="theme-date-picker-nav" onClick={prevMonth} aria-label="Previous month">
              ←
            </button>
            <span className="theme-date-picker-month">
              {MONTHS[view.month]} {view.year}
            </span>
            <button type="button" className="theme-date-picker-nav" onClick={nextMonth} aria-label="Next month">
              →
            </button>
          </div>
          <div className="theme-date-picker-day-names">
            {DAY_NAMES.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="theme-date-picker-grid">
            {grid.flatMap((row) =>
              row.map(({ date, key }) => {
                const disabled = isDisabled(date)
                const isSelected = valueDate && date && toYMD(date) === toYMD(valueDate)
                const isToday = date && toYMD(date) === toYMD(today)
                return (
                  <button
                    key={key}
                    type="button"
                    className={`theme-date-picker-day ${disabled ? 'theme-date-picker-day--disabled' : ''} ${isSelected ? 'theme-date-picker-day--selected' : ''} ${isToday ? 'theme-date-picker-day--today' : ''}`}
                    disabled={disabled}
                    onClick={() => selectDate(date)}
                  >
                    {date ? date.getDate() : ''}
                  </button>
                )
              })
            )}
          </div>
          <div className="theme-date-picker-actions">
            <button type="button" className="theme-date-picker-action" onClick={clear}>
              Clear
            </button>
            <button type="button" className="theme-date-picker-action" onClick={setToday}>
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default ThemeDatePicker
