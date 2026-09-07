import { NextRequest } from 'next/server'

export interface PaginationParams {
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  skip: number
}

export function getPaginationParams(
  request: NextRequest,
  defaults: { sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}
): PaginationParams {
  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')))
  const sortBy = searchParams.get('sortBy') || defaults.sortBy || 'createdAt'
  const sortOrder = (searchParams.get('sortOrder') || defaults.sortOrder || 'desc') as 'asc' | 'desc'

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    skip: (page - 1) * limit
  }
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}
