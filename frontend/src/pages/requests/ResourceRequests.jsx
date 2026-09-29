import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, AlertOctagon, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { requestAPI, campAPI, campaignAPI, productAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/Modal'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function RequestForm({ camps, campaigns, products, onSave, onClose, isSos = false }) {
  const [form, setForm] = useState({
    campId: '', campaignId: '', reason: '', priority: isSos ? 'CRITICAL' : 'MEDIUM',
    isSos, emergencyType: '', sosLocation: ''
  })
  const [items, setItems] = useState([{ productId: '', requestedQuantity: '' }])
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const addItem = () => setItems(p => [...p, { productId: '', requestedQuantity: '' }])
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i, k, v) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.campId) { toast.error('Camp is required'); return }
    if (items.some(i => !i.productId || !i.requestedQuantity)) { toast.error('Complete all item fields'); return }
    setSaving(true)
    try {
      await onSave({
        ...form,
        campId: parseInt(form.campId),
        campaignId: form.campaignId ? parseInt(form.campaignId) : null,
        items: items.map(i => ({ productId: parseInt(i.productId), requestedQuantity: parseInt(i.requestedQuantity) }))
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSos && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
            <AlertOctagon className="w-5 h-5" /> SOS Emergency Resource Request
          </div>
          <p className="text-xs text-red-600 mt-1">This will create a CRITICAL priority request and alert all administrators immediately.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Camp <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.campId} onChange={e => f('campId', e.target.value)}>
            <option value="">Select camp...</option>
            {camps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
          <select className="form-select" value={form.priority} onChange={e => f('priority', e.target.value)}
            disabled={isSos}>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        {isSos && (
          <>
            <div>
              <label className="form-label">Emergency Type</label>
              <input className="form-input" value={form.emergencyType} onChange={e => f('emergencyType', e.target.value)}
                placeholder="e.g. Medical Emergency" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">SOS Location</label>
              <input className="form-input" value={form.sosLocation} onChange={e => f('sosLocation', e.target.value)}
                placeholder="Exact location description..." />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label className="form-label">Reason / Description</label>
          <textarea rows={3} className="form-textarea" value={form.reason} onChange={e => f('reason', e.target.value)}
            placeholder="Describe the need for these resources..." />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Requested Items <span className="text-red-500">*</span></label>
          <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Item</button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-10 gap-2 items-center bg-slate-50 p-3 rounded-lg">
              <div className="col-span-7">
                <select className="form-select text-sm" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <input type="number" min="1" className="form-input text-sm" placeholder="Qty" value={item.requestedQuantity}
                  onChange={e => updateItem(i, 'requestedQuantity', e.target.value)} />
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

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className={isSos ? 'btn-danger' : 'btn-primary'}>
          {saving ? 'Submitting...' : isSos ? '🚨 Submit SOS Request' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}

export default function ResourceRequests() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [requests, setRequests] = useState([])
  const [camps, setCamps] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState({ open: false, sos: false })
  const [confirm, setConfirm] = useState({ open: false, action: null, id: null })

  const load = async () => {
    setLoading(true)
    try {
      const [rRes, cRes, camRes, pRes] = await Promise.all([
        requestAPI.getAll(), campAPI.getAll(), campaignAPI.getAll(), productAPI.getActive()
      ])
      setRequests(rRes.data); setCamps(cRes.data); setCampaigns(camRes.data); setProducts(pRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = requests.filter(r => {
    const ms = r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.campName.toLowerCase().includes(search.toLowerCase())
    const mst = !statusFilter || r.status === statusFilter
    return ms && mst
  })

  const sosRequests = requests.filter(r => r.sos && r.status === 'PENDING')

  const handleApprove = async () => {
    try {
      await requestAPI.approve(confirm.id)
      toast.success('Request approved')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Requests</h1>
          <p className="page-subtitle">{requests.length} total requests</p>
        </div>
        <div className="flex gap-2">
          {hasRole('CAMP_REPRESENTATIVE','ADMIN','LOGISTICS_OFFICER') && (
            <button onClick={() => setModal({ open: true, sos: false })} className="btn-primary">
              <Plus className="w-4 h-4" /> New Request
            </button>
          )}
          {hasRole('CAMP_REPRESENTATIVE','ADMIN') && (
            <button onClick={() => setModal({ open: true, sos: true })} className="btn-danger">
              <AlertOctagon className="w-4 h-4" /> SOS Request
            </button>
          )}
        </div>
      </div>

      {/* Critical SOS Alerts */}
      {sosRequests.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-red-700">{sosRequests.length} Critical SOS Request(s) Pending</h3>
          </div>
          {sosRequests.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-white rounded-lg p-3 mb-2 border border-red-200">
              <div>
                <div className="text-sm font-semibold text-red-700">{r.campName} — {r.emergencyType || 'Emergency'}</div>
                <div className="text-xs text-slate-500">{r.requestNumber} · {r.reason?.substring(0, 80)}{r.reason?.length > 80 ? '...' : ''}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/requests/${r.id}`)} className="btn-secondary text-xs py-1">View</button>
                {hasRole('ADMIN','LOGISTICS_OFFICER') && (
                  <button onClick={() => setConfirm({ open: true, action: 'approve', id: r.id })} className="btn-primary text-xs py-1">
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['PENDING','APPROVED','REJECTED','ALLOCATED','DISPATCHED','DELIVERED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No resource requests" description="Camp representatives can submit resource requests for relief supplies." />
      ) : (
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr><th>Request #</th><th>Camp</th><th>Campaign</th><th>Priority</th><th>SOS</th><th>Items</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={r.sos ? 'bg-red-50/50' : ''}>
                  <td className="font-mono text-xs font-semibold text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/requests/${r.id}`)}>
                    {r.requestNumber}
                  </td>
                  <td className="text-slate-700 font-medium">{r.campName}</td>
                  <td className="text-slate-500 text-sm">{r.campaignName || '—'}</td>
                  <td><StatusBadge status={r.priority} /></td>
                  <td>{r.sos ? <span className="badge-red badge">SOS</span> : <span className="text-slate-400 text-xs">—</span>}</td>
                  <td className="text-slate-500 text-sm">{r.items?.length}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-slate-500 text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={() => navigate(`/requests/${r.id}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      {r.status === 'PENDING' && hasRole('ADMIN','LOGISTICS_OFFICER') && (
                        <button onClick={() => setConfirm({ open: true, action: 'approve', id: r.id })}
                          className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, sos: false })}
        title={modal.sos ? '🚨 SOS Emergency Request' : 'New Resource Request'} size="xl">
        <RequestForm camps={camps} campaigns={campaigns} products={products} isSos={modal.sos}
          onSave={async (data) => { await requestAPI.create(data); toast.success('Request submitted'); load() }}
          onClose={() => setModal({ open: false, sos: false })} />
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={handleApprove} title="Approve Resource Request"
        message="Approve this resource request? The camp will be notified and you can proceed to create a dispatch."
        confirmLabel="Approve" />
    </div>
  )
}
