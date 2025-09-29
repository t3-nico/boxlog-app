import { NextRequest, NextResponse } from 'next/server'

import TranslationTracker from '@/lib/i18n/translation-tracker'

/**
 * 翻訳ヘルスチェックAPI
 * Issue #289: 翻訳の進捗状況を追跡し、効率的にレビューできるシステム
 */

const tracker = new TranslationTracker()

export async function GET(request: NextRequest) {
  try {
    const language = request.nextUrl.searchParams.get('language')

    if (language) {
      // 特定言語のヘルスチェック
      const keys = await tracker.analyzeLanguageKeys(language)
      const missingKeys = await tracker.getMissingTranslationsList(language)

      return NextResponse.json({
        language,
        totalKeys: keys.length,
        missingKeys: missingKeys.length,
        missingKeysList: missingKeys.slice(0, 20), // 最初の20個のみ
        warnings: missingKeys.length > 10 ? [`${language}: ${missingKeys.length}個のキーが欠落しています`] : [],
        errors: missingKeys.length > 50 ? [`${language}: 欠落キーが多すぎます（${missingKeys.length}個）`] : []
      })
    }

    // 全体ヘルスチェック
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