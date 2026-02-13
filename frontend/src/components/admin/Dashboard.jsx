import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { statisticsService } from '../../services/statisticsService'
import GalleryList from './GalleryList'
import GalleryDetail from './GalleryDetail'
import GalleryForm from './GalleryForm'
import ShowcaseEditor from './ShowcaseEditor'
import SectionsEditor from './SectionsEditor'
import BookingsList from './BookingsList'
import SessionsCalendar from './SessionsCalendar'
import MaintenanceEditor from './MaintenanceEditor'
import '../../styles/index.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list', 'detail', 'create', 'edit', 'showcase', 'sections', 'bookings', 'calendar', 'maintenance'
  const [selectedGalleryId, setSelectedGalleryId] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const statsData = await statisticsService.getStatistics()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGallery = (galleryId) => {
    setSelectedGalleryId(galleryId)
    setView('detail')
  }

  const handleCreateNew = () => {
    setSelectedGalleryId(null)
    setView('create')
  }

  const handleSave = () => {
    setView('list')
    setSelectedGalleryId(null)
    loadStats()
  }

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header-content">
          <h1 className="admin-dashboard-title">
            <span className="word-wrapper">
              <span className="word">Dashboard</span>
            </span>
          </h1>
          <p className="admin-dashboard-subtitle">Welcome back, {user?.full_name || user?.email}</p>
        </div>
        <button onClick={logout} className="admin-dashboard-logout-button">
          <span>Logout</span>
          <span className="logout-arrow">→</span>
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="admin-dashboard-stats">
          <StatCard title="Total Galleries" value={stats.total_galleries} index={0} />
          <StatCard title="Total Files" value={stats.total_files} index={1} />
          <StatCard title="Storage Used" value={`${stats.total_storage_gb} GB`} index={2} />
          <StatCard title="Total Access" value={stats.total_access_count} index={3} />
        </div>
      )}

      {/* Homepage editors */}
      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button
          type="button"
          onClick={() => setView('showcase')}
          className="admin-dashboard-logout-button"
          style={{ background: 'transparent', color: '#000', border: '1px solid #000' }}
        >
          Edit homepage showcase (marquee images)
        </button>
        <button
          type="button"
          onClick={() => setView('sections')}
          className="admin-dashboard-logout-button"
          style={{ background: 'transparent', color: '#000', border: '1px solid #000' }}
        >
          Edit homepage sections (project grid)
        </button>
        <button
          type="button"
          onClick={() => setView('bookings')}
          className="admin-dashboard-logout-button"
          style={{ background: 'transparent', color: '#000', border: '1px solid #000' }}
        >
          Session bookings
        </button>
        <button
          type="button"
          onClick={() => setView('calendar')}
          className="admin-dashboard-logout-button"
          style={{ background: 'transparent', color: '#000', border: '1px solid #000' }}
        >
          Work calendar
        </button>
        <button
          type="button"
          onClick={() => setView('maintenance')}
          className="admin-dashboard-logout-button"
          style={{ background: 'transparent', color: '#000', border: '1px solid #000' }}
        >
          Maintenance mode
        </button>
      </div>

      {/* Main Content */}
      {view === 'showcase' ? (
        <ShowcaseEditor onBack={() => setView('list')} onStatsRefresh={loadStats} />
      ) : view === 'sections' ? (
        <SectionsEditor onBack={() => setView('list')} onStatsRefresh={loadStats} />
      ) : view === 'bookings' ? (
        <BookingsList onBack={() => setView('list')} />
      ) : view === 'calendar' ? (
        <SessionsCalendar onBack={() => setView('list')} />
      ) : view === 'maintenance' ? (
        <MaintenanceEditor onBack={() => setView('list')} />
      ) : view === 'create' ? (
        <GalleryForm
          onSave={handleSave}
          onCancel={() => setView('list')}
        />
      ) : view === 'detail' ? (
        <GalleryDetail
          galleryId={selectedGalleryId}
          onBack={() => setView('list')}
          onStatsRefresh={loadStats}
        />
      ) : (
        <GalleryList
          onSelectGallery={handleSelectGallery}
          onCreateNew={handleCreateNew}
          onStatsRefresh={loadStats}
        />
      )}
    </div>
  )
}

const StatCard = ({ title, value, index = 0 }) => (
  <div 
    className="admin-stat-card"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <p className="admin-stat-card-title">{title}</p>
    <p className="admin-stat-card-value">{value}</p>
  </div>
)

export default Dashboard
