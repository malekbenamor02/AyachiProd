import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ClientGallery from './pages/ClientGallery'
import WorkDetail from './pages/WorkDetail'
import BookSession from './pages/BookSession'
import ProtectedRoute from './components/admin/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book" element={<BookSession />} />
      <Route path="/work/:id" element={<WorkDetail />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/gallery/:token" element={<ClientGallery />} />
    </Routes>
  )
}

export default App
