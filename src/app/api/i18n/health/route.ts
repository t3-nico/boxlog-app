import { NextResponse } from 'next/server'

import TranslationTracker from '@/lib/i18n/translation-tracker'

/**
 * 翻訳ヘルスチェックAPI
 * Issue #289: 翻訳の進捗状況を追跡し、効率的にレビューできるシステム
 *
 * 静的レンダリング対応のため、クエリパラメータは使用せず
 * 全体ヘルスチェックのみを提供
 */

const tracker = new TranslationTracker()

export async function GET() {
  try {
    // 全体ヘルスチェックのみ（静的レンダリング対応）
    const health = await tracker.checkTranslationHealth()
    return NextResponse.json(health)
  } catch (error) {
    console.error('翻訳ヘルスチェックエラー:', error)
    return NextResponse.json(
      { error: '翻訳ヘルスチェックに失敗しました' },
      { status: 500 }
    )
  }
}

// 静的レンダリングを強制
export const dynamic = 'force-static'