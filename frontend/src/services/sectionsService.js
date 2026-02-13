import api from './api'

export const sectionsService = {
  async getSections() {
    const { data } = await api.get('/api/sections')
    return data?.data ?? []
  },

  async getSectionById(id) {
    const { data } = await api.get(`/api/sections/${id}`)
    return data?.data
  },

  async uploadSection(file, { title = '', category_id = '', section_month = '', section_year = '', alt_text = '' }) {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('title', title)
    if (category_id) formData.append('category_id', category_id)
    if (section_month) formData.append('section_month', String(section_month))
    if (section_year) formData.append('section_year', String(section_year))
    if (alt_text) formData.append('alt_text', alt_text)
    const { data } = await api.post('/api/sections/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data?.data
  },

  async updateSection(id, { title, category_id, section_month, section_year, alt_text }) {
    const payload = {}
    if (title !== undefined) payload.title = title
    if (category_id !== undefined) payload.category_id = category_id || null
    if (section_month !== undefined) payload.section_month = section_month
    if (section_year !== undefined) payload.section_year = section_year
    if (alt_text !== undefined) payload.alt_text = alt_text
    const { data } = await api.put(`/api/sections/${id}`, payload)
    return data?.data
  },

  async deleteSection(id) {
    await api.delete(`/api/sections/${id}`)
  },

  async reorderSections(orderedIds) {
    await api.patch('/api/sections/reorder', { order: orderedIds })
  },

  async getWorkImages(sectionId) {
    const { data } = await api.get(`/api/sections/${sectionId}/work-images`)
    return data?.data ?? []
  },

  async uploadWorkImage(sectionId, fileOrFiles, altText = '') {
    const formData = new FormData()
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
    files.forEach((file) => formData.append('image', file))
    if (altText) formData.append('alt_text', altText)
    const { data } = await api.post(`/api/sections/${sectionId}/work-images/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 2 * 60 * 1000,
    })
    return data?.data
  },

  /**
   * Upload work images: small files (≤4MB) via single multipart; large files via chunked upload (no limit).
   * All go to R2 and DB. Progress and retries included.
   */
  async uploadWorkImagesWithProgress(sectionId, files, altText = '', onProgress) {
    const list = Array.isArray(files) ? files : [files]
    if (list.length === 0) return { successCount: 0, failedCount: 0, lastError: null }
    const total = list.length
    const MAX_RETRIES = 4
    const RETRY_DELAY_MS = 1500
    const DELAY_BETWEEN_FILES_MS = 200
    const CHUNK_SIZE = 4 * 1024 * 1024 // 4MB per chunk (under Vercel body limit)
    const SIMPLE_UPLOAD_MAX = CHUNK_SIZE
    let successCount = 0
    let lastError = null

    function fileTypeFromMime(mime) {
      if (!mime) return 'file'
      if (mime.startsWith('image/')) return 'image'
      if (mime.startsWith('video/')) return 'video'
      return 'file'
    }

    for (let i = 0; i < list.length; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, DELAY_BETWEEN_FILES_MS))
      onProgress?.(Math.round((i / total) * 100))

      const file = list[i]
      const contentType = file.type || 'application/octet-stream'
      let done = false
      for (let attempt = 0; attempt < MAX_RETRIES && !done; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        try {
          if (file.size <= SIMPLE_UPLOAD_MAX) {
            const formData = new FormData()
            formData.append('image', file)
            if (altText) formData.append('alt_text', altText)
            await api.post(`/api/sections/${sectionId}/work-images/upload`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 2 * 60 * 1000,
              onUploadProgress: (ev) => {
                if (ev.total && ev.total > 0) {
                  const filePct = ev.loaded / ev.total
                  const overall = ((i + filePct) / total) * 100
                  onProgress?.(Math.round(Math.min(99, overall)))
                }
              },
            })
          } else {
            const { data: initData } = await api.post(`/api/sections/${sectionId}/work-images/upload-init`, {
              filename: file.name || 'file',
              content_type: contentType,
            })
            const { uploadId, filePath } = initData || {}
            if (!uploadId || !filePath) throw new Error('Invalid upload-init response')
            const partCount = Math.ceil(file.size / CHUNK_SIZE)
            const parts = []
            for (let p = 1; p <= partCount; p++) {
              const start = (p - 1) * CHUNK_SIZE
              const end = Math.min(p * CHUNK_SIZE, file.size)
              const chunk = file.slice(start, end)
              const partRes = await api.post(`/api/sections/${sectionId}/work-images/upload-part`, chunk, {
                headers: {
                  'Content-Type': 'application/octet-stream',
                  'X-Upload-Id': uploadId,
                  'X-File-Path': filePath,
                  'X-Part-Number': String(p),
                },
                timeout: 2 * 60 * 1000,
                onUploadProgress: (ev) => {
                  if (ev.total && ev.total > 0 && partCount > 0) {
                    const partPct = ev.loaded / ev.total
                    const overall = ((i + (p - 1 + partPct) / partCount) / total) * 100
                    onProgress?.(Math.round(Math.min(99, overall)))
                  }
                },
              })
              const etag = partRes?.data?.data?.etag || partRes?.data?.etag
              if (!etag) throw new Error('Missing etag from part upload')
              parts.push({ partNumber: p, etag })
            }
            await api.post(`/api/sections/${sectionId}/work-images/upload-complete`, {
              uploadId,
              filePath,
              sectionId,
              parts,
              file_type: fileTypeFromMime(contentType),
              alt_text: altText || '',
            })
          }
          successCount += 1
          done = true
        } catch (err) {
          const msg =
            (err.response?.data?.error && String(err.response.data.error)) ||
            (err.message && String(err.message)) ||
            'Upload failed'
          lastError = msg
          if (attempt === MAX_RETRIES - 1) break
        }
      }
      onProgress?.(Math.round(((i + 1) / total) * 100))
    }

    return {
      successCount,
      failedCount: total - successCount,
      lastError: total - successCount > 0 ? lastError : null,
    }
  },

  async deleteWorkImage(sectionId, imageId) {
    await api.delete(`/api/sections/${sectionId}/work-images/${imageId}`)
  },

  async reorderWorkImages(sectionId, orderedIds) {
    await api.patch(`/api/sections/${sectionId}/work-images/reorder`, { order: orderedIds })
  },
}

export const sectionCategoriesService = {
  async getCategories() {
    const { data } = await api.get('/api/section-categories')
    return data?.data ?? []
  },

  async createCategory(name) {
    const { data } = await api.post('/api/section-categories', { name: name.trim() })
    return data?.data
  },
}
