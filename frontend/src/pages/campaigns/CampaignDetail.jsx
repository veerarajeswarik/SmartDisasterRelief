import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Tent, Package } from 'lucide-react'
import { campaignAPI, campAPI, budgetAPI } from '../../services/api'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { toast } from 'react-toastify'

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [camps, setCamps] = useState([])
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      campaignAPI.getById(id),
      campAPI.getAll(id),
      budgetAPI.getByCampaign(id).catch(() => ({ data: null }))
    ]).then(([cRes, campsRes, bRes]) => {
      setCampaign(cRes.data)
      setCamps(campsRes.data)
      setBudget(bRes.data)
    }).catch(() => toast.error('Failed to load campaign'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!campaign) return null

  const util = budget ? budget.utilizationPercentage : 0
  const utilColor = util > 85 ? 'bg-red-500' : util > 70 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/campaigns')} className="btn-secondary py-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div>
          <h1 className="page-title">{campaign.name}</h1>
          <p className="page-subtitle">{campaign.campaignCode} · <StatusBadge status={campaign.status} /></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info */}
        <div className="card p-5 lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Campaign Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-400 block text-xs">Disaster Type</span>
              <span className="font-medium">{campaign.disasterType}</span></div>
            <div><span className="text-slate-400 block text-xs">Status</span>
              <StatusBadge status={campaign.status} /></div>
            <div><span className="text-slate-400 block text-xs">Location</span>
              <span className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{campaign.location}</span></div>
            <div><span className="text-slate-400 block text-xs">Affected Population</span>
              <span className="font-medium">{campaign.affectedPopulation?.toLocaleString() || 'N/A'}</span></div>
            <div><span className="text-slate-400 block text-xs">Start Date</span>
              <span className="font-medium">{campaign.startDate || 'N/A'}</span></div>
            <div><span className="text-slate-400 block text-xs">End Date</span>
              <span className="font-medium">{campaign.endDate || 'N/A'}</span></div>
            <div className="col-span-2"><span className="text-slate-400 block text-xs">Description</span>
              <span className="font-medium">{campaign.description || 'No description provided.'}</span></div>
          </div>
        </div>

        {/* Budget */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">Budget Overview</h2>
          {budget ? (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Utilization</span>
                  <span className="font-semibold">{util.toFixed(1)}%</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${utilColor}`} style={{ width: `${Math.min(util, 100)}%` }} />
                </div>
              </div>
              {[
                { label: 'Allocated', val: budget.allocatedAmount },
                { label: 'Spent', val: budget.actualExpenditure },
                { label: 'Remaining', val: budget.remainingAmount },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{r.label}</span>
                  <span className="font-semibold text-slate-800">₱{parseFloat(r.val).toLocaleString()}</span>
                </div>
              ))}
              <StatusBadge status={budget.utilizationStatus === 'HIGH' ? 'CRITICAL' :
                budget.utilizationStatus === 'WARNING' ? 'HIGH' : 'ACTIVE'} />
            </div>
          ) : (
            <p className="text-sm text-slate-400">No budget set for this campaign.</p>
          )}
        </div>
      </div>

      {/* Camps */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Associated Camps ({camps.length})</h2>
          <button onClick={() => navigate('/camps')} className="text-xs text-blue-600 hover:underline">View all camps</button>
        </div>
        {camps.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">No camps assigned to this campaign yet.</div>
        ) : (
          <div className="table-container rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Camp</th><th>Location</th><th>Population</th><th>Priority</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {camps.map(camp => (
                  <tr key={camp.id} className="cursor-pointer" onClick={() => navigate(`/camps/${camp.id}`)}>
                    <td className="font-medium text-slate-900">{camp.name}</td>
                    <td className="text-slate-500">{camp.location}</td>
                    <td>{camp.population?.toLocaleString() || 'N/A'}</td>
                    <td><StatusBadge status={camp.priority} /></td>
                    <td><StatusBadge status={camp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
