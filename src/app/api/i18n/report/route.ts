import { NextRequest, NextResponse } from 'next/server'

import TranslationTracker from '@/lib/i18n/translation-tracker'

/**
 * 翻訳進捗レポートAPI
 * Issue #289: 翻訳の進捗状況を追跡し、効率的にレビューできるシステム
 */

const tracker = new TranslationTracker()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const language = searchParams.get('language')

    if (language) {
      // 特定言語の詳細進捗
      const progress = await tracker.calculateLanguageProgress(language)
      return NextResponse.json(progress)
    }

    // 全体レポート
    const report = await tracker.generateTranslationReport()

    if (format === 'csv') {
      const csvData = await tracker.exportProgressCSV()
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="translation-progress-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('翻訳レポート生成エラー:', error)
    return NextResponse.json(
      { error: '翻訳レポートの生成に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, language, key, reviewData } = body

    switch (action) {
      case 'update_review':
        // レビュー状況の更新（将来実装）
        console.log(`Updating review for ${key} in ${language}:`, reviewData)
        return NextResponse.json({ success: true })

      case 'mark_missing':
        // 欠落翻訳のマーク（将来実装）
        console.log(`Marking ${key} as missing in ${language}`)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('翻訳データ更新エラー:', error)
    return NextResponse.json(
      { error: '翻訳データの更新に失敗しました' },
      { status: 500 }
    )
  }
}