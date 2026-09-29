import React, { useState, useEffect } from 'react'
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { auditAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { toast } from 'react-toastify'

const actionColors = {
  LOGIN: 'bg-blue-100 text-blue-700',
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-amber-100 text-amber-700',
  PO_APPROVED: 'bg-purple-100 text-purple-700',
  PO_RECEIVED: 'bg-teal-100 text-teal-700',
  APPROVE: 'bg-emerald-100 text-emerald-700',
  DELIVER: 'bg-green-100 text-green-700',
  INVENTORY_ADJUSTMENT: 'bg-orange-100 text-orange-700',
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)

  const load = async (p = 0) => {
    setLoading(true)
    try {
      const res = await auditAPI.getAll(p, 20)
      setLogs(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotal(res.data.totalElements)
    } catch { toast.error('Failed to load audit logs') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(page) }, [page])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">{total.toLocaleString()} recorded actions</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={Shield} title="No audit logs" description="System actions will be recorded here." />
      ) : (
        <>
          <div className="card table-container">
            <table className="table">
              <thead>
                <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Description</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-US', { month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td>
                      <div className="font-medium text-slate-800 text-sm">{log.fullName || log.username}</div>
                      <div className="text-xs text-slate-400">{log.username}</div>
                    </td>
                    <td>
                      <span className={`badge text-xs ${actionColors[log.action] || 'badge-slate'}`}>{log.action}</span>
                    </td>
                    <td className="text-slate-600 text-sm">{log.entityType}</td>
                    <td className="text-slate-500 text-xs font-mono">{log.entityId ?? '—'}</td>
                    <td className="text-slate-600 text-sm max-w-xs truncate">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
