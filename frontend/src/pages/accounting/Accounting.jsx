import React, { useState, useEffect } from 'react'
import { Plus, BookOpen, FileText } from 'lucide-react'
import { journalAPI, fundAPI, campaignAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

const JOURNAL_TYPES = ['PURCHASE','GRANT','PAYMENT','DISPATCH','ADJUSTMENT']

function JournalForm({ accounts, campaigns, onSave, onClose }) {
  const [form, setForm] = useState({ entryDate: '', journalType: 'GRANT', description: '', campaignId: '' })
  const [lines, setLines] = useState([
    { accountId: '', description: '', debitAmount: '', creditAmount: '' },
    { accountId: '', description: '', debitAmount: '', creditAmount: '' }
  ])
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const updateLine = (i, k, v) => setLines(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l))
  const addLine = () => setLines(p => [...p, { accountId: '', description: '', debitAmount: '', creditAmount: '' }])

  const totalDebits = lines.reduce((s, l) => s + (parseFloat(l.debitAmount) || 0), 0)
  const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.creditAmount) || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.entryDate || !form.description) { toast.error('Date and description required'); return }
    if (!isBalanced) { toast.error(`Entry not balanced: Debits ₱${totalDebits.toFixed(2)} ≠ Credits ₱${totalCredits.toFixed(2)}`); return }
    if (lines.some(l => !l.accountId)) { toast.error('All lines need an account'); return }
    setSaving(true)
    try {
      await onSave({
        ...form,
        campaignId: form.campaignId ? parseInt(form.campaignId) : null,
        lines: lines.map(l => ({
          accountId: parseInt(l.accountId),
          description: l.description || form.description,
          debitAmount: parseFloat(l.debitAmount) || 0,
          creditAmount: parseFloat(l.creditAmount) || 0,
        }))
      })
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Entry Date <span className="text-red-500">*</span></label>
          <input type="date" className="form-input" value={form.entryDate} onChange={e => f('entryDate', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Journal Type</label>
          <select className="form-select" value={form.journalType} onChange={e => f('journalType', e.target.value)}>
            {JOURNAL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="form-label">Description <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.description} onChange={e => f('description', e.target.value)} placeholder="e.g. UNHCR Grant Received" />
        </div>
        <div>
          <label className="form-label">Campaign (Optional)</label>
          <select className="form-select" value={form.campaignId} onChange={e => f('campaignId', e.target.value)}>
            <option value="">None</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Journal Lines (must balance)</label>
          <button type="button" onClick={addLine} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Line</button>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-500">Account</th>
                <th className="px-3 py-2 text-left font-medium text-slate-500">Description</th>
                <th className="px-3 py-2 text-right font-medium text-slate-500">Debit (₱)</th>
                <th className="px-3 py-2 text-right font-medium text-slate-500">Credit (₱)</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 w-40">
                    <select className="form-select text-xs py-1" value={line.accountId} onChange={e => updateLine(i, 'accountId', e.target.value)}>
                      <option value="">Select...</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input className="form-input text-xs py-1" value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Line description" />
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input type="number" min="0" step="0.01" className="form-input text-xs py-1 text-right" value={line.debitAmount} onChange={e => updateLine(i, 'debitAmount', e.target.value)} placeholder="0.00" />
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input type="number" min="0" step="0.01" className="form-input text-xs py-1 text-right" value={line.creditAmount} onChange={e => updateLine(i, 'creditAmount', e.target.value)} placeholder="0.00" />
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold">
                <td colSpan={2} className="px-3 py-2 text-xs text-right text-slate-600">Totals</td>
                <td className="px-3 py-2 text-right text-xs">₱{totalDebits.toFixed(2)}</td>
                <td className="px-3 py-2 text-right text-xs">₱{totalCredits.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {!isBalanced && (totalDebits > 0 || totalCredits > 0) && (
          <p className="text-xs text-red-500 mt-1">⚠ Entry is not balanced. Difference: ₱{Math.abs(totalDebits - totalCredits).toFixed(2)}</p>
        )}
        {isBalanced && (totalDebits > 0) && (
          <p className="text-xs text-green-600 mt-1">✓ Entry is balanced</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving || !isBalanced} className="btn-primary">
          {saving ? 'Saving...' : 'Post Journal Entry'}
        </button>
      </div>
    </form>
  )
}

export default function Accounting() {
  const { hasRole } = useAuth()
  const [journals, setJournals] = useState([])
  const [accounts, setAccounts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [activeTab, setActiveTab] = useState('journal')

  const load = async () => {
    setLoading(true)
    try {
      const [jRes, aRes, cRes] = await Promise.all([journalAPI.getAll(), fundAPI.getAll(), campaignAPI.getAll()])
      setJournals(jRes.data); setAccounts(aRes.data); setCampaigns(cRes.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <PageLoader />

  const typeColors = { PURCHASE:'bg-purple-100 text-purple-700', GRANT:'bg-green-100 text-green-700', PAYMENT:'bg-blue-100 text-blue-700', DISPATCH:'bg-amber-100 text-amber-700', ADJUSTMENT:'bg-slate-100 text-slate-700' }

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounting</h1>
          <p className="page-subtitle">Financial journal and ledger</p>
        </div>
        {hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Journal Entry
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {['journal','ledger'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {tab === 'journal' ? 'Journal Entries' : 'Account Balances'}
          </button>
        ))}
      </div>

      {activeTab === 'journal' && (
        journals.length === 0 ? (
          <EmptyState icon={BookOpen} title="No journal entries"
            description="Post journal entries to record financial transactions."
            action={hasRole('ADMIN','LOGISTICS_OFFICER') && <button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4" />New Entry</button>} />
        ) : (
          <div className="card table-container">
            <table className="table">
              <thead><tr><th>Entry #</th><th>Date</th><th>Type</th><th>Description</th><th>Campaign</th><th>Amount</th><th>Lines</th></tr></thead>
              <tbody>
                {journals.map(je => (
                  <tr key={je.id}>
                    <td className="font-mono text-xs font-semibold text-blue-600">{je.entryNumber}</td>
                    <td className="text-slate-500 text-xs">{je.entryDate}</td>
                    <td><span className={`badge ${typeColors[je.journalType] || 'badge-slate'}`}>{je.journalType}</span></td>
                    <td className="text-slate-700 max-w-xs truncate">{je.description}</td>
                    <td className="text-slate-500 text-sm">{je.campaignName || '—'}</td>
                    <td className="font-bold text-slate-800">₱{parseFloat(je.totalAmount||0).toLocaleString()}</td>
                    <td className="text-slate-500 text-sm">{je.lines?.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {accounts.map(acc => (
            <div key={acc.id} className="card p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-semibold text-slate-900">{acc.accountName}</span>
                  <span className="ml-2 font-mono text-xs text-slate-400">{acc.accountCode}</span>
                </div>
                <div className={`text-lg font-bold ${['SUPPLIER_CREDITORS','PROCUREMENT_EXPENSE','DISPATCH_FREIGHT_EXPENSE','OTHER_EXPENSE'].includes(acc.accountType) ? 'text-red-600' : 'text-green-600'}`}>
                  ₱{parseFloat(acc.balance||0).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-xs ${
                  acc.accountType === 'BANK' ? 'badge-blue' :
                  acc.accountType === 'RELIEF_GRANTS' ? 'badge-green' :
                  acc.accountType === 'SUPPLIER_CREDITORS' ? 'badge-red' : 'badge-slate'
                }`}>{acc.accountType?.replace(/_/g, ' ')}</span>
                {acc.campaignName && <span className="text-xs text-slate-400">{acc.campaignName}</span>}
              </div>
              {acc.description && <p className="text-xs text-slate-400 mt-1">{acc.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Journal Entry" size="2xl">
        <JournalForm accounts={accounts} campaigns={campaigns}
          onSave={async (data) => { await journalAPI.create(data); toast.success('Journal entry posted'); load() }}
          onClose={() => setModal(false)} />
      </Modal>
    </div>
  )
}
