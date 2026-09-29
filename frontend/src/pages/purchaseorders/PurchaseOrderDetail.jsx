import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Package } from 'lucide-react'
import { poAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { ConfirmDialog } from '../../components/ui/Modal'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

export default function PurchaseOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [po, setPo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState({ open: false, action: null })

  const load = () => poAPI.getById(id)
    .then(res => setPo(res.data))
    .catch(() => toast.error('Failed to load PO'))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handleAction = async () => {
    try {
      if (confirm.action === 'submit') await poAPI.submit(id)
      else if (confirm.action === 'approve') await poAPI.approve(id)
      else if (confirm.action === 'receive') await poAPI.receive(id)
      toast.success('Action completed')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed') }
  }

  if (loading) return <PageLoader />
  if (!po) return null

  const actions = {
    DRAFT: { label: 'Submit for Approval', action: 'submit' },
    PENDING_APPROVAL: { label: 'Approve PO', action: 'approve' },
    APPROVED: { label: 'Mark as Received (Update Inventory)', action: 'receive' },
  }
  const currentAction = actions[po.status]

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/purchase-orders')} className="btn-secondary py-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="page-title">{po.poNumber}</h1>
            <p className="page-subtitle">{po.supplierName} → {po.hubName}</p>
          </div>
          <StatusBadge status={po.status} />
        </div>
        {currentAction && hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setConfirm({ open: true, action: currentAction.action })}
            className={currentAction.action === 'receive' ? 'btn-success' : 'btn-primary'}>
            <CheckCircle className="w-4 h-4" /> {currentAction.label}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-slate-400 block">Supplier</span><span className="font-medium">{po.supplierName}</span></div>
            <div><span className="text-xs text-slate-400 block">Hub</span><span className="font-medium">{po.hubName}</span></div>
            <div><span className="text-xs text-slate-400 block">Campaign</span><span className="font-medium">{po.campaignName || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Order Date</span><span className="font-medium">{po.orderDate || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Expected Delivery</span><span className="font-medium">{po.expectedDeliveryDate || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Created By</span><span className="font-medium">{po.createdByName || '—'}</span></div>
            {po.approvedByName && <div><span className="text-xs text-slate-400 block">Approved By</span><span className="font-medium">{po.approvedByName}</span></div>}
            {po.notes && <div className="col-span-2"><span className="text-xs text-slate-400 block">Notes</span><span className="font-medium">{po.notes}</span></div>}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadge status={po.status} /></div>
            <div className="flex justify-between"><span className="text-slate-500">Items</span><span className="font-bold">{po.items?.length}</span></div>
            <div className="flex justify-between border-t pt-3"><span className="text-slate-700 font-semibold">Total Amount</span>
              <span className="text-lg font-bold text-slate-900">₱{parseFloat(po.totalAmount||0).toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="text-sm font-semibold text-slate-800">Order Items</h2></div>
        <div className="table-container rounded-none border-0">
          <table className="table">
            <thead><tr><th>Product</th><th>Code</th><th>Quantity</th><th>Unit Price</th><th>Total</th><th>Received</th></tr></thead>
            <tbody>
              {po.items?.map(item => (
                <tr key={item.id}>
                  <td className="font-medium text-slate-900">{item.productName}</td>
                  <td className="font-mono text-xs text-slate-400">{item.productCode}</td>
                  <td className="font-semibold">{item.quantity?.toLocaleString()}</td>
                  <td>₱{parseFloat(item.unitPrice||0).toLocaleString()}</td>
                  <td className="font-bold text-slate-800">₱{parseFloat(item.totalPrice||0).toLocaleString()}</td>
                  <td>
                    {item.receivedQuantity != null && item.receivedQuantity > 0
                      ? <span className="badge-green">{item.receivedQuantity}</span>
                      : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={handleAction} title={actions[po.status]?.label || 'Confirm Action'}
        message={confirm.action === 'receive'
          ? 'Marking as received will automatically update inventory stock at the hub. This cannot be undone.'
          : 'Are you sure you want to proceed?'}
        confirmLabel={actions[po.status]?.label} />
    </div>
  )
}
