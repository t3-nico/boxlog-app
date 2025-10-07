import fs from 'fs/promises'
import path from 'path'

import { NextRequest, NextResponse } from 'next/server'

import { getDictionary } from '@/features/i18n/lib'
import { CrowdinIntegration, createBoxLogCrowdinConfig } from '@/features/i18n/lib/crowdin-integration'

/**
 * Crowdin同期API
 * POST /api/i18n/crowdin/sync - 翻訳データをCrowdinと同期
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, language } = body

    const crowdin = new CrowdinIntegration(createBoxLogCrowdinConfig())

    switch (action) {
      case 'upload':
        return await handleUpload(crowdin, language)
      case 'download':
        return await handleDownload(crowdin, language)
      case 'progress':
        return await handleProgress(crowdin)
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use upload, download, or progress.' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Crowdin sync error:', error)
    return NextResponse.json(
      { error: 'Crowdin同期エラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * 翻訳データのアップロード処理
 */
async function handleUpload(crowdin: CrowdinIntegration, language: string) {
  try {
    // BoxLogの翻訳データを取得
    const dictionary = await getDictionary(language as import('@/types/i18n').Locale)
    const jsonContent = JSON.stringify(dictionary, null, 2)
    const filePath = `${language}.json`

    const result = await crowdin.uploadTranslations(filePath, jsonContent)

    return NextResponse.json({
      success: true,
      message: `${language}の翻訳データをCrowdinにアップロードしました`,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: `アップロードエラー: ${error}` },
      { status: 500 }
    )
  }
}

/**
 * 翻訳データのダウンロード処理
 */
async function handleDownload(crowdin: CrowdinIntegration, language: string) {
  try {
    const translations = await crowdin.downloadTranslations(language)

    // ローカルの翻訳ファイルを更新
    const translationPath = path.join(process.cwd(), 'src', 'dictionaries', `${language}.json`)
    // Note: This is a legitimate file operation for translation files
    await fs.writeFile(translationPath, JSON.stringify(translations, null, 2))

    return NextResponse.json({
      success: true,
      message: `${language}の翻訳データをCrowdinからダウンロードしました`,
      data: {
        language,
        keysCount: Object.keys(translations).length,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: `ダウンロードエラー: ${error}` },
      { status: 500 }
    )
  }
}

/**
 * 翻訳進捗の取得処理
 */
async function handleProgress(crowdin: CrowdinIntegration) {
  try {
    const progress = await crowdin.getTranslationProgress()

    return NextResponse.json({
      success: true,
      message: '翻訳進捗を取得しました',
      data: {
        totalLanguages: progress.length,
        progress,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: `進捗取得エラー: ${error}` },
      { status: 500 }
    )
  }
}

/**
 * GET /api/i18n/crowdin/sync - 同期状況確認
 */
export async function GET() {
  try {
    const crowdin = new CrowdinIntegration(createBoxLogCrowdinConfig())
    const progress = await crowdin.getTranslationProgress()

    return NextResponse.json({
      success: true,
      message: 'Crowdin連携状況',
      data: {
        connected: true,
        languages: progress.map(p => ({
          language: p.language,
          progress: p.progress,
          status: p.progress >= 100 ? 'completed' : p.progress >= 50 ? 'in-progress' : 'pending',
        })),
        lastChecked: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Crowdin連携確認エラー',
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: false,
    })
  }
}