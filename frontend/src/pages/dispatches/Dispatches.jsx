import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Send, Truck } from 'lucide-react'
import { dispatchAPI, hubAPI, campAPI, campaignAPI, productAPI, inventoryAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/Modal'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function DispatchForm({ hubs, camps, campaigns, products, onSave, onClose }) {
  const [form, setForm] = useState({
    campaignId: '', sourceHubId: '', destinationCampId: '', vehicle: '', driverContact: '',
    dispatchDate: '', expectedDeliveryDate: '', priority: 'MEDIUM', notes: ''
  })
  const [items, setItems] = useState([{ productId: '', quantity: '' }])
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addItem = () => setItems(p => [...p, { productId: '', quantity: '' }])
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i, k, v) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.sourceHubId || !form.destinationCampId) { toast.error('Hub and camp are required'); return }
    if (items.some(i => !i.productId || !i.quantity)) { toast.error('Complete all item fields'); return }
    setSaving(true)
    try {
      await onSave({
        ...form,
        campaignId: form.campaignId ? parseInt(form.campaignId) : null,
        sourceHubId: parseInt(form.sourceHubId),
        destinationCampId: parseInt(form.destinationCampId),
        items: items.map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) }))
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Source Hub <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.sourceHubId} onChange={e => f('sourceHubId', e.target.value)}>
            <option value="">Select hub...</option>
            {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Destination Camp <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.destinationCampId} onChange={e => f('destinationCampId', e.target.value)}>
            <option value="">Select camp...</option>
            {camps.map(c => <option key={c.id} value={c.id}>{c.name} ({c.priority})</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Campaign</label>
          <select className="form-select" value={form.campaignId} onChange={e => f('campaignId', e.target.value)}>
            <option value="">None</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e => f('priority', e.target.value)}>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Vehicle / Transport</label>
          <input className="form-input" value={form.vehicle} onChange={e => f('vehicle', e.target.value)} placeholder="e.g. Truck GT-2024A" />
        </div>
        <div>
          <label className="form-label">Driver Contact</label>
          <input className="form-input" value={form.driverContact} onChange={e => f('driverContact', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Dispatch Date</label>
          <input type="date" className="form-input" value={form.dispatchDate} onChange={e => f('dispatchDate', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Expected Delivery</label>
          <input type="date" className="form-input" value={form.expectedDeliveryDate} onChange={e => f('expectedDeliveryDate', e.target.value)} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Dispatch Items <span className="text-red-500">*</span></label>
          <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Item</button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-10 gap-2 items-center bg-slate-50 p-3 rounded-lg">
              <div className="col-span-7">
                <select className="form-select text-sm" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <input type="number" min="1" className="form-input text-sm" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
              </div>
              <div className="col-span-1 text-right">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Notes</label>
        <textarea rows={2} className="form-textarea" value={form.notes} onChange={e => f('notes', e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Creating...' : 'Create Dispatch'}
        </button>
      </div>
    </form>
  )
}

export default function Dispatches() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [dispatches, setDispatches] = useState([])
  const [hubs, setHubs] = useState([])
  const [camps, setCamps] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, action: null, id: null, label: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [dRes, hRes, cRes, camRes, pRes] = await Promise.all([
        dispatchAPI.getAll(), hubAPI.getAll(), campAPI.getAll(),
        campaignAPI.getAll(), productAPI.getActive()
      ])
      setDispatches(dRes.data); setHubs(hRes.data); setCamps(cRes.data)
      setCampaigns(camRes.data); setProducts(pRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = dispatches.filter(d => {
    const ms = d.dispatchNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.destinationCampName.toLowerCase().includes(search.toLowerCase())
    const mst = !statusFilter || d.status === statusFilter
    return ms && mst
  })

  const handleAction = async () => {
    try {
      if (confirm.action === 'approve') await dispatchAPI.approve(confirm.id)
      else if (confirm.action === 'transit') await dispatchAPI.transit(confirm.id)
      else if (confirm.action === 'deliver') await dispatchAPI.deliver(confirm.id)
      toast.success('Dispatch updated')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed') }
  }

  const dispatchActions = {
    REQUESTED: { label: 'Approve', action: 'approve' },
    APPROVED: { label: 'Mark In Transit (Deduct Stock)', action: 'transit' },
    IN_TRANSIT: { label: 'Confirm Delivered', action: 'deliver' },
  }

  if (loading) return <PageLoader />

  const statusCounts = {
    IN_TRANSIT: dispatches.filter(d => d.status === 'IN_TRANSIT').length,
    APPROVED: dispatches.filter(d => d.status === 'APPROVED').length,
    REQUESTED: dispatches.filter(d => d.status === 'REQUESTED').length,
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispatch Management</h1>
          <p className="page-subtitle">{dispatches.length} total dispatches</p>
        </div>
        {hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Dispatch
          </button>
        )}
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'In Transit', count: statusCounts.IN_TRANSIT, color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Awaiting Dispatch', count: statusCounts.APPROVED, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Pending Approval', count: statusCounts.REQUESTED, color: 'bg-amber-50 text-amber-700 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-xs font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search dispatch number or camp..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['REQUESTED','APPROVED','PREPARING','IN_TRANSIT','DELIVERED','CANCELLED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Send} title="No dispatches found" description="Create dispatches to send relief supplies to camps." />
      ) : (
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr><th>Dispatch #</th><th>From Hub</th><th>To Camp</th><th>Items</th><th>Priority</th><th>Dispatch Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const action = dispatchActions[d.status]
                return (
                  <tr key={d.id}>
                    <td className="font-mono text-xs font-semibold text-blue-600 cursor-pointer hover:underline"
                      onClick={() => navigate(`/dispatches/${d.id}`)}>
                      {d.dispatchNumber}
                    </td>
                    <td className="text-slate-600 text-sm">{d.sourceHubName}</td>
                    <td className="text-slate-700 font-medium">{d.destinationCampName}</td>
                    <td className="text-slate-500 text-sm">{d.items?.length} item(s)</td>
                    <td><StatusBadge status={d.priority} /></td>
                    <td className="text-slate-500 text-xs">{d.dispatchDate || '—'}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => navigate(`/dispatches/${d.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                        {action && hasRole('ADMIN','LOGISTICS_OFFICER') && (
                          <button
                            onClick={() => setConfirm({ open: true, action: action.action, id: d.id, label: action.label })}
                            className={`text-xs px-2 py-1 rounded-lg font-medium ${action.action === 'deliver' ? 'bg-green-100 text-green-700 hover:bg-green-200' : action.action === 'transit' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Dispatch" size="xl">
        <DispatchForm hubs={hubs} camps={camps} campaigns={campaigns} products={products}
          onSave={async (data) => { await dispatchAPI.create(data); toast.success('Dispatch created'); load() }}
          onClose={() => setModal(false)} />
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={handleAction} title={confirm.label}
        message={confirm.action === 'transit'
          ? 'Marking as In Transit will deduct the dispatched quantities from inventory. Confirm?'
          : `Are you sure you want to ${confirm.label?.toLowerCase()}?`}
        confirmLabel={confirm.label} />
    </div>
  )
}
