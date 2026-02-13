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
   * Upload multiple work images one-by-one with progress (0-100).
   * Retries each file up to 3 times, 2 min timeout per request.
   * Returns { successCount, failedCount, lastError } so caller can show partial success.
   */
  async uploadWorkImagesWithProgress(sectionId, files, altText = '', onProgress) {
    const list = Array.isArray(files) ? files : [files]
    if (list.length === 0) return { successCount: 0, failedCount: 0, lastError: null }
    const total = list.length
    const UPLOAD_TIMEOUT_MS = 2 * 60 * 1000
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000
    let successCount = 0
    let lastError = null

    for (let i = 0; i < list.length; i++) {
      onProgress?.(Math.round((i / total) * 100))
      const formData = new FormData()
      formData.append('image', list[i])
      if (altText) formData.append('alt_text', altText)

      let done = false
      for (let attempt = 0; attempt < MAX_RETRIES && !done; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        }
        try {
          await api.post(`/api/sections/${sectionId}/work-images/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: UPLOAD_TIMEOUT_MS,
            onUploadProgress: (ev) => {
              if (ev.total && ev.total > 0) {
                const filePct = ev.loaded / ev.total
                const overall = ((i + filePct) / total) * 100
                onProgress?.(Math.round(Math.min(99, overall)))
              }
            },
          })
          successCount += 1
          done = true
        } catch (err) {
          const msg =
            (err.response?.data?.error && String(err.response.data.error)) ||
            (err.message && String(err.message)) ||
            'Upload failed'
          lastError = msg
          if (attempt === MAX_RETRIES - 1) {
            // last attempt failed, continue to next file
            break
          }
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
