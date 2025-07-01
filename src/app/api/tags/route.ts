import { NextResponse } from 'next/server'
import { getTags } from '@/data'

export async function GET() {
  const tags = await getTags()
  return NextResponse.json(tags)
}
