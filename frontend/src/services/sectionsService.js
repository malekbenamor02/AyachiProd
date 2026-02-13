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
   * Upload work images via presigned URL (direct to R2). Avoids 413 - supports large files.
   * Flow: get upload-url -> PUT file to R2 -> confirm. One file at a time with progress.
   */
  async uploadWorkImagesWithProgress(sectionId, files, altText = '', onProgress) {
    const list = Array.isArray(files) ? files : [files]
    if (list.length === 0) return { successCount: 0, failedCount: 0, lastError: null }
    const total = list.length
    const MAX_RETRIES = 4
    const RETRY_DELAY_MS = 1500
    const DELAY_BETWEEN_FILES_MS = 200
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
      const filename = file.name || 'file'
      const contentType = file.type || 'application/octet-stream'
      let done = false
      for (let attempt = 0; attempt < MAX_RETRIES && !done; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        try {
          const { data: urlData } = await api.post(`/api/sections/${sectionId}/work-images/upload-url`, {
            filename,
            content_type: contentType,
          })
          const { putUrl, filePath } = urlData || {}
          if (!putUrl || !filePath) throw new Error('Invalid upload URL response')
          const putRes = await fetch(putUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': contentType },
          })
          if (!putRes.ok) throw new Error(`Upload failed: ${putRes.status}`)
          await api.post(`/api/sections/${sectionId}/work-images/confirm`, {
            filePath,
            file_type: fileTypeFromMime(contentType),
            alt_text: altText || '',
          })
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
