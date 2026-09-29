import React, { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, PiggyBank, Edit2 } from 'lucide-react'
import { budgetAPI, fundAPI, campaignAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

function BudgetForm({ campaigns, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    campaignId: '', allocatedAmount: '', procurementBudget: '',
    dispatchBudget: '', otherExpensesBudget: '', notes: ''
  })
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.campaignId || !form.allocatedAmount) { toast.error('Campaign and amount required'); return }
    setSaving(true)
    try {
      await onSave({
        ...form,
        campaignId: parseInt(form.campaignId),
        allocatedAmount: parseFloat(form.allocatedAmount),
        procurementBudget: form.procurementBudget ? parseFloat(form.procurementBudget) : null,
        dispatchBudget: form.dispatchBudget ? parseFloat(form.dispatchBudget) : null,
        otherExpensesBudget: form.otherExpensesBudget ? parseFloat(form.otherExpensesBudget) : null,
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="form-label">Campaign <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.campaignId} onChange={e => f('campaignId', e.target.value)} disabled={!!initial}>
            <option value="">Select campaign...</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Total Allocated Budget (₱) <span className="text-red-500">*</span></label>
          <input type="number" min="0" step="0.01" className="form-input" value={form.allocatedAmount} onChange={e => f('allocatedAmount', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Procurement Budget (₱)</label>
          <input type="number" min="0" step="0.01" className="form-input" value={form.procurementBudget} onChange={e => f('procurementBudget', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Dispatch / Freight Budget (₱)</label>
          <input type="number" min="0" step="0.01" className="form-input" value={form.dispatchBudget} onChange={e => f('dispatchBudget', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Other Approved Expenses (₱)</label>
          <input type="number" min="0" step="0.01" className="form-input" value={form.otherExpensesBudget} onChange={e => f('otherExpensesBudget', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Notes</label>
          <textarea rows={2} className="form-textarea" value={form.notes} onChange={e => f('notes', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Budget'}
        </button>
      </div>
    </form>
  )
}

function FundAccountForm({ campaigns, onSave, onClose }) {
  const ACCOUNT_TYPES = ['RELIEF_GRANTS','BANK','RELIEF_INVENTORY','SUPPLIER_CREDITORS','DISPATCH_FREIGHT_EXPENSE','PROCUREMENT_EXPENSE','OTHER_EXPENSE']
  const [form, setForm] = useState({ accountName: '', accountType: 'BANK', initialBalance: '', description: '', campaignId: '' })
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.accountName) { toast.error('Account name required'); return }
    setSaving(true)
    try {
      await onSave({
        ...form,
        initialBalance: form.initialBalance ? parseFloat(form.initialBalance) : 0,
        campaignId: form.campaignId ? parseInt(form.campaignId) : null
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Account Name <span className="text-red-500">*</span></label>
        <input className="form-input" value={form.accountName} onChange={e => f('accountName', e.target.value)} placeholder="e.g. UNHCR Relief Grant" />
      </div>
      <div>
        <label className="form-label">Account Type <span className="text-red-500">*</span></label>
        <select className="form-select" value={form.accountType} onChange={e => f('accountType', e.target.value)}>
          {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">Initial Balance (₱)</label>
        <input type="number" min="0" step="0.01" className="form-input" value={form.initialBalance} onChange={e => f('initialBalance', e.target.value)} />
      </div>
      <div>
        <label className="form-label">Campaign (Optional)</label>
        <select className="form-select" value={form.campaignId} onChange={e => f('campaignId', e.target.value)}>
          <option value="">None</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea rows={2} className="form-textarea" value={form.description} onChange={e => f('description', e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Create Account'}</button>
      </div>
    </form>
  )
}

const accountTypeColors = {
  RELIEF_GRANTS: 'bg-green-100 text-green-700',
  BANK: 'bg-blue-100 text-blue-700',
  RELIEF_INVENTORY: 'bg-purple-100 text-purple-700',
  SUPPLIER_CREDITORS: 'bg-red-100 text-red-700',
  DISPATCH_FREIGHT_EXPENSE: 'bg-orange-100 text-orange-700',
  PROCUREMENT_EXPENSE: 'bg-amber-100 text-amber-700',
  OTHER_EXPENSE: 'bg-slate-100 text-slate-700',
}

export default function Budget() {
  const { hasRole } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [funds, setFunds] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [budgetModal, setBudgetModal] = useState({ open: false, editing: null })
  const [fundModal, setFundModal] = useState(false)
  const [activeTab, setActiveTab] = useState('budgets')

  const load = async () => {
    setLoading(true)
    try {
      const [bRes, fRes, cRes] = await Promise.all([budgetAPI.getAll(), fundAPI.getAll(), campaignAPI.getAll()])
      setBudgets(bRes.data); setFunds(fRes.data); setCampaigns(cRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const totalFunds = funds.reduce((sum, f) => {
    if (['RELIEF_GRANTS','BANK'].includes(f.accountType)) return sum + parseFloat(f.balance || 0)
    return sum
  }, 0)

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget & Fund Management</h1>
          <p className="page-subtitle">Campaign budgets and fund accounts</p>
        </div>
        <div className="flex gap-2">
          {hasRole('ADMIN') && activeTab === 'budgets' && (
            <button onClick={() => setBudgetModal({ open: true, editing: null })} className="btn-primary">
              <Plus className="w-4 h-4" /> Set Budget
            </button>
          )}
          {hasRole('ADMIN') && activeTab === 'funds' && (
            <button onClick={() => setFundModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Fund Account
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Available Funds</div>
              <div className="text-xl font-bold text-slate-900">₱{totalFunds.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Allocated</div>
              <div className="text-xl font-bold text-slate-900">
                ₱{budgets.reduce((s, b) => s + parseFloat(b.allocatedAmount||0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Spent</div>
              <div className="text-xl font-bold text-slate-900">
                ₱{budgets.reduce((s, b) => s + parseFloat(b.actualExpenditure||0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {['budgets', 'funds'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {tab === 'budgets' ? 'Campaign Budgets' : 'Fund Accounts'}
          </button>
        ))}
      </div>

      {activeTab === 'budgets' && (
        budgets.length === 0 ? (
          <EmptyState icon={PiggyBank} title="No budgets set"
            description="Create campaign budgets to track expenditures."
            action={hasRole('ADMIN') && <button onClick={() => setBudgetModal({ open: true, editing: null })} className="btn-primary"><Plus className="w-4 h-4" />Set Budget</button>} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {budgets.map(b => {
              const util = b.utilizationPercentage || 0
              const barColor = util > 85 ? 'bg-red-500' : util > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              return (
                <div key={b.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{b.campaignName}</h3>
                      <span className={`badge text-xs ${util > 85 ? 'badge-red' : util > 70 ? 'badge-yellow' : 'badge-green'}`}>
                        {b.utilizationStatus}
                      </span>
                    </div>
                    {hasRole('ADMIN') && (
                      <button onClick={() => setBudgetModal({ open: true, editing: b })}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Utilization</span>
                      <span className="font-bold">{util.toFixed(1)}%</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(util, 100)}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {[
                      { label: 'Allocated', val: b.allocatedAmount, color: 'text-slate-700' },
                      { label: 'Spent', val: b.actualExpenditure, color: util > 85 ? 'text-red-600' : 'text-amber-600' },
                      { label: 'Remaining', val: b.remainingAmount, color: 'text-emerald-600' },
                    ].map(r => (
                      <div key={r.label} className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="text-slate-400">{r.label}</div>
                        <div className={`font-bold mt-0.5 ${r.color}`}>₱{parseFloat(r.val||0).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                      </div>
                    ))}
                  </div>
                  {[
                    { label: 'Procurement', val: b.procurementBudget },
                    { label: 'Dispatch', val: b.dispatchBudget },
                    { label: 'Other', val: b.otherExpensesBudget },
                  ].filter(r => r.val).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                      {[
                        { label: 'Procurement Budget', val: b.procurementBudget },
                        { label: 'Dispatch Budget', val: b.dispatchBudget },
                        { label: 'Other Expenses', val: b.otherExpensesBudget },
                      ].filter(r => r.val).map(r => (
                        <div key={r.label} className="flex justify-between text-xs text-slate-500">
                          <span>{r.label}</span>
                          <span className="font-medium">₱{parseFloat(r.val).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {activeTab === 'funds' && (
        funds.length === 0 ? (
          <EmptyState icon={DollarSign} title="No fund accounts"
            description="Add fund accounts to track grants, bank balances and expenses."
            action={hasRole('ADMIN') && <button onClick={() => setFundModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Add Account</button>} />
        ) : (
          <div className="card table-container">
            <table className="table">
              <thead><tr><th>Code</th><th>Account Name</th><th>Type</th><th>Campaign</th><th>Balance</th><th>Status</th></tr></thead>
              <tbody>
                {funds.map(f => (
                  <tr key={f.id}>
                    <td className="font-mono text-xs text-slate-400">{f.accountCode}</td>
                    <td className="font-medium text-slate-900">{f.accountName}</td>
                    <td><span className={`badge ${accountTypeColors[f.accountType] || 'badge-slate'}`}>{f.accountType?.replace(/_/g,' ')}</span></td>
                    <td className="text-slate-500 text-sm">{f.campaignName || '—'}</td>
                    <td className={`font-bold ${['SUPPLIER_CREDITORS','PROCUREMENT_EXPENSE','DISPATCH_FREIGHT_EXPENSE','OTHER_EXPENSE'].includes(f.accountType) ? 'text-red-600' : 'text-green-600'}`}>
                      ₱{parseFloat(f.balance||0).toLocaleString()}
                    </td>
                    <td><span className={f.active ? 'badge-green' : 'badge-slate'}>{f.active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <Modal isOpen={budgetModal.open} onClose={() => setBudgetModal({ open: false, editing: null })}
        title={budgetModal.editing ? 'Edit Budget' : 'Set Campaign Budget'} size="md">
        <BudgetForm campaigns={campaigns}
          initial={budgetModal.editing ? {
            campaignId: budgetModal.editing.campaignId,
            allocatedAmount: budgetModal.editing.allocatedAmount,
            procurementBudget: budgetModal.editing.procurementBudget || '',
            dispatchBudget: budgetModal.editing.dispatchBudget || '',
            otherExpensesBudget: budgetModal.editing.otherExpensesBudget || '',
            notes: budgetModal.editing.notes || ''
          } : null}
          onSave={async (data) => {
            if (budgetModal.editing) { await budgetAPI.update(budgetModal.editing.id, data); toast.success('Budget updated') }
            else { await budgetAPI.create(data); toast.success('Budget created') }
            load()
          }}
          onClose={() => setBudgetModal({ open: false, editing: null })} />
      </Modal>

      <Modal isOpen={fundModal} onClose={() => setFundModal(false)} title="New Fund Account" size="md">
        <FundAccountForm campaigns={campaigns}
          onSave={async (data) => { await fundAPI.create(data); toast.success('Fund account created'); load() }}
          onClose={() => setFundModal(false)} />
      </Modal>
    </div>
  )
}
