import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ClientGallery from './pages/ClientGallery'
import WorkDetail from './pages/WorkDetail'
import BookSession from './pages/BookSession'
import NotFound404 from './pages/NotFound404'
import ProtectedRoute from './components/admin/ProtectedRoute'
import MaintenanceGate from './components/admin/MaintenanceGate'

function App() {
  return (
    <MaintenanceGate>
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
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </MaintenanceGate>
  )
}

export default App
