import QRCode from 'qrcode'
import crypto from 'crypto'

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ayachiprod.com'

/**
 * Generate a URL-safe random slug for gallery access (one per gallery, never regenerated).
 */
export function generateAccessSlug() {
  return crypto.randomBytes(16).toString('base64url')
}

/**
 * Build QR code and URL for a gallery using its permanent access_slug only.
 * Same slug every time; no regeneration.
 */
export async function generateQRCodeForSlug(accessSlug) {
  const galleryUrl = `${FRONTEND_URL}/gallery/${accessSlug}`

  const qrCodeDataUrl = await QRCode.toDataURL(galleryUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })

  return {
    qrCodeDataUrl,
    galleryUrl,
  }
}
