import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'

// Auth
import Login from './pages/auth/Login'

// Pages
import Dashboard from './pages/dashboard/Dashboard'
import Campaigns from './pages/campaigns/Campaigns'
import CampaignDetail from './pages/campaigns/CampaignDetail'
import Hubs from './pages/hubs/Hubs'
import HubDetail from './pages/hubs/HubDetail'
import Camps from './pages/camps/Camps'
import CampDetail from './pages/camps/CampDetail'
import Products from './pages/products/Products'
import Inventory from './pages/inventory/Inventory'
import Suppliers from './pages/suppliers/Suppliers'
import PurchaseOrders from './pages/purchaseorders/PurchaseOrders'
import PurchaseOrderDetail from './pages/purchaseorders/PurchaseOrderDetail'
import Dispatches from './pages/dispatches/Dispatches'
import DispatchDetail from './pages/dispatches/DispatchDetail'
import ResourceRequests from './pages/requests/ResourceRequests'
import RequestDetail from './pages/requests/RequestDetail'
import Budget from './pages/budget/Budget'
import Accounting from './pages/accounting/Accounting'
import Reports from './pages/reports/Reports'
import Notifications from './pages/notifications/Notifications'
import AuditLog from './pages/audit/AuditLog'
import Settings from './pages/settings/Settings'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/:id" element={<CampaignDetail />} />
          <Route path="hubs" element={<Hubs />} />
          <Route path="hubs/:id" element={<HubDetail />} />
          <Route path="camps" element={<Camps />} />
          <Route path="camps/:id" element={<CampDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
          <Route path="dispatches" element={<Dispatches />} />
          <Route path="dispatches/:id" element={<DispatchDetail />} />
          <Route path="requests" element={<ResourceRequests />} />
          <Route path="requests/:id" element={<RequestDetail />} />
          <Route path="budget" element={<Budget />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="audit-logs" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
