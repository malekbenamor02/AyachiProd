import api from './api'

const LARGE_FILE_THRESHOLD = 4 * 1024 * 1024 // 4 MB – use presigned above this to avoid 413

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
    const usePresigned = file.size > LARGE_FILE_THRESHOLD
    if (usePresigned) {
      const { data: initData } = await api.post('/api/showcase/upload-url', {
        filename: file.name,
        content_type: file.type || 'image/jpeg',
        alt_text: altText || '',
      })
      const payload = initData?.data ?? initData
      const putUrl = payload?.putUrl
      const filePath = payload?.filePath
      if (!putUrl || !filePath) throw new Error('Invalid upload URL response')
      const putRes = await fetch(putUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      })
      if (!putRes.ok) {
        const text = await putRes.text()
        throw new Error(text || `Upload failed: ${putRes.status}`)
      }
      const { data: completeData } = await api.post('/api/showcase/upload-complete', {
        filePath,
        alt_text: altText || 'Showcase image',
      })
      return completeData?.data ?? completeData
    }
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
