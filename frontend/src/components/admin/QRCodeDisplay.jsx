import React, { useState } from 'react'
import { galleryService } from '../../services/galleryService'
import '../../styles/index.css'

const QRCodeDisplay = ({ galleryId }) => {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadQR = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await galleryService.getQRCode(galleryId)
      setQrData(data)
    } catch (err) {
      setError(err.message || 'Failed to load QR code')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (galleryId) loadQR()
  }, [galleryId])

  const downloadQR = () => {
    if (!qrData?.qr_code_data) return

    const link = document.createElement('a')
    link.href = qrData.qr_code_data
    link.download = `qr-code-${galleryId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{
      padding: '32px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
        QR Code for Gallery
      </h3>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '24px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {qrData ? (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <img
              src={qrData.qr_code_data}
              alt="QR Code"
              style={{
                maxWidth: '300px',
                width: '100%',
                height: 'auto',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#FFFFFF'
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#525252', marginBottom: '8px' }}>
              Gallery URL:
            </p>
            <a
              href={qrData.gallery_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: '#000000',
                textDecoration: 'underline',
                wordBreak: 'break-all'
              }}
            >
              {qrData.gallery_url}
            </a>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={downloadQR}
              style={{
                padding: '10px 20px',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Download QR Code
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '14px', color: '#525252', marginBottom: '24px' }}>
            QR code for client access. This is the only link; it cannot be regenerated.
          </p>
          <button
            onClick={loadQR}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Show QR Code'}
          </button>
        </div>
      )}
    </div>
  )
}

export default QRCodeDisplay
