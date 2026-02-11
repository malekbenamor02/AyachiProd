import api from './api'

export const showcaseService = {
  async getImages() {
    const { data } = await api.get('/api/showcase')
    return data?.data ?? []
  },

  async uploadImage(file, altText = '') {
    const formData = new FormData()
    formData.append('image', file)
    if (altText) formData.append('alt_text', altText)
    const { data } = await api.post('/api/showcase/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data?.data
  },

  async deleteImage(id) {
    await api.delete(`/api/showcase/${id}`)
  },
}
