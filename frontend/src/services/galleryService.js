import api from './api'

export const galleryService = {
  async getGalleries(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({ page, limit })
    if (search) params.append('search', search)
    
    const response = await api.get(`/api/galleries?${params}`)
    return response.data.data
  },

  async getGalleryById(id) {
    const response = await api.get(`/api/galleries/${id}`)
    return response.data.data
  },

  async getGalleryFiles(id) {
    const response = await api.get(`/api/galleries/${id}/files`)
    return response.data.data || []
  },

  async createGallery(galleryData) {
    const response = await api.post('/api/galleries/create', galleryData)
    return response.data.data
  },

  async updateGallery(id, galleryData) {
    const response = await api.put(`/api/galleries/${id}`, galleryData)
    return response.data.data
  },

  async deleteGallery(id) {
    const response = await api.delete(`/api/galleries/${id}`)
    return response.data
  },

  async getQRCode(galleryId) {
    const response = await api.get(`/api/galleries/${galleryId}/qr`)
    return response.data.data
  },
}
