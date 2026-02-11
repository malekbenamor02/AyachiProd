import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { settingsService } from '../../services/settingsService'
import MaintenancePage from '../../pages/MaintenancePage'

/**
 * For non-admin paths, fetches maintenance status and shows MaintenancePage when enabled.
 * Admin paths (/admin/*) are never gated.
 */
const MaintenanceGate = ({ children }) => {
  const location = useLocation()
  const [maintenance, setMaintenance] = useState({ enabled: false, message: '' })
  const [loading, setLoading] = useState(true)

  const isAdminPath = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdminPath) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    settingsService
      .getMaintenance()
      .then((data) => {
        if (!cancelled) setMaintenance({ enabled: !!data?.enabled, message: data?.message || '' })
      })
      .catch(() => {
        if (!cancelled) setMaintenance({ enabled: false, message: '' })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [isAdminPath])

  if (isAdminPath) return children
  if (loading) return null
  if (maintenance.enabled) return <MaintenancePage message={maintenance.message} />
  return children
}

export default MaintenanceGate
