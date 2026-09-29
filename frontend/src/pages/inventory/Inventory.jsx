import React, { useState, useEffect } from 'react'
import { Package, Search, Filter, AlertTriangle, TrendingDown, Plus, ArrowUpDown } from 'lucide-react'
import { inventoryAPI, hubAPI, productAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function AdjustStockModal({ hubs, products, onSave, onClose }) {
  const [form, setForm] = useState({
    hubId: '', productId: '', quantity: '', transactionType: 'INITIAL_STOCK', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.hubId || !form.productId || !form.quantity) {
      toast.error('Hub, product and quantity are required')
      return
    }
    setSaving(true)
    try {
      await onSave({
        hubId: parseInt(form.hubId),
        productId: parseInt(form.productId),
        quantity: parseInt(form.quantity),
        transactionType: form.transactionType,
        notes: form.notes
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Adjustment failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
        Every stock adjustment is recorded in the inventory ledger.
      </div>
      <div>
        <label className="form-label">Relief Hub <span className="text-red-500">*</span></label>
        <select className="form-select" value={form.hubId} onChange={e => f('hubId', e.target.value)}>
          <option value="">Select hub...</option>
          {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">Product <span className="text-red-500">*</span></label>
        <select className="form-select" value={form.productId} onChange={e => f('productId', e.target.value)}>
          <option value="">Select product...</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Transaction Type <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.transactionType} onChange={e => f('transactionType', e.target.value)}>
            <option value="INITIAL_STOCK">Initial Stock</option>
            <option value="PURCHASE_RECEIPT">Purchase Receipt</option>
            <option value="RETURN">Return</option>
            <option value="ADJUSTMENT">Adjustment (±)</option>
          </select>
        </div>
        <div>
          <label className="form-label">Quantity <span className="text-red-500">*</span></label>
          <input type="number" className="form-input" value={form.quantity} onChange={e => f('quantity', e.target.value)}
            placeholder={form.transactionType === 'ADJUSTMENT' ? '±100' : '500'} />
        </div>
      </div>
      <div>
        <label className="form-label">Notes</label>
        <textarea rows={2} className="form-textarea" value={form.notes} onChange={e => f('notes', e.target.value)}
          placeholder="Reason for adjustment..." />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Apply Adjustment'}
        </button>
      </div>
    </form>
  )
}

export default function Inventory() {
  const { hasRole } = useAuth()
  const [inventory, setInventory] = useState([])
  const [hubs, setHubs] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [hubFilter, setHubFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [adjustModal, setAdjustModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [invRes, hubsRes, prodsRes] = await Promise.all([
        inventoryAPI.getAll(),
        hubAPI.getAll(),
        productAPI.getActive()
      ])
      setInventory(invRes.data)
      setHubs(hubsRes.data)
      setProducts(prodsRes.data)
    } catch { toast.error('Failed to load inventory') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = inventory.filter(item => {
    const ms = item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.hubName.toLowerCase().includes(search.toLowerCase())
    const mh = !hubFilter || String(item.hubId) === hubFilter
    const mstock = !stockFilter || item.stockStatus === stockFilter
    return ms && mh && mstock
  })

  const criticalCount = inventory.filter(i => i.stockStatus === 'CRITICAL').length
  const lowCount = inventory.filter(i => i.stockStatus === 'LOW').length

  const handleAdjust = async (data) => {
    await inventoryAPI.adjust(data)
    toast.success('Stock adjusted successfully')
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">{inventory.length} product-hub combinations tracked</p>
        </div>
        {hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setAdjustModal(true)} className="btn-primary">
            <ArrowUpDown className="w-4 h-4" /> Adjust Stock
          </button>
        )}
      </div>

      {/* Summary Alerts */}
      {(criticalCount > 0 || lowCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {criticalCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer"
              onClick={() => setStockFilter('CRITICAL')}>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-red-700">{criticalCount} Critical Stock Items</div>
                <div className="text-xs text-red-500">Below 15% capacity — immediate action needed</div>
              </div>
            </div>
          )}
          {lowCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer"
              onClick={() => setStockFilter('LOW')}>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-700">{lowCount} Low Stock Items</div>
                <div className="text-xs text-amber-500">Between 15–30% capacity</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search product or hub..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select w-auto" value={hubFilter} onChange={e => setHubFilter(e.target.value)}>
          <option value="">All Hubs</option>
          {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select className="form-select w-auto" value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
          <option value="">All Stock Levels</option>
          <option value="CRITICAL">Critical (&lt;15%)</option>
          <option value="LOW">Low (15–30%)</option>
          <option value="NORMAL">Normal (&gt;30%)</option>
        </select>
        {stockFilter && (
          <button onClick={() => setStockFilter('')} className="btn-secondary text-xs">Clear Filter</button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No inventory items found"
          description="Adjust stock to start tracking inventory."
          action={hasRole('ADMIN','LOGISTICS_OFFICER') && (
            <button onClick={() => setAdjustModal(true)} className="btn-primary"><ArrowUpDown className="w-4 h-4" /> Adjust Stock</button>
          )} />
      ) : (
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Hub</th><th>On Hand</th>
                <th>Min Stock</th><th>Max Cap</th><th>Stock Level</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="font-medium text-slate-900">{item.productName}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.productCode}</div>
                  </td>
                  <td><span className="badge badge-slate text-xs">{item.productCategory}</span></td>
                  <td className="text-slate-600 text-sm">{item.hubName}</td>
                  <td>
                    <span className={`font-bold text-sm ${item.stockStatus === 'CRITICAL' ? 'text-red-600' : item.stockStatus === 'LOW' ? 'text-amber-600' : 'text-slate-900'}`}>
                      {item.quantityOnHand?.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                  </td>
                  <td className="text-slate-500 text-sm">{item.minimumStockLevel ?? '—'}</td>
                  <td className="text-slate-500 text-sm">{item.maximumStockCapacity ?? '—'}</td>
                  <td className="min-w-32">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 flex-shrink-0">
                        <div
                          className={`h-1.5 rounded-full ${item.stockStatus === 'CRITICAL' ? 'bg-red-500' : item.stockStatus === 'LOW' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(item.stockPercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{item.stockPercentage?.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td><StatusBadge status={item.stockStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={adjustModal} onClose={() => setAdjustModal(false)} title="Adjust Stock" size="md">
        <AdjustStockModal hubs={hubs} products={products} onSave={handleAdjust} onClose={() => setAdjustModal(false)} />
      </Modal>
    </div>
  )
}
