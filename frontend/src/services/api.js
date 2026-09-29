import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
}

// Dashboard
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
}

// Campaigns
export const campaignAPI = {
  getAll: (status) => api.get('/campaigns', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
}

// Relief Hubs
export const hubAPI = {
  getAll: () => api.get('/hubs'),
  getById: (id) => api.get(`/hubs/${id}`),
  create: (data) => api.post('/hubs', data),
  update: (id, data) => api.put(`/hubs/${id}`, data),
}

// Camps
export const campAPI = {
  getAll: (campaignId) => api.get('/camps', { params: campaignId ? { campaignId } : {} }),
  getById: (id) => api.get(`/camps/${id}`),
  create: (data) => api.post('/camps', data),
  update: (id, data) => api.put(`/camps/${id}`, data),
}

// Products
export const productAPI = {
  getAll: () => api.get('/products'),
  getActive: () => api.get('/products/active'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
}

// Inventory
export const inventoryAPI = {
  getAll: (hubId) => api.get('/inventory', { params: hubId ? { hubId } : {} }),
  getCritical: () => api.get('/inventory/critical'),
  getLowStock: () => api.get('/inventory/low-stock'),
  adjust: (data) => api.post('/inventory/adjust', data),
}

// Suppliers
export const supplierAPI = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
}

// Purchase Orders
export const poAPI = {
  getAll: (status) => api.get('/purchase-orders', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  submit: (id) => api.put(`/purchase-orders/${id}/submit`),
  approve: (id) => api.put(`/purchase-orders/${id}/approve`),
  receive: (id) => api.post(`/purchase-orders/${id}/receive`),
}

// Resource Requests
export const requestAPI = {
  getAll: (params) => api.get('/resource-requests', { params }),
  getSos: () => api.get('/resource-requests/sos'),
  getById: (id) => api.get(`/resource-requests/${id}`),
  create: (data) => api.post('/resource-requests', data),
  approve: (id) => api.put(`/resource-requests/${id}/approve`),
  reject: (id, reason) => api.put(`/resource-requests/${id}/reject`, { reason }),
}

// Dispatches
export const dispatchAPI = {
  getAll: (status) => api.get('/dispatches', { params: status ? { status } : {} }),
  getById: (id) => api.get(`/dispatches/${id}`),
  create: (data) => api.post('/dispatches', data),
  approve: (id) => api.put(`/dispatches/${id}/approve`),
  transit: (id) => api.put(`/dispatches/${id}/transit`),
  deliver: (id) => api.put(`/dispatches/${id}/deliver`),
}

// Budgets
export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  getById: (id) => api.get(`/budgets/${id}`),
  getByCampaign: (campaignId) => api.get(`/budgets/campaign/${campaignId}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
}

// Fund Accounts
export const fundAPI = {
  getAll: () => api.get('/fund-accounts'),
  getById: (id) => api.get(`/fund-accounts/${id}`),
  create: (data) => api.post('/fund-accounts', data),
}

// Journal
export const journalAPI = {
  getAll: () => api.get('/journal'),
  getById: (id) => api.get(`/journal/${id}`),
  create: (data) => api.post('/journal', data),
}

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
}

// Reports
export const reportAPI = {
  inventory: (hubId) => api.get('/reports/inventory', { params: hubId ? { hubId } : {} }),
  purchaseOrders: () => api.get('/reports/purchase-orders'),
  dispatches: (campaignId) => api.get('/reports/dispatches', { params: campaignId ? { campaignId } : {} }),
  budget: () => api.get('/reports/budget'),
  balanceSheet: () => api.get('/reports/balance-sheet'),
  profitLoss: () => api.get('/reports/profit-loss'),
}

// Audit
export const auditAPI = {
  getAll: (page = 0, size = 20) => api.get('/audit-logs', { params: { page, size } }),
}

// Users
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
}
