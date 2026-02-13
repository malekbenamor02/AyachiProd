import api from './api'

export const showcaseService = {
  async getImages() {
    try {
      const res = await api.get('/api/showcase')
      const data = res?.data
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.data)) return data.data
      return []
    } catch (e) {
      throw e
    }
  },

  async uploadImage(file, altText = '') {
    const formData = new FormData()
    formData.append('image', file)
    if (altText) formData.append('alt_text', altText)
    const res = await api.post('/api/showcase/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const data = res?.data
    return data?.data ?? data
  },

  async deleteImage(id) {
    await api.delete(`/api/showcase/${id}`)
  },
}
