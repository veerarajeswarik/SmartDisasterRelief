import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, AlertOctagon } from 'lucide-react'
import { requestAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { ConfirmDialog } from '../../components/ui/Modal'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

export default function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState({ open: false, action: null })

  const load = () => requestAPI.getById(id)
    .then(res => setRequest(res.data))
    .catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handleAction = async () => {
    try {
      if (confirm.action === 'approve') await requestAPI.approve(id)
      else await requestAPI.reject(id, 'Rejected by reviewer')
      toast.success(`Request ${confirm.action}d`)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  if (loading) return <PageLoader />
  if (!request) return null

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/requests')} className="btn-secondary py-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">{request.requestNumber}</h1>
            {request.sos && <span className="badge-red badge text-sm">🚨 SOS</span>}
          </div>
          <p className="page-subtitle">{request.campName} · {request.campaignName || 'No campaign'}</p>
        </div>
        <StatusBadge status={request.priority} />
        <StatusBadge status={request.status} />
        {request.status === 'PENDING' && hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <div className="flex gap-2 ml-auto">
            <button onClick={() => setConfirm({ open: true, action: 'approve' })} className="btn-success">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button onClick={() => setConfirm({ open: true, action: 'reject' })} className="btn-danger">
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>

      {request.sos && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-700">SOS Emergency Request</h3>
            <p className="text-sm text-red-600">Emergency Type: {request.emergencyType || 'N/A'}</p>
            {request.sosLocation && <p className="text-sm text-red-600">Location: {request.sosLocation}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Request Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-slate-400 block">Camp</span><span className="font-medium">{request.campName}</span></div>
            <div><span className="text-xs text-slate-400 block">Location</span><span className="font-medium">{request.campLocation || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Campaign</span><span className="font-medium">{request.campaignName || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Requested By</span><span className="font-medium">{request.requestedByName || '—'}</span></div>
            {request.reviewedByName && <div><span className="text-xs text-slate-400 block">Reviewed By</span><span className="font-medium">{request.reviewedByName}</span></div>}
            <div className="col-span-2"><span className="text-xs text-slate-400 block">Reason</span>
              <span className="font-medium leading-relaxed">{request.reason || 'No reason provided'}</span></div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadge status={request.status} /></div>
            <div className="flex justify-between"><span className="text-slate-500">Priority</span><StatusBadge status={request.priority} /></div>
            <div className="flex justify-between"><span className="text-slate-500">Items</span><span className="font-bold">{request.items?.length}</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="text-sm font-semibold text-slate-800">Requested Items</h2></div>
        <div className="table-container rounded-none border-0">
          <table className="table">
            <thead><tr><th>Product</th><th>Requested</th><th>Approved</th><th>Allocated</th></tr></thead>
            <tbody>
              {request.items?.map(item => (
                <tr key={item.id}>
                  <td className="font-medium text-slate-900">{item.productName}</td>
                  <td className="font-semibold">{item.requestedQuantity?.toLocaleString()}</td>
                  <td>{item.approvedQuantity != null ? <span className="badge-green">{item.approvedQuantity}</span> : <span className="text-slate-400 text-xs">Pending</span>}</td>
                  <td>{item.allocatedQuantity != null && item.allocatedQuantity > 0 ? <span className="badge-blue">{item.allocatedQuantity}</span> : <span className="text-slate-400 text-xs">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={handleAction}
        title={confirm.action === 'approve' ? 'Approve Request' : 'Reject Request'}
        message={confirm.action === 'approve' ? 'Approve this resource request? You can then create a dispatch to fulfill it.' : 'Reject this request? The camp representative will be notified.'}
        confirmLabel={confirm.action === 'approve' ? 'Approve' : 'Reject'}
        danger={confirm.action === 'reject'} />
    </div>
  )
}
