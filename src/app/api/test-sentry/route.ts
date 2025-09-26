/**
 * Sentry動作テスト用API Route
 * 開発・検証目的でのエラー送信テスト
 */

import { NextRequest, NextResponse } from 'next/server'

import { AppError, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/errors'
import { createErrorResponse, createSuccessResponse } from '@/lib/errors'
import { SentryErrorHandler, handleApiError } from '@/lib/sentry-integration'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'success'

    // ユーザーコンテキスト設定（テスト用）
    SentryErrorHandler.setUserContext({
      id: 'test-user-123',
      email: 'test@boxlog.com',
      username: 'テストユーザー',
      role: 'developer'
    })

    // 操作コンテキスト設定
    SentryErrorHandler.setOperationContext({
      page: '/api/test-sentry',
      action: 'sentry_test',
      feature: 'error_monitoring',
      test_type: testType
    })

    switch (testType) {
      case 'success':
        SentryErrorHandler.addBreadcrumb('Sentry test API called successfully', 'api', 'info')
        return NextResponse.json(createSuccessResponse({
          message: 'Sentry統合テスト成功',
          timestamp: new Date().toISOString(),
          available_tests: [
            'success - 正常動作テスト',
            'app_error - AppErrorテスト',
            'validation_error - バリデーションエラーテスト',
            'not_found - 404エラーテスト',
            'unauthorized - 認証エラーテスト',
            'unknown_error - 予期しないエラーテスト',
            'js_error - JavaScript例外テスト'
          ]
        }))

      case 'app_error':
        throw new AppError('テスト用AppErrorです', 'TEST_APP_ERROR', 500, {
          context: 'API Route test',
          user_action: 'sentry_test'
        })

      case 'validation_error':
        throw new ValidationError('テスト用バリデーションエラーです', {
          field: 'test_field',
          value: 'invalid_value'
        })

      case 'not_found':
        throw new NotFoundError('テストリソース')

      case 'unauthorized':
        throw new UnauthorizedError('テスト用認証エラーです')

      case 'unknown_error':
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 'これは文字列エラーです（テスト用）'

      case 'js_error':
        const nullValue = null as unknown as { property: string }
        return NextResponse.json({ result: nullValue.property }) // TypeError発生

      default:
        throw new ValidationError('不正なテストタイプです', {
          provided: testType,
          available: ['success', 'app_error', 'validation_error', 'not_found', 'unauthorized', 'unknown_error', 'js_error']
        })
    }
  } catch (error) {
    // APIエラーハンドリング（Sentry自動送信）
    handleApiError(error, {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    })

    return NextResponse.json(createErrorResponse(error), {
      status: error instanceof AppError ? error.status : 500
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // カスタムエラー送信テスト
    if (body.test_custom_error) {
      SentryErrorHandler.captureError(
        new Error(body.message || 'カスタムエラーメッセージ'),
        {
          custom_context: body.context,
          api_route: '/api/test-sentry',
          request_body: body
        }
      )

      return NextResponse.json(createSuccessResponse({
        message: 'カスタムエラーをSentryに送信しました',
        error_message: body.message
      }))
    }

    return NextResponse.json(createSuccessResponse({
      message: 'POST request received',
      body
    }))
  } catch (error) {
    handleApiError(error, {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    })

    return NextResponse.json(createErrorResponse(error), {
      status: error instanceof AppError ? error.status : 500
    })
  }
}