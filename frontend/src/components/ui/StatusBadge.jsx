import React from 'react'

const statusConfig = {
  // Campaign
  ACTIVE: { cls: 'badge-green', label: 'Active' },
  PLANNED: { cls: 'badge-blue', label: 'Planned' },
  COMPLETED: { cls: 'badge-slate', label: 'Completed' },
  CLOSED: { cls: 'badge-slate', label: 'Closed' },
  // Priority
  CRITICAL: { cls: 'badge-red', label: 'Critical' },
  HIGH: { cls: 'badge-yellow', label: 'High' },
  MEDIUM: { cls: 'badge-blue', label: 'Medium' },
  LOW: { cls: 'badge-slate', label: 'Low' },
  // Stock
  NORMAL: { cls: 'badge-green', label: 'Normal' },
  // PO
  DRAFT: { cls: 'badge-slate', label: 'Draft' },
  PENDING_APPROVAL: { cls: 'badge-yellow', label: 'Pending Approval' },
  APPROVED: { cls: 'badge-blue', label: 'Approved' },
  RECEIVED: { cls: 'badge-green', label: 'Received' },
  CANCELLED: { cls: 'badge-red', label: 'Cancelled' },
  // Dispatch
  REQUESTED: { cls: 'badge-slate', label: 'Requested' },
  PREPARING: { cls: 'badge-yellow', label: 'Preparing' },
  IN_TRANSIT: { cls: 'badge-blue', label: 'In Transit' },
  DELIVERED: { cls: 'badge-green', label: 'Delivered' },
  // Requests
  PENDING: { cls: 'badge-yellow', label: 'Pending' },
  REJECTED: { cls: 'badge-red', label: 'Rejected' },
  ALLOCATED: { cls: 'badge-purple', label: 'Allocated' },
  DISPATCHED: { cls: 'badge-blue', label: 'Dispatched' },
  // Bills
  UNPAID: { cls: 'badge-red', label: 'Unpaid' },
  PARTIALLY_PAID: { cls: 'badge-yellow', label: 'Partial' },
  PAID: { cls: 'badge-green', label: 'Paid' },
  // Hub
  INACTIVE: { cls: 'badge-slate', label: 'Inactive' },
  MAINTENANCE: { cls: 'badge-yellow', label: 'Maintenance' },
}

export default function StatusBadge({ status, label }) {
  const config = statusConfig[status] || { cls: 'badge-slate', label: status }
  return (
    <span className={config.cls}>
      {label || config.label}
    </span>
  )
}
