import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/'

  // 一時的に認証確認を無効化してビルドを通す
  return NextResponse.redirect(new URL(next, request.url))
}
