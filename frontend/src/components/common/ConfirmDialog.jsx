import React, { useEffect } from 'react'
import '../../styles/index.css'

/**
 * Reusable confirmation / alert dialog with a consistent design.
 * Use for confirmations (OK + Cancel) or alerts (OK only).
 *
 * @param {boolean} open - Whether the dialog is visible
 * @param {string} title - Dialog title (e.g. "Delete gallery?")
 * @param {string} message - Body text
 * @param {string} [confirmLabel='OK'] - Primary button label
 * @param {string|null} [cancelLabel='Cancel'] - Secondary button label; set to null for alert-only (one button)
 * @param {function} onConfirm - Called when primary button is clicked
 * @param {function} [onCancel] - Called when secondary button or backdrop is clicked
 * @param {'danger'|'default'} [variant='default'] - Visual variant (danger = destructive action)
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}) => {
  const isAlert = cancelLabel == null || (typeof cancelLabel === 'string' && cancelLabel === '')

  useEffect(() => {
    if (!open) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') (onCancel || (() => {}))()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onCancel])

  if (!open) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onCancel) onCancel()
  }

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className={`confirm-dialog confirm-dialog--${variant}`}>
        <h2 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="confirm-dialog-message">
          {message}
        </p>
        <div className="confirm-dialog-actions">
          {!isAlert && (
            <button
              type="button"
              className="confirm-dialog-btn confirm-dialog-btn--secondary"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`confirm-dialog-btn confirm-dialog-btn--primary confirm-dialog-btn--${variant}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
