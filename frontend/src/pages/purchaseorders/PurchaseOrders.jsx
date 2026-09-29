import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, CheckCircle, Package, ShoppingCart } from 'lucide-react'
import { poAPI, supplierAPI, hubAPI, campaignAPI, productAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/Modal'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function POForm({ suppliers, hubs, campaigns, products, onSave, onClose }) {
  const [form, setForm] = useState({
    supplierId: '', hubId: '', campaignId: '', orderDate: '', expectedDeliveryDate: '', notes: ''
  })
  const [items, setItems] = useState([{ productId: '', quantity: '', unitPrice: '' }])
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addItem = () => setItems(p => [...p, { productId: '', quantity: '', unitPrice: '' }])
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i, k, v) => setItems(p => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const total = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unitPrice) || 0
    return sum + qty * price
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.supplierId || !form.hubId) { toast.error('Supplier and hub are required'); return }
    if (items.some(i => !i.productId || !i.quantity || !i.unitPrice)) { toast.error('All item fields are required'); return }
    setSaving(true)
    try {
      await onSave({
        ...form,
        supplierId: parseInt(form.supplierId),
        hubId: parseInt(form.hubId),
        campaignId: form.campaignId ? parseInt(form.campaignId) : null,
        items: items.map(i => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity),
          unitPrice: parseFloat(i.unitPrice)
        }))
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create PO') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Supplier <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.supplierId} onChange={e => f('supplierId', e.target.value)}>
            <option value="">Select supplier...</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Delivery Hub <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.hubId} onChange={e => f('hubId', e.target.value)}>
            <option value="">Select hub...</option>
            {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Campaign (Optional)</label>
          <select className="form-select" value={form.campaignId} onChange={e => f('campaignId', e.target.value)}>
            <option value="">None</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Order Date</label>
          <input type="date" className="form-input" value={form.orderDate} onChange={e => f('orderDate', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Expected Delivery</label>
          <input type="date" className="form-input" value={form.expectedDeliveryDate} onChange={e => f('expectedDeliveryDate', e.target.value)} />
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Order Items <span className="text-red-500">*</span></label>
          <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Item</button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-lg">
              <div className="col-span-5">
                <select className="form-select text-xs" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                  <option value="">Product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <input type="number" min="1" className="form-input text-xs" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
              </div>
              <div className="col-span-3">
                <input type="number" min="0" step="0.01" className="form-input text-xs" placeholder="Unit Price" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
              </div>
              <div className="col-span-1 text-xs text-right font-medium text-slate-600">
                ₱{((parseFloat(item.quantity)||0)*(parseFloat(item.unitPrice)||0)).toLocaleString(undefined,{maximumFractionDigits:0})}
              </div>
              <div className="col-span-1 text-right">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                )}
              </div>
            </div>
          ))}
          <div className="text-right text-sm font-bold text-slate-800 pr-2">
            Total: ₱{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div>
        <label className="form-label">Notes</label>
        <textarea rows={2} className="form-textarea" value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Additional notes..." />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Creating...' : 'Create Purchase Order'}
        </button>
      </div>
    </form>
  )
}

export default function PurchaseOrders() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [hubs, setHubs] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, action: null, label: '', id: null })

  const load = async () => {
    setLoading(true)
    try {
      const [poRes, supRes, hubRes, camRes, prodRes] = await Promise.all([
        poAPI.getAll(), supplierAPI.getAll(), hubAPI.getAll(),
        campaignAPI.getAll(), productAPI.getActive()
      ])
      setOrders(poRes.data); setSuppliers(supRes.data); setHubs(hubRes.data)
      setCampaigns(camRes.data); setProducts(prodRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = orders.filter(o => {
    const ms = o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase())
    const mst = !statusFilter || o.status === statusFilter
    return ms && mst
  })

  const handleAction = async () => {
    try {
      if (confirm.action === 'submit') await poAPI.submit(confirm.id)
      else if (confirm.action === 'approve') await poAPI.approve(confirm.id)
      else if (confirm.action === 'receive') await poAPI.receive(confirm.id)
      toast.success(`PO ${confirm.action}d successfully`)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed') }
  }

  if (loading) return <PageLoader />

  const statusActions = {
    DRAFT: { label: 'Submit for Approval', action: 'submit', cls: 'btn-secondary' },
    PENDING_APPROVAL: { label: 'Approve', action: 'approve', cls: 'btn-success' },
    APPROVED: { label: 'Mark Received', action: 'receive', cls: 'btn-primary' },
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">{orders.length} orders total</p>
        </div>
        {hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New PO
          </button>
        )}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search PO number or supplier..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['DRAFT','PENDING_APPROVAL','APPROVED','RECEIVED','CLOSED','CANCELLED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No purchase orders" description="Create purchase orders to procure relief supplies." />
      ) : (
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr><th>PO Number</th><th>Supplier</th><th>Hub</th><th>Order Date</th><th>Expected</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(po => {
                const action = statusActions[po.status]
                return (
                  <tr key={po.id}>
                    <td className="font-mono text-xs font-semibold text-blue-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/purchase-orders/${po.id}`)}>
                      {po.poNumber}
                    </td>
                    <td className="text-slate-700">{po.supplierName}</td>
                    <td className="text-slate-500 text-sm">{po.hubName}</td>
                    <td className="text-slate-500 text-xs">{po.orderDate || '—'}</td>
                    <td className="text-slate-500 text-xs">{po.expectedDeliveryDate || '—'}</td>
                    <td className="font-semibold text-slate-800">₱{parseFloat(po.totalAmount||0).toLocaleString()}</td>
                    <td><StatusBadge status={po.status} /></td>
                    <td>
                      <div className="flex gap-1.5 items-center">
                        <button onClick={() => navigate(`/purchase-orders/${po.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        {action && hasRole('ADMIN','LOGISTICS_OFFICER') && (
                          <button
                            onClick={() => setConfirm({ open: true, action: action.action, label: action.label, id: po.id })}
                            className={`text-xs px-2 py-1 rounded-lg font-medium ${action.action === 'approve' ? 'bg-green-100 text-green-700 hover:bg-green-200' : action.action === 'receive' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {action.label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Purchase Order" size="xl">
        <POForm suppliers={suppliers} hubs={hubs} campaigns={campaigns} products={products}
          onSave={async (data) => { await poAPI.create(data); toast.success('PO created'); load() }}
          onClose={() => setModal(false)} />
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={handleAction} title={confirm.label}
        message={`Are you sure you want to ${confirm.label?.toLowerCase()} this purchase order?`}
        confirmLabel={confirm.label} />
    </div>
  )
}
