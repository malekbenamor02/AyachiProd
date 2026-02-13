import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2 configuration (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME
const CDN_URL = process.env.R2_CDN_URL

/**
 * Upload file to R2
 */
export async function uploadFileToR2(fileName, fileBuffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  })

  await r2Client.send(command)
  
  return {
    filePath: fileName,
    fileUrl: `${CDN_URL}/${fileName}`,
  }
}

/**
 * Delete file from R2
 */
export async function deleteFileFromR2(fileName) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  })

  await r2Client.send(command)
}

/**
 * Generate presigned URL for upload (PUT). Client uploads file directly to R2 to avoid body size limits.
 */
export async function getPresignedPutUrl(filePath, contentType = 'application/octet-stream', expiresIn = 900) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    ContentType: contentType,
  })
  const url = await getSignedUrl(r2Client, command, { expiresIn })
  return url
}

/**
 * Generate presigned URL for download
 */
export async function getPresignedUrl(fileName, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  })

  const url = await getSignedUrl(r2Client, command, { expiresIn })
  return url
}

/**
 * Generate presigned URL that forces download (Content-Disposition: attachment)
 */
export async function getPresignedDownloadUrl(filePath, downloadFileName, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    ResponseContentDisposition: `attachment; filename="${(downloadFileName || 'download').replace(/"/g, '%22')}"`,
  })

  const url = await getSignedUrl(r2Client, command, { expiresIn })
  return url
}

/**
 * Generate file path for gallery
 */
export function generateFilePath(galleryId, originalFileName) {
  const timestamp = Date.now()
  const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `galleries/${galleryId}/${timestamp}-${sanitizedFileName}`
}

/**
 * Generate file path for showcase/marquee images
 */
export function generateShowcaseFilePath(originalFileName) {
  const timestamp = Date.now()
  const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `showcase/${timestamp}-${sanitizedFileName}`
}

/**
 * Generate file path for homepage section images
 */
export function generateSectionFilePath(originalFileName) {
  const timestamp = Date.now()
  const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `sections/${timestamp}-${sanitizedFileName}`
}

/**
 * Generate file path for section work images (below poster on work detail)
 */
export function generateSectionWorkImageFilePath(sectionId, originalFileName) {
  const timestamp = Date.now()
  const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `sections/${sectionId}/work/${timestamp}-${sanitizedFileName}`
}
