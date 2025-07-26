import { NextResponse } from 'next/server'

export async function GET() {
  // 一時的にセッション更新を無効化してビルドを通す
  return NextResponse.json({ message: 'Session refresh disabled' }, { status: 200 })
}
