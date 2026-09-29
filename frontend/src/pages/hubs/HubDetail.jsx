import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Warehouse, MapPin, Phone, User, Package, TrendingDown } from 'lucide-react'
import { hubAPI, inventoryAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { toast } from 'react-toastify'

export default function HubDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hub, setHub] = useState(null)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([hubAPI.getById(id), inventoryAPI.getAll(id)])
      .then(([hRes, iRes]) => { setHub(hRes.data); setInventory(iRes.data) })
      .catch(() => toast.error('Failed to load hub'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!hub) return null

  const utilPct = hub.storageCapacity > 0 ? Math.min((hub.totalStockQuantity / hub.storageCapacity) * 100, 100) : 0
  const criticalItems = inventory.filter(i => i.stockStatus === 'CRITICAL')
  const lowItems = inventory.filter(i => i.stockStatus === 'LOW')

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/hubs')} className="btn-secondary py-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h1 className="page-title">{hub.name}</h1>
          <p className="page-subtitle">{hub.hubCode} · <StatusBadge status={hub.status} /></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Hub Information</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-slate-400 block">Location</span>
              <span className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{hub.location}</span></div>
            <div><span className="text-xs text-slate-400 block">Status</span><StatusBadge status={hub.status} /></div>
            <div><span className="text-xs text-slate-400 block">Contact Person</span>
              <span className="font-medium flex items-center gap-1"><User className="w-3 h-3 text-slate-400" />{hub.contactPerson || 'N/A'}</span></div>
            <div><span className="text-xs text-slate-400 block">Contact Number</span>
              <span className="font-medium flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{hub.contactNumber || 'N/A'}</span></div>
            <div className="col-span-2"><span className="text-xs text-slate-400 block">Address</span>
              <span className="font-medium">{hub.address || 'N/A'}</span></div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Storage Capacity</h2>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Utilization</span>
              <span className="font-semibold">{utilPct.toFixed(1)}%</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${utilPct > 80 ? 'bg-red-500' : utilPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${utilPct}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-slate-400 block">Max Capacity</span>
              <span className="font-bold text-slate-800">{hub.storageCapacity?.toLocaleString() || 'N/A'}</span></div>
            <div><span className="text-xs text-slate-400 block">Total Stock</span>
              <span className="font-bold text-slate-800">{hub.totalStockQuantity?.toLocaleString()}</span></div>
            <div><span className="text-xs text-slate-400 block">Product Types</span>
              <span className="font-bold text-slate-800">{hub.inventoryItemCount}</span></div>
          </div>
          {criticalItems.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700">{criticalItems.length} Critical Stock Alert(s)</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-800">Inventory at this Hub ({inventory.length} items)</h2>
        </div>
        <div className="table-container rounded-none border-0">
          <table className="table">
            <thead><tr>
              <th>Product</th><th>Category</th><th>On Hand</th><th>Min Stock</th><th>Max Cap</th><th>Stock %</th><th>Status</th>
            </tr></thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No inventory records for this hub</td></tr>
              ) : inventory.map(item => (
                <tr key={item.id}>
                  <td className="font-medium text-slate-900">{item.productName}</td>
                  <td><span className="badge badge-slate">{item.productCategory}</span></td>
                  <td className="font-semibold">{item.quantityOnHand?.toLocaleString()} {item.unit}</td>
                  <td className="text-slate-500">{item.minimumStockLevel || 'N/A'}</td>
                  <td className="text-slate-500">{item.maximumStockCapacity || 'N/A'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${item.stockStatus === 'CRITICAL' ? 'bg-red-500' : item.stockStatus === 'LOW' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(item.stockPercentage, 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium">{item.stockPercentage?.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td><StatusBadge status={item.stockStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
