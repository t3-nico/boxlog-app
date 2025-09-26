import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

import { CrowdinIntegration, createBoxLogCrowdinConfig } from '@/lib/i18n/crowdin-integration'

/**
 * Crowdin Webhook処理API
 * POST /api/i18n/crowdin/webhook - Crowdinからの通知を受信・処理
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-crowdin-signature')

    // Webhook署名検証（セキュリティ）
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    const crowdin = new CrowdinIntegration(createBoxLogCrowdinConfig())

    // イベント処理
    await crowdin.handleWebhookEvent(event)

    // BoxLog固有の処理
    await handleBoxLogSpecificEvent(event)

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      eventType: event.event,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Crowdin webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook処理エラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * Webhook署名の検証
 * Crowdinからの正当な通知かを確認
 */
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature || !process.env.CROWDIN_WEBHOOK_SECRET) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.CROWDIN_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  )
}

/**
 * BoxLog固有のイベント処理
 * 翻訳更新時の自動処理、通知送信など
 */
async function handleBoxLogSpecificEvent(event: Record<string, unknown>) {
  try {
    switch (event.event) {
      case 'translation.updated':
        await handleTranslationUpdated(event)
        break
      case 'file.approved':
        await handleFileApproved(event)
        break
      case 'project.built':
        await handleProjectBuilt(event)
        break
      case 'proofreading.finished':
        await handleProofreadingFinished(event)
        break
      default:
        console.log('未対応のCrowdinイベント:', event.event)
    }
  } catch (error) {
    console.error('BoxLog固有イベント処理エラー:', error)
  }
}

/**
 * 翻訳更新イベント処理
 */
async function handleTranslationUpdated(event: Record<string, unknown>) {
  console.log('翻訳が更新されました:', {
    language: event.language,
    file: event.file,
    translator: event.user,
    timestamp: event.timestamp,
  })

  // TODO: 自動品質チェック実行
  // TODO: レビュー担当者への通知送信
  // TODO: 翻訳統計の更新
}

/**
 * ファイル承認イベント処理
 */
async function handleFileApproved(event: Record<string, unknown>) {
  console.log('ファイルが承認されました:', {
    language: event.language,
    file: event.file,
    approver: event.user,
    timestamp: event.timestamp,
  })

  // TODO: 自動デプロイトリガー
  // TODO: 関係者への完了通知
  // TODO: 翻訳完了記録の更新
}

/**
 * プロジェクトビルド完了イベント処理
 */
async function handleProjectBuilt(event: Record<string, unknown>) {
  console.log('プロジェクトビルドが完了しました:', {
    buildId: event.buildId,
    status: event.status,
    timestamp: event.timestamp,
  })

  if (event.status === 'finished') {
    // TODO: 翻訳ファイルの自動ダウンロード
    // TODO: CI/CDパイプラインの起動
    // TODO: 関係者への通知
  }
}

/**
 * 校正完了イベント処理
 */
async function handleProofreadingFinished(event: Record<string, unknown>) {
  console.log('校正が完了しました:', {
    language: event.language,
    file: event.file,
    proofreader: event.user,
    timestamp: event.timestamp,
  })

  // TODO: 最終品質チェックの実行
  // TODO: リリース準備の開始
  // TODO: 完了報告書の生成
}

/**
 * GET /api/i18n/crowdin/webhook - Webhook設定確認
 */
export async function GET() {
  return NextResponse.json({
    message: 'Crowdin Webhook endpoint is active',
    supportedEvents: [
      'translation.updated',
      'file.approved',
      'project.built',
      'proofreading.finished',
    ],
    configuration: {
      signatureVerification: !!process.env.CROWDIN_WEBHOOK_SECRET,
      endpoint: '/api/i18n/crowdin/webhook',
    },
  })
}