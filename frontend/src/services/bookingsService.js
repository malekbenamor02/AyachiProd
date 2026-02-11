import api from './api'

const BASE = '/api/bookings'

export const bookingsService = {
  /** Submit a booking (public, no auth) */
  async create(payload) {
    const { data } = await api.post(BASE, payload)
    return data?.data ?? data
  },

  /** List all bookings (admin) */
  async list() {
    const { data } = await api.get(BASE)
    return data?.data ?? []
  },

  /** Update booking status or fields (admin) */
  async update(id, payload) {
    const { data } = await api.patch(`${BASE}/${id}`, payload)
    return data?.data ?? data
  },
}

export default bookingsService
