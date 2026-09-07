import { NextResponse } from 'next/server'

export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Prisma-specific errors
    if (error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A record with this value already exists.' },
        { status: 409 }
      )
    }
    if (error.message.includes('Record to update not found') || error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Record not found.' },
        { status: 404 }
      )
    }
    if (error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Cannot perform this action due to related records.' },
        { status: 409 }
      )
    }
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred. Please try again.' },
    { status: 500 }
  )
}
