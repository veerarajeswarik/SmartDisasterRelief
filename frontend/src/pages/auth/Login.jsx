import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) {
      setError('Please enter your username and password.')
      return
    }
    const result = await login(form.username, form.password)
    if (result.success) navigate('/dashboard')
    else setError(result.message)
  }

  const fillDemo = (role) => {
    const creds = {
      admin: { username: 'admin', password: 'admin123' },
      logistics: { username: 'logistics1', password: 'password123' },
      camp: { username: 'camp_rep1', password: 'password123' },
    }
    setForm(creds[role])
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23334155%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Disaster Relief</h1>
          <p className="text-blue-300 text-sm mt-1">Resource Allocation & Inventory Tracker</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Sign in to your account</h2>
          <p className="text-slate-500 text-sm mb-6">Enter your credentials to access the platform</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="form-input"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="form-input pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm">
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3 font-medium text-center">DEMO ACCOUNTS</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => fillDemo('admin')}
                className="text-xs py-2 px-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium">
                Admin
              </button>
              <button onClick={() => fillDemo('logistics')}
                className="text-xs py-2 px-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Logistics
              </button>
              <button onClick={() => fillDemo('camp')}
                className="text-xs py-2 px-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                Camp Rep
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Click a role to auto-fill credentials</p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Smart Disaster Relief Platform · College Expo Project
        </p>
      </div>
    </div>
  )
}
