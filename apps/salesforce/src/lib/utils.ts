import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function formatHours(hours: number | string): string {
  const num = typeof hours === 'string' ? parseFloat(hours) : hours
  return `${num.toFixed(2)} hrs`
}

export function generateClientNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `C-${year}-${random}`
}

export function generateMatterNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `M-${year}-${random}`
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${year}-${random}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Client statuses
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    PROSPECT: 'bg-blue-100 text-blue-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
    // Matter statuses
    OPEN: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    ON_HOLD: 'bg-orange-100 text-orange-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    // Invoice statuses
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    VIEWED: 'bg-purple-100 text-purple-800',
    PARTIAL: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    VOID: 'bg-gray-100 text-gray-800',
    // Task statuses
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    REVIEW: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    // Deadline statuses
    EXTENDED: 'bg-orange-100 text-orange-800',
    MISSED: 'bg-red-100 text-red-800',
    // Priority
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    CRITICAL: 'text-red-500',
  }
  return colors[priority] || 'text-gray-500'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
