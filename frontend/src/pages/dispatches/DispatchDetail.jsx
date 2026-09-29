import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Truck } from 'lucide-react'
import { dispatchAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { ConfirmDialog } from '../../components/ui/Modal'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

export default function DispatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [dispatch, setDispatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState({ open: false, action: null })

  const load = () => dispatchAPI.getById(id)
    .then(res => setDispatch(res.data))
    .catch(() => toast.error('Failed to load dispatch'))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handleAction = async () => {
    try {
      if (confirm.action === 'approve') await dispatchAPI.approve(id)
      else if (confirm.action === 'transit') await dispatchAPI.transit(id)
      else if (confirm.action === 'deliver') await dispatchAPI.deliver(id)
      toast.success('Dispatch updated successfully')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed') }
  }

  if (loading) return <PageLoader />
  if (!dispatch) return null

  const actions = {
    REQUESTED: { label: 'Approve Dispatch', action: 'approve', cls: 'btn-primary' },
    APPROVED: { label: 'Mark In Transit (Deduct Inventory)', action: 'transit', cls: 'btn-primary' },
    IN_TRANSIT: { label: 'Confirm Delivered', action: 'deliver', cls: 'btn-success' },
  }
  const currentAction = actions[dispatch.status]

  const statusSteps = ['REQUESTED','APPROVED','PREPARING','IN_TRANSIT','DELIVERED']
  const currentStep = statusSteps.indexOf(dispatch.status)

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dispatches')} className="btn-secondary py-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <h1 className="page-title">{dispatch.dispatchNumber}</h1>
            <p className="page-subtitle">{dispatch.sourceHubName} → {dispatch.destinationCampName}</p>
          </div>
        </div>
        {currentAction && hasRole('ADMIN','LOGISTICS_OFFICER') && (
          <button onClick={() => setConfirm({ open: true, action: currentAction.action })}
            className={currentAction.cls}>
            <CheckCircle className="w-4 h-4" /> {currentAction.label}
          </button>
        )}
      </div>

      {/* Progress tracker */}
      <div className="card p-5">
        <div className="flex items-center gap-0">
          {statusSteps.filter(s => s !== 'PREPARING').map((step, i, arr) => {
            const idx = statusSteps.indexOf(step)
            const done = idx <= currentStep
            const active = idx === currentStep
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                    {done && idx < currentStep ? '✓' : i + 1}
                  </div>
                  <div className={`text-xs mt-1 font-medium whitespace-nowrap ${active ? 'text-blue-600' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.replace('_', ' ')}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentStep ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Dispatch Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-slate-400 block">Source Hub</span><span className="font-medium">{dispatch.sourceHubName}</span></div>
            <div><span className="text-xs text-slate-400 block">Destination Camp</span><span className="font-medium">{dispatch.destinationCampName}</span></div>
            <div><span className="text-xs text-slate-400 block">Campaign</span><span className="font-medium">{dispatch.campaignName || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Priority</span><StatusBadge status={dispatch.priority} /></div>
            <div><span className="text-xs text-slate-400 block">Vehicle</span><span className="font-medium">{dispatch.vehicle || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Driver Contact</span><span className="font-medium">{dispatch.driverContact || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Dispatch Date</span><span className="font-medium">{dispatch.dispatchDate || '—'}</span></div>
            <div><span className="text-xs text-slate-400 block">Expected Delivery</span><span className="font-medium">{dispatch.expectedDeliveryDate || '—'}</span></div>
            {dispatch.actualDeliveryDate && (
              <div><span className="text-xs text-slate-400 block">Actual Delivery</span>
                <span className="font-medium text-green-600">{dispatch.actualDeliveryDate}</span></div>
            )}
            {dispatch.notes && <div className="col-span-2"><span className="text-xs text-slate-400 block">Notes</span><span className="font-medium">{dispatch.notes}</span></div>}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Status</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadge status={dispatch.status} /></div>
            <div className="flex justify-between"><span className="text-slate-500">Items</span><span className="font-bold">{dispatch.items?.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Created By</span><span className="font-medium">{dispatch.createdByName || '—'}</span></div>
            {dispatch.approvedByName && <div className="flex justify-between"><span className="text-slate-500">Approved By</span><span className="font-medium">{dispatch.approvedByName}</span></div>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="text-sm font-semibold text-slate-800">Dispatch Items</h2></div>
        <div className="table-container rounded-none border-0">
          <table className="table">
            <thead><tr><th>Product</th><th>Quantity</th><th>Delivered</th></tr></thead>
            <tbody>
              {dispatch.items?.map(item => (
                <tr key={item.id}>
                  <td className="font-medium text-slate-900">{item.productName}</td>
                  <td className="font-semibold">{item.quantity?.toLocaleString()}</td>
                  <td>{item.deliveredQuantity != null && item.deliveredQuantity > 0
                    ? <span className="badge-green">{item.deliveredQuantity}</span>
                    : <span className="text-slate-400 text-xs">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ ...confirm, open: false })}
        onConfirm={handleAction} title={actions[dispatch.status]?.label}
        message={confirm.action === 'transit'
          ? 'This will deduct dispatched quantities from hub inventory. Cannot be undone.'
          : confirm.action === 'deliver'
          ? 'Confirm delivery will mark all items as delivered and update linked resource requests.'
          : 'Proceed with this action?'}
        confirmLabel={actions[dispatch.status]?.label} />
    </div>
  )
}
