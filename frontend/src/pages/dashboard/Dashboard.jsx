import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Megaphone, Warehouse, Package, AlertTriangle, Send,
  TrendingDown, DollarSign, BarChart2, Plus, RefreshCw,
  ArrowRight, Clock, CheckCircle2, Activity, ShoppingCart,
  AlertOctagon, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { dashboardAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

function KpiCard({ icon: Icon, title, value, description, color, onClick }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <div className={`card p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm font-medium text-slate-700 mt-0.5">{title}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
    </div>
  )
}

const DISPATCH_COLORS = {
  REQUESTED: '#94a3b8', APPROVED: '#3b82f6',
  PREPARING: '#f59e0b', IN_TRANSIT: '#8b5cf6', DELIVERED: '#10b981',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardAPI.get()
      setData(res.data)
    } catch (err) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || err?.message || 'Could not connect to server'
      console.error('Dashboard load failed:', status, msg)
      setError(`${status ? `Error ${status}: ` : ''}${msg}`)
      if (status !== 401) toast.error('Dashboard: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <PageLoader />

  // Show error state
  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-slate-800">Failed to load dashboard</h3>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
        <button onClick={load} className="btn-primary">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const kv = (val, fallback = 0) => val ?? fallback
  const fmtCurrency = (val) => val ? '₱' + parseFloat(val).toLocaleString('en-PH', { maximumFractionDigits: 0 }) : '₱0'

  const dispatchChartData = data?.dispatchOverview
    ? Object.entries(data.dispatchOverview).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace('_', ' '), value, key: name }))
    : []

  const budgetChartData = (data?.budgetUtilization || []).map(b => ({
    name: (b.campaignName || '').length > 22 ? (b.campaignName || '').substring(0, 20) + '…' : (b.campaignName || ''),
    Allocated: parseFloat(b.allocated || 0) / 1000,
    Spent: parseFloat(b.spent || 0) / 1000,
    Remaining: parseFloat(b.remaining || 0) / 1000,
  }))

  const inventoryChartData = (data?.inventoryOverview || []).map(i => ({
    name: (i.productName || '').length > 16 ? (i.productName || '').substring(0, 14) + '…' : (i.productName || ''),
    Stock: i.quantity || 0,
    Capacity: i.maxCapacity || 0,
  }))

  const kpiColor = (val, threshold) => val > 0 && (!threshold || val >= threshold) ? 'red' : 'green'

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Disaster Relief Command Center</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Welcome back, <span className="font-medium text-slate-700">{user?.fullName || user?.username}</span> ·{' '}
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={load} className="btn-secondary text-xs"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
          {hasRole('ADMIN', 'LOGISTICS_OFFICER') && (
            <button onClick={() => navigate('/campaigns')} className="btn-primary text-xs">
              <Plus className="w-3.5 h-3.5" /> New Campaign
            </button>
          )}
        </div>
      </div>

      {/* SOS / Critical Alerts Banner */}
      {(data?.criticalAlerts?.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-700">{data.criticalAlerts.length} Critical Stock Alert{data.criticalAlerts.length > 1 ? 's' : ''}</h3>
            <p className="text-xs text-red-600 mt-0.5">
              {data.criticalAlerts.slice(0, 3).map(a => a.productName).join(', ')}{data.criticalAlerts.length > 3 ? ` +${data.criticalAlerts.length - 3} more` : ''} — immediate replenishment required.
            </p>
          </div>
          <button onClick={() => navigate('/inventory')} className="text-xs text-red-600 font-medium hover:text-red-700 flex items-center gap-1 whitespace-nowrap">
            View <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Megaphone} title="Active Campaigns" value={kv(data?.activeCampaigns)}
          description="Currently running" color="blue" onClick={() => navigate('/campaigns')} />
        <KpiCard icon={Warehouse} title="Relief Hubs" value={kv(data?.reliefHubs)}
          description="Operational" color="green" onClick={() => navigate('/hubs')} />
        <KpiCard icon={Package} title="Inventory Items" value={kv(data?.totalInventoryItems)}
          description="Tracked products" color="purple" onClick={() => navigate('/inventory')} />
        <KpiCard icon={AlertTriangle} title="Pending Requests" value={kv(data?.pendingRequests)}
          description="Awaiting review"
          color={kv(data?.pendingRequests) > 0 ? 'amber' : 'slate'}
          onClick={() => navigate('/requests')} />
        <KpiCard icon={Send} title="Active Dispatches" value={kv(data?.activeDispatches)}
          description="In transit / preparing" color="blue" onClick={() => navigate('/dispatches')} />
        <KpiCard icon={TrendingDown} title="Critical Stock" value={kv(data?.criticalStockItems)}
          description="Below 15% capacity"
          color={kv(data?.criticalStockItems) > 0 ? 'red' : 'green'}
          onClick={() => navigate('/inventory')} />
        <KpiCard icon={DollarSign} title="Available Funds"
          value={fmtCurrency(data?.availableFunds)}
          description="Bank balance" color="green" onClick={() => navigate('/budget')} />
        <KpiCard icon={BarChart2} title="Budget Utilization"
          value={`${(kv(data?.avgBudgetUtilization, 0)).toFixed(1)}%`}
          description="Avg across campaigns"
          color={kv(data?.avgBudgetUtilization, 0) > 85 ? 'red' : kv(data?.avgBudgetUtilization, 0) > 70 ? 'amber' : 'green'} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inventory Overview */}
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Inventory Overview</h2>
              <p className="text-xs text-slate-500">Stock vs capacity across hubs</p>
            </div>
            <button onClick={() => navigate('/inventory')} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 h-64">
            {inventoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryChartData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={(v, n) => [v.toLocaleString(), n]} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Stock" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Capacity" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No inventory data yet</div>
            )}
          </div>
        </div>

        {/* Dispatch Status Pie */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-800">Dispatch Status</h2>
            <p className="text-xs text-slate-500">Current pipeline</p>
          </div>
          <div className="p-4 h-64">
            {dispatchChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dispatchChartData} cx="50%" cy="45%" outerRadius={75} dataKey="value"
                    label={({ value }) => value}>
                    {dispatchChartData.map((entry, i) => (
                      <Cell key={i} fill={DISPATCH_COLORS[entry.key] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No dispatches yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget Utilization */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Budget Utilization</h2>
              <p className="text-xs text-slate-500">By campaign (₱ thousands)</p>
            </div>
            <button onClick={() => navigate('/budget')} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 h-56">
            {budgetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData} margin={{ top: 4, right: 4, left: -10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="K" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v) => [`₱${v.toFixed(0)}K`]} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Allocated" fill="#dbeafe" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Spent" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Remaining" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No budget data yet</div>
            )}
          </div>
        </div>

        {/* Critical Stock Alerts */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Critical Stock Alerts</h2>
              <p className="text-xs text-slate-500">Items below 15% capacity</p>
            </div>
            <button onClick={() => navigate('/inventory')} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {(data?.criticalAlerts || []).length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">All stock levels normal</p>
                <p className="text-xs text-slate-400 mt-0.5">No critical alerts at this time</p>
              </div>
            ) : (
              (data?.criticalAlerts || []).slice(0, 6).map((alert, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{alert.productName}</div>
                    <div className="text-xs text-slate-400">{alert.hubName}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-red-600">{(alert.stockPercentage || 0).toFixed(1)}%</div>
                    <div className="text-xs text-slate-400">{alert.currentStock}/{alert.maxCapacity}</div>
                  </div>
                  <div className="w-10 bg-slate-100 rounded-full h-1.5 flex-shrink-0">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(alert.stockPercentage || 0, 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
            <p className="text-xs text-slate-500">Latest inventory movements</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {(data?.recentActivities || []).length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No recent activity</div>
            ) : (
              (data?.recentActivities || []).slice(0, 10).map((act, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{act.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {act.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {hasRole('ADMIN', 'LOGISTICS_OFFICER') && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-800">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: 'New Campaign', icon: Megaphone, path: '/campaigns', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                { label: 'Add Inventory', icon: Package, path: '/inventory', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
                { label: 'Create Purchase Order', icon: ShoppingCart, path: '/purchase-orders', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
                { label: 'Review Requests', icon: AlertTriangle, path: '/requests', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
                { label: 'Create Dispatch', icon: Send, path: '/dispatches', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                { label: 'Record Fund', icon: DollarSign, path: '/budget', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
              ].map(action => (
                <button key={action.path} onClick={() => navigate(action.path)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${action.color}`}>
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
