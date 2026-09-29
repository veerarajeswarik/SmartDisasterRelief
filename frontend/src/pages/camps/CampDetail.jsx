import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Users, Phone, User, AlertTriangle } from 'lucide-react'
import { campAPI, requestAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { toast } from 'react-toastify'

export default function CampDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [camp, setCamp] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      campAPI.getById(id),
      requestAPI.getAll({ campId: id })
    ]).then(([cRes, rRes]) => {
      setCamp(cRes.data)
      setRequests(rRes.data)
    }).catch(() => toast.error('Failed to load camp'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!camp) return null

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/camps')} className="btn-secondary py-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h1 className="page-title">{camp.name}</h1>
          <p className="page-subtitle">{camp.campCode}</p>
        </div>
        <StatusBadge status={camp.priority} />
        <StatusBadge status={camp.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Camp Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-xs text-slate-400 block">Location</span>
              <span className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{camp.location}</span></div>
            <div><span className="text-xs text-slate-400 block">Population</span>
              <span className="font-medium flex items-center gap-1"><Users className="w-3 h-3" />{camp.population?.toLocaleString() || 'N/A'}</span></div>
            <div><span className="text-xs text-slate-400 block">Representative</span>
              <span className="font-medium flex items-center gap-1"><User className="w-3 h-3" />{camp.representative || 'N/A'}</span></div>
            <div><span className="text-xs text-slate-400 block">Contact</span>
              <span className="font-medium flex items-center gap-1"><Phone className="w-3 h-3" />{camp.contact || 'N/A'}</span></div>
            <div><span className="text-xs text-slate-400 block">Campaign</span>
              <span className="font-medium">{camp.campaignName || 'N/A'}</span></div>
            <div><span className="text-xs text-slate-400 block">Assigned Hub</span>
              <span className="font-medium">{camp.assignedHubName || 'N/A'}</span></div>
          </div>
        </div>
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Quick Stats</h2>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Total Requests</span><span className="font-bold">{requests.length}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Pending</span>
            <span className="font-bold text-amber-600">{requests.filter(r => r.status === 'PENDING').length}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Approved</span>
            <span className="font-bold text-blue-600">{requests.filter(r => r.status === 'APPROVED').length}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Delivered</span>
            <span className="font-bold text-green-600">{requests.filter(r => r.status === 'DELIVERED').length}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">SOS Requests</span>
            <span className="font-bold text-red-600">{requests.filter(r => r.sos).length}</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Resource Requests ({requests.length})</h2>
          <button onClick={() => navigate('/requests')} className="text-xs text-blue-600 hover:underline">View all</button>
        </div>
        <div className="table-container rounded-none border-0">
          <table className="table">
            <thead><tr><th>Request #</th><th>Priority</th><th>Status</th><th>SOS</th><th>Date</th></tr></thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No resource requests for this camp</td></tr>
              ) : requests.map(r => (
                <tr key={r.id} className="cursor-pointer" onClick={() => navigate(`/requests/${r.id}`)}>
                  <td className="font-mono text-xs font-medium">{r.requestNumber}</td>
                  <td><StatusBadge status={r.priority} /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.sos ? <span className="badge-red badge">SOS</span> : <span className="text-slate-400 text-xs">—</span>}</td>
                  <td className="text-slate-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
