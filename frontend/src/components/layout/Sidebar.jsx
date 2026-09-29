import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Megaphone, Warehouse, Tent, Package,
  Truck, ShoppingCart, Send, PiggyBank, BookOpen,
  BarChart3, Bell, Settings, LogOut, ChevronRight,
  Shield, Users, AlertTriangle, X, Menu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/campaigns', label: 'Disaster Campaigns', icon: Megaphone },
  { path: '/hubs', label: 'Relief Hubs', icon: Warehouse },
  { path: '/camps', label: 'Camps & Recipients', icon: Tent },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/suppliers', label: 'Suppliers', icon: Users },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { path: '/dispatches', label: 'Dispatches', icon: Send },
  { path: '/requests', label: 'Resource Requests', icon: AlertTriangle },
  { path: '/budget', label: 'Budget & Funds', icon: PiggyBank },
  { path: '/accounting', label: 'Accounting', icon: BookOpen },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
]

const bottomItems = [
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/audit-logs', label: 'Audit Logs', icon: Shield, adminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings },
]

function SidebarLink({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `sidebar-nav-item ${isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
      }
      title={collapsed ? item.label : ''}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleBottom = bottomItems.filter(item => !item.adminOnly || isAdmin())

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-tight">Disaster Relief</div>
            <div className="text-slate-400 text-xs">Command Center</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-0.5">
        {visibleBottom.map(item => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-slate-400 hover:bg-red-900/40 hover:text-red-400"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.fullName}</div>
              <div className="text-slate-400 text-xs truncate">
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-slate-900 transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 relative`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-blue-600 shadow-sm z-10"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm">Disaster Relief</span>
              </div>
              <button onClick={onMobileClose} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
