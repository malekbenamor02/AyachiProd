import axios from 'axios'

// Production: use same origin (Vercel serves both frontend and /api). Dev: use local backend.
const API_URL =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
    : import.meta.env.DEV
      ? 'http://localhost:3001'
      : ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add admin token only for admin routes (never for /api/client/*)
api.interceptors.request.use((config) => {
  const isClientRoute = (config.url || '').includes('/api/client')
  if (!isClientRoute) {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Redirect to admin login only for admin routes; client gallery errors stay on page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isClientRoute = (error.config?.url || '').includes('/api/client')
      if (!isClientRoute) {
        localStorage.removeItem('admin_token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
