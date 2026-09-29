import React, { useState, useEffect } from 'react'
import { BarChart2, Download, RefreshCw, TrendingUp, Package, Send, DollarSign, Scale } from 'lucide-react'
import { reportAPI, hubAPI, campaignAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { toast } from 'react-toastify'

const TABS = [
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'purchase', label: 'Purchase Orders', icon: DollarSign },
  { id: 'dispatch', label: 'Dispatches', icon: Send },
  { id: 'budget', label: 'Budget', icon: TrendingUp },
  { id: 'balance-sheet', label: 'Balance Sheet', icon: Scale },
  { id: 'profit-loss', label: 'P&L', icon: BarChart2 },
]

export default function Reports() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [data, setData] = useState(null)
  const [hubs, setHubs] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ hubId: '', campaignId: '' })

  useEffect(() => {
    Promise.all([hubAPI.getAll(), campaignAPI.getAll()])
      .then(([hRes, cRes]) => { setHubs(hRes.data); setCampaigns(cRes.data) })
  }, [])

  const loadReport = async () => {
    setLoading(true)
    setData(null)
    try {
      let res
      if (activeTab === 'inventory') res = await reportAPI.inventory(filters.hubId || undefined)
      else if (activeTab === 'purchase') res = await reportAPI.purchaseOrders()
      else if (activeTab === 'dispatch') res = await reportAPI.dispatches(filters.campaignId || undefined)
      else if (activeTab === 'budget') res = await reportAPI.budget()
      else if (activeTab === 'balance-sheet') res = await reportAPI.balanceSheet()
      else if (activeTab === 'profit-loss') res = await reportAPI.profitLoss()
      setData(res.data)
    } catch { toast.error('Failed to load report') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadReport() }, [activeTab])

  const exportCSV = () => {
    if (!Array.isArray(data) || data.length === 0) { toast.info('No data to export'); return }
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-report-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Operational reports for disaster relief management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadReport} className="btn-secondary text-xs"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
          {Array.isArray(data) && data.length > 0 && (
            <button onClick={exportCSV} className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" /> Export CSV</button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {(activeTab === 'inventory' || activeTab === 'dispatch') && (
        <div className="card p-4 flex gap-3 flex-wrap">
          {activeTab === 'inventory' && (
            <select className="form-select w-auto" value={filters.hubId} onChange={e => setFilters(p => ({ ...p, hubId: e.target.value }))}>
              <option value="">All Hubs</option>
              {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          )}
          {activeTab === 'dispatch' && (
            <select className="form-select w-auto" value={filters.campaignId} onChange={e => setFilters(p => ({ ...p, campaignId: e.target.value }))}>
              <option value="">All Campaigns</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button onClick={loadReport} className="btn-primary text-xs">Apply Filter</button>
        </div>
      )}

      {loading && <PageLoader />}

      {/* Inventory Report */}
      {!loading && activeTab === 'inventory' && Array.isArray(data) && (
        <div className="space-y-4">
          {data.length > 0 && (
            <div className="card p-4 h-64">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Stock Levels</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data.slice(0,10)} margin={{ top: 4, right: 4, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="product" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="quantity" fill="#3b82f6" radius={[3,3,0,0]} name="On Hand" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="card table-container">
            <table className="table">
              <thead><tr><th>Product</th><th>Category</th><th>Hub</th><th>Qty On Hand</th><th>Max Capacity</th><th>Stock %</th><th>Status</th></tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-900">{row.product}</td>
                    <td><span className="badge badge-slate text-xs">{row.category}</span></td>
                    <td className="text-slate-500">{row.hub}</td>
                    <td className="font-semibold">{parseInt(row.quantity||0).toLocaleString()}</td>
                    <td className="text-slate-500">{parseInt(row.maxCapacity||0).toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${row.status === 'CRITICAL' ? 'bg-red-500' : row.status === 'LOW' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(parseFloat(row.stockPercentage)||0, 100)}%` }} />
                        </div>
                        <span className="text-xs">{row.stockPercentage}%</span>
                      </div>
                    </td>
                    <td><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Report */}
      {!loading && activeTab === 'purchase' && Array.isArray(data) && (
        <div className="card table-container">
          <table className="table">
            <thead><tr><th>PO Number</th><th>Supplier</th><th>Hub</th><th>Order Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{row.poNumber}</td>
                  <td className="text-slate-700">{row.supplier}</td>
                  <td className="text-slate-500">{row.hub}</td>
                  <td className="text-slate-500 text-xs">{row.orderDate}</td>
                  <td className="font-bold text-slate-800">₱{parseFloat(row.totalAmount||0).toLocaleString()}</td>
                  <td><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dispatch Report */}
      {!loading && activeTab === 'dispatch' && Array.isArray(data) && (
        <div className="card table-container">
          <table className="table">
            <thead><tr><th>Dispatch #</th><th>Campaign</th><th>Source Hub</th><th>Camp</th><th>Date</th><th>Status</th><th>Priority</th></tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs font-semibold text-blue-600">{row.dispatchNumber}</td>
                  <td className="text-slate-500">{row.campaign}</td>
                  <td className="text-slate-600">{row.sourceHub}</td>
                  <td className="font-medium text-slate-800">{row.destinationCamp}</td>
                  <td className="text-slate-500 text-xs">{row.dispatchDate}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td><StatusBadge status={row.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Budget Report */}
      {!loading && activeTab === 'budget' && Array.isArray(data) && (
        <div className="space-y-4">
          <div className="card table-container">
            <table className="table">
              <thead><tr><th>Campaign</th><th>Allocated</th><th>Spent</th><th>Remaining</th><th>Utilization</th><th>Status</th></tr></thead>
              <tbody>
                {data.map((row, i) => {
                  const util = parseFloat(row.utilizationPercentage) || 0
                  return (
                    <tr key={i}>
                      <td className="font-medium text-slate-900">{row.campaign}</td>
                      <td className="font-semibold">₱{parseFloat(row.allocatedAmount||0).toLocaleString()}</td>
                      <td className="text-amber-600 font-semibold">₱{parseFloat(row.actualExpenditure||0).toLocaleString()}</td>
                      <td className="text-emerald-600 font-semibold">₱{parseFloat(row.remainingAmount||0).toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${util>85 ? 'bg-red-500' : util>70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(util,100)}%` }} />
                          </div>
                          <span className="text-xs font-medium">{row.utilizationPercentage}%</span>
                        </div>
                      </td>
                      <td><StatusBadge status={row.status === 'HIGH' ? 'CRITICAL' : row.status === 'WARNING' ? 'HIGH' : 'ACTIVE'} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Balance Sheet */}
      {!loading && activeTab === 'balance-sheet' && data && !Array.isArray(data) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Assets</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Bank / Cash</span><span className="font-bold text-green-600">₱{parseFloat(data.assets?.bank||0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Relief Inventory</span><span className="font-bold text-green-600">₱{parseFloat(data.assets?.inventory||0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm font-bold border-t pt-2"><span>Total Assets</span><span className="text-blue-600">₱{parseFloat(data.assets?.total||0).toLocaleString()}</span></div>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Liabilities & Equity</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Supplier Creditors</span><span className="font-bold text-red-600">₱{parseFloat(data.liabilities?.supplierCreditors||0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm font-bold border-t pt-2"><span>Total Liabilities</span><span className="text-red-600">₱{parseFloat(data.liabilities?.total||0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm font-bold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2"><span>Net Equity</span><span>₱{parseFloat(data.equity||0).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* P&L */}
      {!loading && activeTab === 'profit-loss' && data && !Array.isArray(data) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Income</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Relief Grants</span><span className="font-bold text-green-600">₱{parseFloat(data.income?.reliefGrants||0).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Total Income</span><span className="text-green-600">₱{parseFloat(data.income?.total||0).toLocaleString()}</span></div>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Expenses</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Procurement</span><span className="font-bold text-red-600">₱{parseFloat(data.expenses?.procurement||0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Dispatch & Freight</span><span className="font-bold text-red-600">₱{parseFloat(data.expenses?.dispatchFreight||0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Other</span><span className="font-bold text-red-600">₱{parseFloat(data.expenses?.other||0).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Total Expenses</span><span className="text-red-600">₱{parseFloat(data.expenses?.total||0).toLocaleString()}</span></div>
            </div>
          </div>
          <div className="lg:col-span-2 card p-5">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">Net Surplus / (Deficit)</span>
              <span className={`text-2xl font-bold ${parseFloat(data.netSurplus||0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ₱{parseFloat(data.netSurplus||0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
