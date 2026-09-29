import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

// Version key — bump this to force logout on breaking changes
const AUTH_VERSION = 'v2'

function getStoredUser() {
  try {
    const version = localStorage.getItem('auth_version')
    if (version !== AUTH_VERSION) {
      // Clear stale data from old sessions
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.setItem('auth_version', AUTH_VERSION)
      return null
    }
    const stored = localStorage.getItem('user')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    // Validate required fields exist
    if (!parsed.username || !parsed.role || !parsed.token) return null
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    try {
      const res = await authAPI.login({ username, password })
      const data = res.data
      // Store token separately AND inside user for easy access
      const userData = {
        token: data.token,
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        assignedCampId: data.assignedCampId,
        assignedCampName: data.assignedCampName,
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('auth_version', AUTH_VERSION)
      setUser(userData)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid username or password' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = () => user?.role === 'ADMIN'
  const isLogistics = () => user?.role === 'LOGISTICS_OFFICER'
  const isCampRep = () => user?.role === 'CAMP_REPRESENTATIVE'
  const hasRole = (...roles) => roles.includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isLogistics, isCampRep, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
