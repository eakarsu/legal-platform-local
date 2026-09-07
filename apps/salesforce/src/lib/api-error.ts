import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Prisma errors
    if (error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A record with this value already exists' },
        { status: 409 }
      )
    }
    if (error.message.includes('Record to update not found') || error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }
    if (error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Cannot delete this record because it is referenced by other records' },
        { status: 409 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
