import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit2, Tent, MapPin, Users, Phone } from 'lucide-react'
import { campAPI, campaignAPI, hubAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function CampForm({ initial, campaigns, hubs, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name:'', location:'', representative:'', contact:'', population:'',
    campaignId:'', assignedHubId:'', latitude:'', longitude:'',
    priority:'MEDIUM', status:'ACTIVE'
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Camp name is required'
    if (!form.location.trim()) errs.location = 'Location is required'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({
        ...form,
        population: form.population ? parseInt(form.population) : null,
        campaignId: form.campaignId ? parseInt(form.campaignId) : null,
        assignedHubId: form.assignedHubId ? parseInt(form.assignedHubId) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Camp Name <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Zone A Camp 01" />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Location <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.location} onChange={e => f('location', e.target.value)} />
          {errors.location && <p className="form-error">{errors.location}</p>}
        </div>
        <div>
          <label className="form-label">Representative</label>
          <input className="form-input" value={form.representative} onChange={e => f('representative', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Contact</label>
          <input className="form-input" value={form.contact} onChange={e => f('contact', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Population</label>
          <input type="number" min="0" className="form-input" value={form.population} onChange={e => f('population', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e => f('priority', e.target.value)}>
            {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Assigned Campaign</label>
          <select className="form-select" value={form.campaignId} onChange={e => f('campaignId', e.target.value)}>
            <option value="">-- None --</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Assigned Hub</label>
          <select className="form-select" value={form.assignedHubId} onChange={e => f('assignedHubId', e.target.value)}>
            <option value="">-- None --</option>
            {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => f('status', e.target.value)}>
            {['ACTIVE','INACTIVE','CLOSED'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Camp'}
        </button>
      </div>
    </form>
  )
}

const priorityColors = { CRITICAL:'bg-red-100 border-red-200', HIGH:'bg-amber-50 border-amber-200', MEDIUM:'bg-white border-slate-200', LOW:'bg-slate-50 border-slate-200' }

export default function Camps() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [camps, setCamps] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [hubs, setHubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })

  const load = async () => {
    setLoading(true)
    try {
      const [campsRes, campaignsRes, hubsRes] = await Promise.all([
        campAPI.getAll(), campaignAPI.getAll(), hubAPI.getAll()
      ])
      setCamps(campsRes.data)
      setCampaigns(campaignsRes.data)
      setHubs(hubsRes.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = camps.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase())
    const mp = !priorityFilter || c.priority === priorityFilter
    return ms && mp
  })

  const handleSave = async (data) => {
    if (modal.editing) { await campAPI.update(modal.editing.id, data); toast.success('Camp updated') }
    else { await campAPI.create(data); toast.success('Camp created') }
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Camps & Recipients</h1>
          <p className="page-subtitle">{camps.length} camps registered</p>
        </div>
        {hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary">
            <Plus className="w-4 h-4" /> New Camp
          </button>
        )}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search camps..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select w-auto" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          {['CRITICAL','HIGH','MEDIUM','LOW'].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Tent} title="No camps found"
          description="No camps registered. Add camps to start managing relief recipients."
          action={hasRole('ADMIN','LOGISTICS_OFFICER') && (
            <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary"><Plus className="w-4 h-4" /> New Camp</button>
          )} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(camp => (
            <div key={camp.id} className={`card border hover:shadow-md transition-shadow ${priorityColors[camp.priority] || ''}`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 items-center">
                    <StatusBadge status={camp.priority} />
                    <StatusBadge status={camp.status} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/camps/${camp.id}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    {hasRole('ADMIN','LOGISTICS_OFFICER') && (
                      <button onClick={() => setModal({ open: true, editing: camp })}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">{camp.name}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3" /> {camp.location}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                  {camp.population && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Users className="w-3 h-3 text-slate-400" /> {camp.population.toLocaleString()} people
                    </div>
                  )}
                  {camp.contact && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400" /> {camp.contact}
                    </div>
                  )}
                  {camp.campaignName && (
                    <div className="col-span-2 text-slate-500">Campaign: {camp.campaignName}</div>
                  )}
                  {camp.assignedHubName && (
                    <div className="col-span-2 text-slate-500">Hub: {camp.assignedHubName}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Camp' : 'New Camp'} size="lg">
        <CampForm
          initial={modal.editing ? {
            name: modal.editing.name, location: modal.editing.location,
            representative: modal.editing.representative || '', contact: modal.editing.contact || '',
            population: modal.editing.population || '', campaignId: modal.editing.campaignId || '',
            assignedHubId: modal.editing.assignedHubId || '', latitude: modal.editing.latitude || '',
            longitude: modal.editing.longitude || '', priority: modal.editing.priority, status: modal.editing.status
          } : null}
          campaigns={campaigns} hubs={hubs}
          onSave={handleSave} onClose={() => setModal({ open: false, editing: null })}
        />
      </Modal>
    </div>
  )
}
