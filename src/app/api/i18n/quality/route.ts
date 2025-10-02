// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
import { NextRequest, NextResponse } from 'next/server'

import TranslationQualityAssurance from '@/lib/i18n/quality-assurance'

/**
 * 翻訳品質保証API
 * Issue #288: 翻訳品質を担保するためのQAプロセス設計・実装
 */

const qa = new TranslationQualityAssurance()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'evaluate':
        return await handleEvaluateAction(body)
      case 'start_review':
        return await handleStartReviewAction(body)
      case 'submit_review':
        return await handleSubmitReviewAction(body)
      case 'get_report':
        return await handleGetReportAction(body)
      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('品質保証API エラー:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

async function handleEvaluateAction(body: Record<string, unknown>) {
  const { translationKey, language, originalText, translatedText } = body

  if (!translationKey || !language || !originalText || !translatedText) {
    return NextResponse.json(
      { error: '必要なパラメータが不足しています' },
      { status: 400 }
    )
  }

  const assessment = await qa.evaluateTranslationQuality(
    translationKey as string,
    language as string,
    originalText as string,
    translatedText as string
  )

  return NextResponse.json(assessment)
}

async function handleStartReviewAction(body: Record<string, unknown>) {
  const { translationKey, language, reviewer } = body

  if (!translationKey || !language) {
    return NextResponse.json(
      { error: 'translationKeyとlanguageは必須です' },
      { status: 400 }
    )
  }

  const workflow = await qa.startReviewWorkflow(
    translationKey as string,
    language as string,
    reviewer as string
  )
  return NextResponse.json(workflow)
}

async function handleSubmitReviewAction(body: Record<string, unknown>) {
  const { translationKey, language, reviewer, assessment, comments } = body

  if (!translationKey || !language || !reviewer || !assessment) {
    return NextResponse.json(
      { error: '必要なレビュー情報が不足しています' },
      { status: 400 }
    )
  }

  const reviewedWorkflow = await qa.addReview(
    translationKey as string,
    language as string,
    assessment as unknown,
    reviewer as string,
    (comments as string) || ''
  )

  return NextResponse.json(reviewedWorkflow)
}

async function handleGetReportAction(body: Record<string, unknown>) {
  const { startDate, endDate, reportLanguage } = body
  const start = startDate
    ? new Date(startDate as string)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // デフォルト30日前
  const end = endDate ? new Date(endDate as string) : new Date()

  const report = await qa.generateQualityReport(start, end, reportLanguage as string)
  return NextResponse.json(report)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const translationKey = searchParams.get('translationKey')
    const language = searchParams.get('language')

    switch (action) {
      case 'get_workflow':
        return await handleGetWorkflowAction(translationKey, language)
      case 'get_metrics':
        return await handleGetMetricsAction(language)
      case 'health':
        return await handleHealthAction()
      default:
        return NextResponse.json(
          { error: '無効なアクションです' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('品質保証API GET エラー:', error)
    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

async function handleGetWorkflowAction(translationKey: string | null, language: string | null) {
  if (!translationKey || !language) {
    return NextResponse.json(
      { error: 'translationKeyとlanguageは必須です' },
      { status: 400 }
    )
  }

  const workflow = await qa.getReviewWorkflow(translationKey, language)
  return NextResponse.json(workflow)
}

async function handleGetMetricsAction(language: string | null) {
  const metrics = await qa.getQualityMetrics(language || undefined)
  return NextResponse.json(metrics)
}

async function handleHealthAction() {
  return NextResponse.json({
    status: 'active',
    message: 'Translation Quality Assurance API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
}