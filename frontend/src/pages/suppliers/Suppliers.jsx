import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Eye, Users, Phone, Mail, Building2 } from 'lucide-react'
import { supplierAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function SupplierForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name:'', contactPerson:'', phone:'', email:'', address:'',
    suppliedCategories:'', paymentTerms:'', active:true
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Supplier name is required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try { await onSave(form); onClose() }
    catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Supplier Name <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. GlobalAid Supplies Co." />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div>
          <label className="form-label">Contact Person</label>
          <input className="form-input" value={form.contactPerson} onChange={e => f('contactPerson', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={e => f('phone', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={form.email} onChange={e => f('email', e.target.value)} />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Address</label>
          <textarea rows={2} className="form-textarea" value={form.address} onChange={e => f('address', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Supplied Categories</label>
          <input className="form-input" value={form.suppliedCategories} onChange={e => f('suppliedCategories', e.target.value)}
            placeholder="e.g. FOOD, MEDICAL, WATER" />
        </div>
        <div>
          <label className="form-label">Payment Terms</label>
          <select className="form-select" value={form.paymentTerms} onChange={e => f('paymentTerms', e.target.value)}>
            <option value="">Select...</option>
            {['NET-15','NET-30','NET-45','NET-60','IMMEDIATE'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Supplier'}
        </button>
      </div>
    </form>
  )
}

export default function Suppliers() {
  const { hasRole } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })

  const load = async () => {
    setLoading(true)
    try { const res = await supplierAPI.getAll(); setSuppliers(res.data) }
    catch { toast.error('Failed to load suppliers') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contactPerson || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data) => {
    if (modal.editing) { await supplierAPI.update(modal.editing.id, data); toast.success('Supplier updated') }
    else { await supplierAPI.create(data); toast.success('Supplier created') }
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Management</h1>
          <p className="page-subtitle">{suppliers.length} suppliers registered</p>
        </div>
        {hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary">
            <Plus className="w-4 h-4" /> New Supplier
          </button>
        )}
      </div>
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No suppliers found"
          description="Add relief supply vendors."
          action={hasRole('ADMIN','LOGISTICS_OFFICER') && (
            <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary"><Plus className="w-4 h-4" /> New Supplier</button>
          )} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={s.active ? 'badge-green' : 'badge-slate'}>{s.active ? 'Active' : 'Inactive'}</span>
                  {hasRole('ADMIN','LOGISTICS_OFFICER') && (
                    <button onClick={() => setModal({ open: true, editing: s })}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">{s.name}</h3>
              <div className="text-xs text-slate-400 mb-3">{s.supplierCode}</div>
              <div className="space-y-1.5 text-xs text-slate-600">
                {s.contactPerson && <div className="flex items-center gap-1.5"><Users className="w-3 h-3 text-slate-400" />{s.contactPerson}</div>}
                {s.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" />{s.phone}</div>}
                {s.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" />{s.email}</div>}
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  {s.paymentTerms && <span className="badge-blue">{s.paymentTerms}</span>}
                </div>
                <div className="text-xs text-slate-500">{s.totalOrders} orders</div>
              </div>
              {s.suppliedCategories && (
                <p className="text-xs text-slate-400 mt-1.5 truncate">{s.suppliedCategories}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Supplier' : 'New Supplier'} size="lg">
        <SupplierForm
          initial={modal.editing ? {
            name: modal.editing.name, contactPerson: modal.editing.contactPerson || '',
            phone: modal.editing.phone || '', email: modal.editing.email || '',
            address: modal.editing.address || '', suppliedCategories: modal.editing.suppliedCategories || '',
            paymentTerms: modal.editing.paymentTerms || '', active: modal.editing.active
          } : null}
          onSave={handleSave} onClose={() => setModal({ open: false, editing: null })}
        />
      </Modal>
    </div>
  )
}
