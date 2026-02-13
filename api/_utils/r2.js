import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3'
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
 * Generate file path for client access background (admin-uploaded)
 */
export function generateClientAccessBackgroundPath(originalFileName) {
  const timestamp = Date.now()
  const sanitized = (originalFileName || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_')
  return `client-access/${timestamp}-${sanitized}`
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

/**
 * Initiate multipart upload (for chunked large files). Returns uploadId.
 */
export async function createMultipartUpload(filePath, contentType = 'application/octet-stream') {
  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    ContentType: contentType,
  })
  const out = await r2Client.send(command)
  return { uploadId: out.UploadId }
}

/**
 * Upload one part of a multipart upload (server-side).
 */
export async function uploadPart(uploadId, filePath, partNumber, body) {
  const command = new UploadPartCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    UploadId: uploadId,
    PartNumber: partNumber,
    Body: body,
  })
  const out = await r2Client.send(command)
  return { etag: out.ETag }
}

/**
 * Presigned URL for client to upload one part directly to R2 (avoids Vercel body limit).
 * S3/R2 minimum part size is 5 MB except for the last part.
 */
export async function getPresignedUploadPartUrl(uploadId, filePath, partNumber, expiresIn = 900) {
  const command = new UploadPartCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    UploadId: uploadId,
    PartNumber: partNumber,
  })
  const url = await getSignedUrl(r2Client, command, { expiresIn })
  return url
}

/**
 * Complete multipart upload.
 * parts: Array<{ PartNumber: number, ETag: string }>
 */
export async function completeMultipartUpload(uploadId, filePath, parts) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.map((p) => ({ PartNumber: p.PartNumber, ETag: p.ETag })),
    },
  })
  await r2Client.send(command)
  const fileUrl = CDN_URL ? `${CDN_URL.replace(/\/$/, '')}/${filePath}` : filePath
  return { filePath, fileUrl }
}

/**
 * Abort multipart upload (cleanup on failure).
 */
export async function abortMultipartUpload(uploadId, filePath) {
  await r2Client.send(
    new AbortMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      UploadId: uploadId,
    })
  )
}
