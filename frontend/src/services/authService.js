import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password })
    if (response.data.success) {
      localStorage.setItem('admin_token', response.data.data.token)
      return response.data.data
    }
    throw new Error(response.data.error || 'Login failed')
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me')
    return response.data.data.user
  },

  logout() {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/login'
  },

  isAuthenticated() {
    return !!localStorage.getItem('admin_token')
  },
}
