import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit2, Warehouse, MapPin, Phone, User } from 'lucide-react'
import { hubAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function HubForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name:'', location:'', address:'', contactPerson:'', contactNumber:'',
    storageCapacity:'', latitude:'', longitude:'', status:'ACTIVE'
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = {}
    if (!form.name.trim()) e2.name = 'Hub name is required'
    if (!form.location.trim()) e2.location = 'Location is required'
    setErrors(e2)
    if (Object.keys(e2).length) return
    setSaving(true)
    try {
      await onSave({
        ...form,
        storageCapacity: form.storageCapacity ? parseInt(form.storageCapacity) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      })
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Hub Name <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Central Relief Hub" />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Location <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.location} onChange={e => f('location', e.target.value)} placeholder="City/District" />
          {errors.location && <p className="form-error">{errors.location}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Address</label>
          <input className="form-input" value={form.address} onChange={e => f('address', e.target.value)} placeholder="Full address" />
        </div>
        <div>
          <label className="form-label">Contact Person</label>
          <input className="form-input" value={form.contactPerson} onChange={e => f('contactPerson', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Contact Number</label>
          <input className="form-input" value={form.contactNumber} onChange={e => f('contactNumber', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Storage Capacity (units)</label>
          <input type="number" min="0" className="form-input" value={form.storageCapacity} onChange={e => f('storageCapacity', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => f('status', e.target.value)}>
            <option>ACTIVE</option><option>INACTIVE</option><option>MAINTENANCE</option>
          </select>
        </div>
        <div>
          <label className="form-label">Latitude</label>
          <input type="number" step="any" className="form-input" value={form.latitude} onChange={e => f('latitude', e.target.value)} placeholder="e.g. 14.5995" />
        </div>
        <div>
          <label className="form-label">Longitude</label>
          <input type="number" step="any" className="form-input" value={form.longitude} onChange={e => f('longitude', e.target.value)} placeholder="e.g. 120.9842" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Hub'}
        </button>
      </div>
    </form>
  )
}

export default function Hubs() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [hubs, setHubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })

  const load = async () => {
    setLoading(true)
    try { const res = await hubAPI.getAll(); setHubs(res.data) }
    catch { toast.error('Failed to load hubs') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = hubs.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data) => {
    if (modal.editing) { await hubAPI.update(modal.editing.id, data); toast.success('Hub updated') }
    else { await hubAPI.create(data); toast.success('Hub created') }
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Relief Hubs</h1>
          <p className="page-subtitle">{hubs.length} hubs registered</p>
        </div>
        {hasRole('ADMIN') && (
          <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary">
            <Plus className="w-4 h-4" /> New Hub
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search hubs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Warehouse} title="No relief hubs found"
          description="Add relief hubs to manage inventory storage locations."
          action={hasRole('ADMIN') && <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary"><Plus className="w-4 h-4" /> New Hub</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(hub => {
            const utilPct = hub.storageCapacity > 0 ? Math.min((hub.totalStockQuantity / hub.storageCapacity) * 100, 100) : 0
            return (
              <div key={hub.id} className="card hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => navigate(`/hubs/${hub.id}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      {hasRole('ADMIN') && (
                        <button onClick={() => setModal({ open: true, editing: hub })}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{hub.name}</h3>
                    <StatusBadge status={hub.status} />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" /> {hub.location}
                  </div>
                  {hub.contactPerson && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <User className="w-3 h-3" /> {hub.contactPerson}
                    </div>
                  )}
                  {hub.contactNumber && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                      <Phone className="w-3 h-3" /> {hub.contactNumber}
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Storage Utilization</span>
                      <span className="font-medium">{utilPct.toFixed(0)}%</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5 mb-2">
                      <div className={`h-1.5 rounded-full ${utilPct > 80 ? 'bg-red-500' : utilPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${utilPct}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">Items Tracked</span>
                        <div className="font-semibold">{hub.inventoryItemCount}</div></div>
                      <div><span className="text-slate-400">Total Stock</span>
                        <div className="font-semibold">{hub.totalStockQuantity?.toLocaleString()}</div></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Relief Hub' : 'New Relief Hub'} size="lg">
        <HubForm
          initial={modal.editing ? {
            name: modal.editing.name, location: modal.editing.location,
            address: modal.editing.address || '', contactPerson: modal.editing.contactPerson || '',
            contactNumber: modal.editing.contactNumber || '',
            storageCapacity: modal.editing.storageCapacity || '',
            latitude: modal.editing.latitude || '', longitude: modal.editing.longitude || '',
            status: modal.editing.status
          } : null}
          onSave={handleSave}
          onClose={() => setModal({ open: false, editing: null })}
        />
      </Modal>
    </div>
  )
}
