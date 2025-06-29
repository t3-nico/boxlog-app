import { NextResponse, type NextRequest } from 'next/server'

export function updateSession(_request: NextRequest) {
  // Simply forward the request without modifying cookies
  return NextResponse.next()
}

