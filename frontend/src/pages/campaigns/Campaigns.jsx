import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Edit2, MapPin, Calendar, Users, DollarSign, Megaphone } from 'lucide-react'
import { campaignAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

const DISASTER_TYPES = ['FLOOD','CYCLONE','LANDSLIDE','EARTHQUAKE','STORM','OTHER']
const STATUSES = ['PLANNED','ACTIVE','COMPLETED','CLOSED']

function CampaignForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name:'', disasterType:'FLOOD', location:'', description:'',
    startDate:'', endDate:'', affectedPopulation:'', allocatedBudget:'', status:'PLANNED'
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Campaign name is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (form.allocatedBudget && parseFloat(form.allocatedBudget) < 0) e.allocatedBudget = 'Budget must be non-negative'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({
        ...form,
        affectedPopulation: form.affectedPopulation ? parseInt(form.affectedPopulation) : null,
        allocatedBudget: form.allocatedBudget ? parseFloat(form.allocatedBudget) : null,
      })
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Campaign Name <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)}
            placeholder="e.g. Flood Relief – Zone A" />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div>
          <label className="form-label">Disaster Type <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.disasterType} onChange={e => f('disasterType', e.target.value)}>
            {DISASTER_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => f('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Location <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.location} onChange={e => f('location', e.target.value)}
            placeholder="e.g. Zone A, Northern Region" />
          {errors.location && <p className="form-error">{errors.location}</p>}
        </div>
        <div>
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={form.startDate} onChange={e => f('startDate', e.target.value)} />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={form.endDate} onChange={e => f('endDate', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Affected Population</label>
          <input type="number" min="0" className="form-input" value={form.affectedPopulation}
            onChange={e => f('affectedPopulation', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="form-label">Allocated Budget (₱)</label>
          <input type="number" min="0" step="0.01" className="form-input" value={form.allocatedBudget}
            onChange={e => f('allocatedBudget', e.target.value)} placeholder="0.00" />
          {errors.allocatedBudget && <p className="form-error">{errors.allocatedBudget}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Description</label>
          <textarea rows={3} className="form-textarea" value={form.description}
            onChange={e => f('description', e.target.value)}
            placeholder="Brief description of the disaster and relief efforts..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Campaign'}
        </button>
      </div>
    </form>
  )
}

const disasterIcon = { FLOOD:'🌊', CYCLONE:'🌀', LANDSLIDE:'⛰️', EARTHQUAKE:'🏚️', STORM:'⛈️', OTHER:'🆘' }

export default function Campaigns() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })

  const load = async () => {
    setLoading(true)
    try {
      const res = await campaignAPI.getAll()
      setCampaigns(res.data)
    } catch { toast.error('Failed to load campaigns') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status === statusFilter
    const matchType = !typeFilter || c.disasterType === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const handleSave = async (data) => {
    if (modal.editing) {
      await campaignAPI.update(modal.editing.id, data)
      toast.success('Campaign updated')
    } else {
      await campaignAPI.create(data)
      toast.success('Campaign created')
    }
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Disaster Campaigns</h1>
          <p className="page-subtitle">{campaigns.length} total campaigns</p>
        </div>
        {hasRole('ADMIN') && (
          <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-select w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {DISASTER_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Campaign Cards */}
      {filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns found"
          description="No active disaster campaigns. Create one to get started."
          action={hasRole('ADMIN') && <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary">
            <Plus className="w-4 h-4" /> New Campaign</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{disasterIcon[c.disasterType] || '🆘'}</span>
                    <div>
                      <StatusBadge status={c.status} />
                      <div className="text-xs text-slate-400 mt-0.5">{c.campaignCode}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/campaigns/${c.id}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    {hasRole('ADMIN') && (
                      <button onClick={() => setModal({ open: true, editing: c })}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1 leading-snug">{c.name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                  <MapPin className="w-3 h-3" /> {c.location}
                </div>
                {c.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-400">Population</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {c.affectedPopulation?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Budget</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {c.allocatedBudget ? `₱${parseFloat(c.allocatedBudget).toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                  {c.startDate && (
                    <div className="col-span-2 flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {c.startDate} {c.endDate ? `→ ${c.endDate}` : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Campaign' : 'New Disaster Campaign'} size="lg">
        <CampaignForm
          initial={modal.editing ? {
            name: modal.editing.name, disasterType: modal.editing.disasterType,
            location: modal.editing.location, description: modal.editing.description || '',
            startDate: modal.editing.startDate || '', endDate: modal.editing.endDate || '',
            affectedPopulation: modal.editing.affectedPopulation || '',
            allocatedBudget: modal.editing.allocatedBudget || '', status: modal.editing.status
          } : null}
          onSave={handleSave}
          onClose={() => setModal({ open: false, editing: null })}
        />
      </Modal>
    </div>
  )
}
