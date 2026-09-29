import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Menu, ChevronDown, User, Settings, LogOut, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationAPI } from '../../services/api'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/campaigns': 'Disaster Campaigns',
  '/hubs': 'Relief Hubs',
  '/camps': 'Camps & Recipients',
  '/inventory': 'Inventory',
  '/products': 'Products',
  '/suppliers': 'Suppliers',
  '/purchase-orders': 'Purchase Orders',
  '/dispatches': 'Dispatches',
  '/requests': 'Resource Requests',
  '/budget': 'Budget & Funds',
  '/accounting': 'Accounting',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
}

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const profileRef = useRef(null)

  const title = pageTitles[location.pathname] ||
    Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] || 'Page'

  useEffect(() => {
    notificationAPI.getUnreadCount()
      .then(res => setUnreadCount(res.data.count || 0))
      .catch(() => {})
  }, [location.pathname])

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel = {
    ADMIN: 'Administrator',
    LOGISTICS_OFFICER: 'Logistics Officer',
    CAMP_REPRESENTATIVE: 'Camp Representative',
  }

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-slate-600 hover:text-slate-900">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-slate-800 leading-none">{user?.fullName}</div>
              <div className="text-xs text-slate-500 mt-0.5">{roleLabel[user?.role] || user?.role}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-lg py-1 fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-sm font-medium text-slate-800">{user?.fullName}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
              <button onClick={() => { navigate('/settings'); setProfileOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
