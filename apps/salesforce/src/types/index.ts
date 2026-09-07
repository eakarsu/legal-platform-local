import { UserRole } from '@prisma/client'

export interface SessionUser {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  role: UserRole
  firmId: string
  firmName: string
}

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }

  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    role: string
    firmId: string
    firmName: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    firmId: string
    firmName: string
    firstName: string
    lastName: string
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ClientFormData {
  type: string
  status: string
  firstName?: string
  lastName?: string
  companyName?: string
  email?: string
  phone?: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  referralSource?: string
  notes?: string
}

export interface MatterFormData {
  name: string
  description?: string
  status: string
  practiceAreaId: string
  clientId: string
  billingType: string
  flatFee?: number
  contingencyPct?: number
  retainerAmount?: number
  budgetAmount?: number
  courtName?: string
  caseNumber?: string
  judgeName?: string
  jurisdiction?: string
  notes?: string
}

export interface TimeEntryFormData {
  date: string
  hours: number
  matterId: string
  activityCodeId?: string
  description: string
  billable: boolean
}

export interface InvoiceFormData {
  matterId: string
  timeEntryIds: string[]
  expenseIds: string[]
  notes?: string
  terms?: string
}
