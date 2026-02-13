import api from './api'

const LARGE_FILE_THRESHOLD = 4 * 1024 * 1024 // 4 MB – use presigned above this to avoid 413

export const galleryService = {
  async getGalleries(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({ page, limit })
    if (search) params.append('search', search)
    const response = await api.get(`/api/galleries?${params}`)
    const data = response?.data?.data
    return data && typeof data === 'object' ? data : { data: [], pagination: null }
  },

  async getGalleryById(id) {
    const response = await api.get(`/api/galleries/${id}`)
    const data = response?.data
    return data?.data ?? data ?? null
  },

  async getGalleryFiles(id) {
    const response = await api.get(`/api/galleries/${id}/files`)
    const data = response?.data
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.data)) return data.data
    return []
  },

  async uploadFile(galleryId, file, onProgress) {
    const usePresigned = file.size > LARGE_FILE_THRESHOLD
    if (usePresigned) {
      const { data: initData } = await api.post(`/api/galleries/${galleryId}/upload-url`, {
        filename: file.name,
        content_type: file.type || 'application/octet-stream',
      })
      const payload = initData?.data ?? initData
      const putUrl = payload?.putUrl
      const filePath = payload?.filePath
      if (!putUrl || !filePath) throw new Error('Invalid upload URL response')
      const putRes = await fetch(putUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      })
      if (!putRes.ok) {
        const text = await putRes.text()
        throw new Error(text || `Upload failed: ${putRes.status}`)
      }
      const { data: completeData } = await api.post(`/api/galleries/${galleryId}/upload-complete`, {
        filePath,
        original_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
      })
      return completeData?.data?.file ?? completeData?.file ?? completeData
    }
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/api/galleries/${galleryId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress ? (e) => onProgress(e.loaded, e.total) : undefined,
    })
    const data = res?.data
    return data?.data?.file ?? data?.file ?? data
  },

  async createGallery(galleryData) {
    const response = await api.post('/api/galleries/create', galleryData)
    return response.data.data
  },

  async updateGallery(id, galleryData) {
    const response = await api.put(`/api/galleries/${id}`, galleryData)
    return response.data.data
  },

  async uploadGalleryBackground(galleryId, file) {
    const formData = new FormData()
    formData.append('image', file)
    const res = await api.post(`/api/galleries/${galleryId}/background`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const data = res?.data?.data ?? res?.data
    return data?.client_access_background_url ?? ''
  },

  async clearGalleryBackground(galleryId) {
    await api.put(`/api/galleries/${galleryId}`, { client_access_background_url: null })
  },

  async deleteGallery(id) {
    const response = await api.delete(`/api/galleries/${id}`)
    return response.data
  },

  async deleteGalleryFiles(galleryId, fileIds) {
    const response = await api.delete(`/api/galleries/${galleryId}/files`, {
      data: { fileIds },
    })
    return response?.data
  },

  async getQRCode(galleryId) {
    const response = await api.get(`/api/galleries/${galleryId}/qr`)
    return response.data.data
  },
}
