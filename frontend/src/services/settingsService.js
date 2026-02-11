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
}
