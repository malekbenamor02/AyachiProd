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
    })
    return data?.data
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
