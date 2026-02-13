import api from './api'

const BASE = '/api/settings/maintenance'

export const settingsService = {
  async getMaintenance() {
    const response = await api.get(BASE)
    return response.data.data
  },

  async updateMaintenance({ enabled, message }) {
    const body = {}
    if (typeof enabled === 'boolean') body.enabled = enabled
    if (typeof message === 'string') body.message = message
    const response = await api.patch(BASE, body)
    return response.data.data
  },

  async getClientAccessSettings() {
    const response = await api.get('/api/settings/client-access')
    const data = response?.data?.data ?? response?.data
    return { background_url: data?.background_url ?? '' }
  },

  async uploadClientAccessBackground(file) {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/api/settings/client-access-background', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const data = response?.data?.data ?? response?.data
    return data?.background_url ?? ''
  },
}
