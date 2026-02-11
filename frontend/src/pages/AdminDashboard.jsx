import React from 'react'
import { Helmet } from 'react-helmet-async'
import Header from '../components/Portfolio/Header'
import Dashboard from '../components/admin/Dashboard'
import Cursor from '../components/common/Cursor'

const AdminDashboard = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Aziz Ayachi Photography</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Cursor />
      <Header />
      <Dashboard />
    </>
  )
}

export default AdminDashboard
