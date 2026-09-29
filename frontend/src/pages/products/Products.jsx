import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Package, ToggleLeft, ToggleRight } from 'lucide-react'
import { productAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['FOOD','WATER','MEDICAL','SHELTER','CLOTHING','HYGIENE','EMERGENCY_EQUIPMENT','SERVICE']
const categoryColors = {
  FOOD:'bg-orange-100 text-orange-700', WATER:'bg-blue-100 text-blue-700',
  MEDICAL:'bg-red-100 text-red-700', SHELTER:'bg-purple-100 text-purple-700',
  CLOTHING:'bg-pink-100 text-pink-700', HYGIENE:'bg-teal-100 text-teal-700',
  EMERGENCY_EQUIPMENT:'bg-amber-100 text-amber-700', SERVICE:'bg-slate-100 text-slate-700'
}

function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name:'', category:'FOOD', unit:'', description:'',
    minimumStockLevel:'', maximumStockCapacity:'', reorderLevel:'', active:true
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.unit.trim()) errs.unit = 'Unit is required'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({
        ...form,
        minimumStockLevel: form.minimumStockLevel ? parseInt(form.minimumStockLevel) : null,
        maximumStockCapacity: form.maximumStockCapacity ? parseInt(form.maximumStockCapacity) : null,
        reorderLevel: form.reorderLevel ? parseInt(form.reorderLevel) : null,
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Product Name <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. Food Ration Kit" />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div>
          <label className="form-label">Category <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.category} onChange={e => f('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Unit <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.unit} onChange={e => f('unit', e.target.value)} placeholder="e.g. Pack, Kit, Unit" />
          {errors.unit && <p className="form-error">{errors.unit}</p>}
        </div>
        <div>
          <label className="form-label">Minimum Stock Level</label>
          <input type="number" min="0" className="form-input" value={form.minimumStockLevel} onChange={e => f('minimumStockLevel', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Maximum Stock Capacity</label>
          <input type="number" min="0" className="form-input" value={form.maximumStockCapacity} onChange={e => f('maximumStockCapacity', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Reorder Level</label>
          <input type="number" min="0" className="form-input" value={form.reorderLevel} onChange={e => f('reorderLevel', e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <label className="form-label mb-0">Active</label>
          <button type="button" onClick={() => f('active', !form.active)}>
            {form.active ? <ToggleRight className="w-7 h-7 text-blue-600" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
          </button>
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Description</label>
          <textarea rows={2} className="form-textarea" value={form.description} onChange={e => f('description', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}

export default function Products() {
  const { hasRole } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })

  const load = async () => {
    setLoading(true)
    try { const res = await productAPI.getAll(); setProducts(res.data) }
    catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.productCode.toLowerCase().includes(search.toLowerCase())
    const mc = !catFilter || p.category === catFilter
    return ms && mc
  })

  const handleSave = async (data) => {
    if (modal.editing) { await productAPI.update(modal.editing.id, data); toast.success('Product updated') }
    else { await productAPI.create(data); toast.success('Product created') }
    load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Master</h1>
          <p className="page-subtitle">{products.length} products configured</p>
        </div>
        {hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary">
            <Plus className="w-4 h-4" /> New Product
          </button>
        )}
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="form-input pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select w-auto" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found"
          description="Add products to begin managing inventory."
          action={hasRole('ADMIN','LOGISTICS_OFFICER') && (
            <button onClick={() => setModal({ open: true, editing: null })} className="btn-primary"><Plus className="w-4 h-4" /> New Product</button>
          )} />
      ) : (
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th><th>Product Name</th><th>Category</th><th>Unit</th>
                <th>Min Stock</th><th>Max Capacity</th><th>Reorder Level</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-xs text-slate-500">{p.productCode}</td>
                  <td>
                    <div className="font-medium text-slate-900">{p.name}</div>
                    {p.description && <div className="text-xs text-slate-400 truncate max-w-xs">{p.description}</div>}
                  </td>
                  <td><span className={`badge ${categoryColors[p.category] || 'badge-slate'}`}>{p.category}</span></td>
                  <td className="text-slate-600">{p.unit}</td>
                  <td className="text-slate-600">{p.minimumStockLevel ?? '—'}</td>
                  <td className="text-slate-600">{p.maximumStockCapacity ?? '—'}</td>
                  <td className="text-slate-600">{p.reorderLevel ?? '—'}</td>
                  <td><span className={p.active ? 'badge-green' : 'badge-slate'}>{p.active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    {hasRole('ADMIN','LOGISTICS_OFFICER') && (
                      <button onClick={() => setModal({ open: true, editing: p })}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Product' : 'New Product'} size="lg">
        <ProductForm
          initial={modal.editing ? {
            name: modal.editing.name, category: modal.editing.category,
            unit: modal.editing.unit, description: modal.editing.description || '',
            minimumStockLevel: modal.editing.minimumStockLevel || '',
            maximumStockCapacity: modal.editing.maximumStockCapacity || '',
            reorderLevel: modal.editing.reorderLevel || '', active: modal.editing.active
          } : null}
          onSave={handleSave} onClose={() => setModal({ open: false, editing: null })}
        />
      </Modal>
    </div>
  )
}
