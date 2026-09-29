import React, { useState, useEffect } from 'react'
import { Bell, CheckCheck, AlertOctagon, AlertTriangle, Info, Package, Send, ShoppingCart, DollarSign } from 'lucide-react'
import { notificationAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'react-toastify'

const typeIcons = {
  SOS_REQUEST: { icon: AlertOctagon, color: 'text-red-500 bg-red-50' },
  LOW_STOCK: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
  RESOURCE_REQUEST: { icon: AlertTriangle, color: 'text-blue-500 bg-blue-50' },
  PO_APPROVAL: { icon: ShoppingCart, color: 'text-purple-500 bg-purple-50' },
  INVENTORY_RECEIVED: { icon: Package, color: 'text-green-500 bg-green-50' },
  DISPATCH_APPROVED: { icon: Send, color: 'text-blue-500 bg-blue-50' },
  DISPATCH_DELIVERED: { icon: Send, color: 'text-green-500 bg-green-50' },
  BUDGET_ALERT: { icon: DollarSign, color: 'text-amber-500 bg-amber-50' },
  SYSTEM: { icon: Info, color: 'text-slate-500 bg-slate-50' },
}

const severityBadge = {
  CRITICAL: 'badge-red',
  WARNING: 'badge-yellow',
  INFO: 'badge-blue',
}

function timeAgo(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try { const res = await notificationAPI.getAll(); setNotifications(res.data) }
    catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id) => {
    await notificationAPI.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'critical') return n.severity === 'CRITICAL'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-xs">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1">
        {['all','unread','critical'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f}{f === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications"
          description={filter === 'unread' ? 'You\'re all caught up!' : 'No notifications to display.'} />
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const cfg = typeIcons[n.type] || typeIcons.SYSTEM
            const Icon = cfg.icon
            return (
              <div key={n.id}
                className={`card p-4 flex items-start gap-4 transition-all ${!n.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</h3>
                        <span className={`badge ${severityBadge[n.severity] || 'badge-slate'}`}>{n.severity}</span>
                        {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-slate-400">{timeAgo(n.createdAt)}</div>
                      {!n.read && (
                        <button onClick={() => handleMarkRead(n.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1 whitespace-nowrap">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
