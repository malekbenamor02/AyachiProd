import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../styles/index.css'

/**
 * Options: array of { value: string, label: string }
 * Renders a theme-styled select with portaled dropdown so the list always appears on top.
 */
const ThemeSelect = ({
  value,
  onChange,
  options = [],
  id,
  name,
  className = '',
  placeholder = 'Select…',
  disabled = false,
  style,
}) => {
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
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(rect.width, 160),
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

  const selectedOption = options.find((o) => String(o.value) === String(value))
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  return (
    <div
      className={`theme-select ${open ? 'theme-select--open' : ''} ${className}`}
      ref={containerRef}
      style={style}
    >
      <input type="hidden" name={name} value={value ?? ''} />
      <button
        type="button"
        id={id}
        className="theme-select-trigger"
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={selectedOption ? '' : 'theme-select-placeholder'}>{displayLabel}</span>
        <span className="theme-select-chevron" aria-hidden>▼</span>
      </button>
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="theme-select-dropdown"
            role="listbox"
            aria-label={name || 'Options'}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: position.width,
              minWidth: 160,
              zIndex: 10001,
            }}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`theme-select-option ${isSelected ? 'theme-select-option--selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </div>
  )
}

export default ThemeSelect
