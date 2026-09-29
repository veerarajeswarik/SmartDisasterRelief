import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useAuth } from '../../context/AuthContext'

export default function AppLayout() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Redirect to login if no user or no token
  const token = localStorage.getItem('token')
  if (!user || !token) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
        toastStyle={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
      />
    </div>
  )
}
