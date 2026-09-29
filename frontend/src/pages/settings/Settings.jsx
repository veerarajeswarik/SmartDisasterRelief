import React, { useState } from 'react'
import { Settings as SettingsIcon, User, Shield, Bell, Database, Info } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import Modal from '../../components/ui/Modal'
import { toast } from 'react-toastify'

function CreateUserForm({ onSave, onClose }) {
  const [form, setForm] = useState({ username:'', password:'', fullName:'', email:'', role:'LOGISTICS_OFFICER', phone:'' })
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password || !form.fullName || !form.email) { toast.error('All fields required'); return }
    setSaving(true)
    try { await onSave(form); onClose() }
    catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="form-label">Username <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.username} onChange={e => f('username', e.target.value)} /></div>
        <div><label className="form-label">Password <span className="text-red-500">*</span></label>
          <input type="password" className="form-input" value={form.password} onChange={e => f('password', e.target.value)} /></div>
        <div><label className="form-label">Full Name <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.fullName} onChange={e => f('fullName', e.target.value)} /></div>
        <div><label className="form-label">Email <span className="text-red-500">*</span></label>
          <input type="email" className="form-input" value={form.email} onChange={e => f('email', e.target.value)} /></div>
        <div><label className="form-label">Role</label>
          <select className="form-select" value={form.role} onChange={e => f('role', e.target.value)}>
            <option value="ADMIN">Admin</option>
            <option value="LOGISTICS_OFFICER">Logistics Officer</option>
            <option value="CAMP_REPRESENTATIVE">Camp Representative</option>
          </select></div>
        <div><label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={e => f('phone', e.target.value)} /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create User'}</button>
      </div>
    </form>
  )
}

export default function Settings() {
  const { user, isAdmin } = useAuth()
  const [userModal, setUserModal] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System Info', icon: Info },
    ...(isAdmin() ? [{ id: 'users', label: 'User Management', icon: Shield }] : []),
  ]

  return (
    <div className="space-y-5 fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card p-3">
          <nav className="space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <s.icon className="w-4 h-4" />{s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {activeSection === 'profile' && (
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Profile Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{user?.fullName?.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{user?.fullName}</div>
                  <div className="text-sm text-slate-500">{user?.email}</div>
                  <span className={`badge mt-1 ${user?.role === 'ADMIN' ? 'badge-blue' : user?.role === 'LOGISTICS_OFFICER' ? 'badge-purple' : 'badge-green'}`}>
                    {user?.role?.replace(/_/g,' ')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
                <div><span className="text-slate-400 block text-xs mb-0.5">Username</span><span className="font-medium">{user?.username}</span></div>
                <div><span className="text-slate-400 block text-xs mb-0.5">Role</span><span className="font-medium">{user?.role?.replace(/_/g,' ')}</span></div>
                <div><span className="text-slate-400 block text-xs mb-0.5">Email</span><span className="font-medium">{user?.email}</span></div>
                {user?.assignedCampName && <div><span className="text-slate-400 block text-xs mb-0.5">Assigned Camp</span><span className="font-medium">{user.assignedCampName}</span></div>}
              </div>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">System Information</h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Application', value: 'Smart Disaster Relief — Resource Allocation & Inventory Tracker' },
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Backend', value: 'Spring Boot 3.2 / Java 17' },
                  { label: 'Frontend', value: 'React 18 / Vite / Tailwind CSS' },
                  { label: 'Database', value: 'MySQL 8' },
                  { label: 'Authentication', value: 'JWT (RS256)' },
                  { label: 'Map Provider', value: 'OpenStreetMap / Leaflet' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-medium text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                This is a college expo project demonstrating a production-style disaster relief resource management platform.
              </div>
            </div>
          )}

          {activeSection === 'users' && isAdmin() && (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">User Management</h2>
                <button onClick={() => setUserModal(true)} className="btn-primary text-xs">
                  <User className="w-3.5 h-3.5" /> Add User
                </button>
              </div>
              <div className="p-4 space-y-2 text-sm text-slate-600">
                <p>Demo credentials:</p>
                <div className="space-y-1 font-mono text-xs bg-slate-50 rounded-lg p-3">
                  <div><span className="font-semibold text-blue-600">admin</span> / admin123 — Administrator</div>
                  <div><span className="font-semibold text-purple-600">logistics1</span> / password123 — Logistics Officer</div>
                  <div><span className="font-semibold text-emerald-600">camp_rep1</span> / password123 — Camp Representative</div>
                  <div><span className="font-semibold text-emerald-600">camp_rep2</span> / password123 — Camp Representative</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={userModal} onClose={() => setUserModal(false)} title="Create New User" size="md">
        <CreateUserForm
          onSave={async (data) => { await userAPI.create(data); toast.success('User created successfully') }}
          onClose={() => setUserModal(false)} />
      </Modal>
    </div>
  )
}
