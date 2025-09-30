/**
 * エラーパターン辞書システム - 統合テスト
 * 全コンポーネントの連携動作を検証
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  AppError,
  createAppError,
  executeWithAutoRecovery,
  errorPatternDictionary,
  ERROR_CODES,
  getErrorCategory,
  getUserMessage
} from '@/config/error-patterns'
import { globalErrorHandler } from '@/lib/error-handler'
import { sentryIntegration } from '@/lib/sentry'

// モック設定
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  withScope: vi.fn((callback) => callback({
    setTag: vi.fn(),
    setContext: vi.fn(),
    setFingerprint: vi.fn(),
    setLevel: vi.fn(),
    setUser: vi.fn(),
    setExtra: vi.fn()
  })),
  getCurrentHub: vi.fn(() => ({
    getClient: vi.fn(() => ({ getDsn: vi.fn(() => ({ toString: vi.fn(() => 'mock-dsn') })) }))
  })),
  startTransaction: vi.fn(() => ({
    setTag: vi.fn(),
    setData: vi.fn(),
    finish: vi.fn()
  }))
}))

describe('エラーパターン辞書システム - 統合テスト', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    // コンソール出力をモック
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 統計をリセット
    errorPatternDictionary.resetStats()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('基本的なエラー処理フロー', () => {
    it('AppError の作成から処理まで一貫して動作する', async () => {
      const errorCode = ERROR_CODES.INVALID_TOKEN
      const errorMessage = 'テスト用の認証エラー'

      // AppError を作成
      const appError = createAppError(errorMessage, errorCode, {
        source: 'test',
        userId: 'test-user-123',
        context: { testFlag: true }
      })

      // 基本プロパティの検証
      expect(appError).toBeInstanceOf(AppError)
      expect(appError.code).toBe(errorCode)
      expect(appError.category).toBe('AUTH')
      expect(appError.severity).toBe('high')
      expect(appError.message).toBe(errorMessage)

      // ユーザーメッセージの検証
      expect(appError.userMessage.title).toBe('ログインが必要です')
      expect(appError.userMessage.description).toBe('セッションが無効です。再度ログインしてください。')

      // メタデータの検証
      expect(appError.metadata.source).toBe('test')
      expect(appError.metadata.userId).toBe('test-user-123')
      expect(appError.metadata.context).toEqual({ testFlag: true })

      // エラー処理を実行
      await globalErrorHandler.handleError(appError)

      // ログが出力されたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH:1001]'),
        appError
      )
    })

    it('複数のエラーカテゴリで正しく処理される', async () => {
      const testCases = [
        { code: ERROR_CODES.INVALID_EMAIL, expectedCategory: 'VALIDATION' },
        { code: ERROR_CODES.CONNECTION_FAILED, expectedCategory: 'DB' },
        { code: ERROR_CODES.INSUFFICIENT_BALANCE, expectedCategory: 'BIZ' },
        { code: ERROR_CODES.API_UNAVAILABLE, expectedCategory: 'EXTERNAL' },
        { code: ERROR_CODES.INTERNAL_SERVER_ERROR, expectedCategory: 'SYSTEM' },
        { code: ERROR_CODES.RATE_LIMIT_EXCEEDED, expectedCategory: 'RATE' }
      ]

      for (const testCase of testCases) {
        const appError = createAppError(
          `Test error for ${testCase.expectedCategory}`,
          testCase.code
        )

        expect(appError.category).toBe(testCase.expectedCategory)
        expect(getErrorCategory(testCase.code)).toBe(testCase.expectedCategory)

        const userMessage = getUserMessage(testCase.code)
        expect(userMessage.title).toBeTruthy()
        expect(userMessage.description).toBeTruthy()
      }
    })
  })

  describe('自動復旧システム', () => {
    it('成功する操作は正常に完了する', async () => {
      const successOperation = vi.fn().mockResolvedValue('success result')

      const result = await executeWithAutoRecovery(
        successOperation,
        ERROR_CODES.API_UNAVAILABLE,
        { testContext: 'success-test' }
      )

      expect(result.success).toBe(true)
      expect(result.data).toBe('success result')
      expect(result.error).toBeUndefined()
      expect(successOperation).toHaveBeenCalledTimes(1)
    })

    it('失敗する操作でも適切にエラーハンドリングされる', async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error('Operation failed'))

      const result = await executeWithAutoRecovery(
        failingOperation,
        ERROR_CODES.EXTERNAL_AUTH_FAILED,
        { testContext: 'failure-test' }
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(AppError)
      expect(result.error?.code).toBe(ERROR_CODES.EXTERNAL_AUTH_FAILED)
      expect(result.error?.category).toBe('EXTERNAL')
    })

    it('リトライ可能なエラーで複数回実行される', async () => {
      let attempts = 0
      const retryableOperation = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return 'success after retry'
      })

      const result = await executeWithAutoRecovery(
        retryableOperation,
        ERROR_CODES.CONNECTION_FAILED, // DB接続エラーはリトライ可能
        { testContext: 'retry-test' }
      )

      expect(result.success).toBe(true)
      expect(result.data).toBe('success after retry')
      expect(retryableOperation).toHaveBeenCalledTimes(3)
      expect(result.recoveryApplied).toBe(true)
    })
  })

  describe('エラーコード別の動作検証', () => {
    it('認証エラー - リトライ無効', async () => {
      const authError = createAppError(
        'Authentication failed',
        ERROR_CODES.INVALID_TOKEN
      )

      expect(authError.isRetryable()).toBe(false)
      expect(authError.shouldNotifyUser()).toBe(true)
      expect(authError.pattern.recovery.retry.enabled).toBe(false)
    })

    it('データベースエラー - リトライ有効', async () => {
      const dbError = createAppError(
        'Database connection failed',
        ERROR_CODES.CONNECTION_FAILED
      )

      expect(dbError.isRetryable()).toBe(true)
      expect(dbError.pattern.recovery.retry.enabled).toBe(true)
      expect(dbError.pattern.recovery.circuitBreaker.enabled).toBe(true)
    })

    it('レート制限エラー - 自動リトライ有効', async () => {
      const rateLimitError = createAppError(
        'Rate limit exceeded',
        ERROR_CODES.RATE_LIMIT_EXCEEDED
      )

      expect(rateLimitError.isRetryable()).toBe(true)
      expect(rateLimitError.pattern.recovery.retry.enabled).toBe(true)
      expect(rateLimitError.pattern.recovery.autoRecovery).toBe(true)
    })
  })

  describe('統計・メトリクス機能', () => {
    it('エラー統計が正しく記録される', () => {
      // 複数のエラーを作成
      createAppError('Error 1', ERROR_CODES.INVALID_TOKEN)
      createAppError('Error 2', ERROR_CODES.INVALID_TOKEN)
      createAppError('Error 3', ERROR_CODES.CONNECTION_FAILED)

      const stats = errorPatternDictionary.getErrorStats()
      const categoryStats = errorPatternDictionary.getCategoryStats()

      // エラー統計の確認
      expect(stats.get(ERROR_CODES.INVALID_TOKEN)).toBe(2)
      expect(stats.get(ERROR_CODES.CONNECTION_FAILED)).toBe(1)

      // カテゴリ統計の確認
      expect(categoryStats.AUTH).toBe(2)
      expect(categoryStats.DB).toBe(1)
    })

    it('健全性チェックが正しく動作する', () => {
      // エラーを作成
      createAppError('Critical error', ERROR_CODES.INTERNAL_SERVER_ERROR)
      createAppError('Regular error', ERROR_CODES.INVALID_FORMAT)

      const healthStatus = errorPatternDictionary.healthCheck()

      expect(healthStatus.totalErrors).toBe(2)
      expect(healthStatus.criticalErrors).toBe(1) // SYSTEM カテゴリは critical
      expect(healthStatus.categoryBreakdown.SYSTEM).toBe(1)
      expect(healthStatus.categoryBreakdown.VALIDATION).toBe(1)
    })
  })

  describe('Sentry連携', () => {
    it('AppError が Sentry に正しくレポートされる', () => {
      const appError = createAppError(
        'Test error for Sentry',
        ERROR_CODES.EXTERNAL_AUTH_FAILED,
        {
          userId: 'test-user',
          context: { testData: 'sentry-test' }
        }
      )

      sentryIntegration.reportError(appError)

      // Sentry モックの呼び出しを確認
      const Sentry = require('@sentry/nextjs')
      expect(Sentry.withScope).toHaveBeenCalled()
    })

    it('Sentry の健全性チェックが動作する', () => {
      const isHealthy = sentryIntegration.isHealthy()
      expect(typeof isHealthy).toBe('boolean')

      const stats = sentryIntegration.getStats()
      expect(stats).toHaveProperty('initialized')
    })
  })

  describe('パフォーマンス検証', () => {
    it('大量のエラー処理でもパフォーマンスが保たれる', async () => {
      const startTime = Date.now()
      const errorCount = 1000

      // 大量のエラーを処理
      for (let i = 0; i < errorCount; i++) {
        createAppError(
          `Performance test error ${i}`,
          ERROR_CODES.UNEXPECTED_ERROR
        )
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // 1000エラーの処理が1秒以内で完了することを確認
      expect(duration).toBeLessThan(1000)

      // 統計の確認
      const stats = errorPatternDictionary.getErrorStats()
      expect(stats.get(ERROR_CODES.UNEXPECTED_ERROR)).toBe(errorCount)
    })

    it('エラーパターン取得が高速である', () => {
      const iterations = 10000
      const startTime = Date.now()

      for (let i = 0; i < iterations; i++) {
        errorPatternDictionary.getPattern(ERROR_CODES.INVALID_TOKEN)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // 10000回の取得が100ms以内で完了することを確認
      expect(duration).toBeLessThan(100)
    })
  })

  describe('型安全性の検証', () => {
    it('TypeScript の型システムが正しく機能する', () => {
      // ErrorCode 型の検証
      const validErrorCode: number = ERROR_CODES.INVALID_TOKEN
      expect(typeof validErrorCode).toBe('number')

      // ErrorCategory 型の検証
      const category = getErrorCategory(ERROR_CODES.INVALID_TOKEN)
      expect(category).toBe('AUTH')

      // AppError の型安全性
      const appError = createAppError('test', ERROR_CODES.INVALID_TOKEN)
      expect(appError.code).toBe(ERROR_CODES.INVALID_TOKEN)
      expect(appError.category).toBe('AUTH')
    })
  })

  describe('エラーハンドラーの統合動作', () => {
    it('通知ハンドラーが正しく登録・実行される', async () => {
      const mockNotificationHandler = vi.fn()

      globalErrorHandler.registerNotificationHandler(
        'test-handler',
        mockNotificationHandler
      )

      const appError = createAppError(
        'Test notification error',
        ERROR_CODES.INVALID_TOKEN
      )

      await globalErrorHandler.handleError(appError, undefined, {
        showUserNotification: true
      })

      expect(mockNotificationHandler).toHaveBeenCalledWith(
        expect.stringContaining('ログインが必要です'),
        expect.objectContaining({
          type: 'toast'
        })
      )
    })

    it('ログハンドラーが正しく登録・実行される', async () => {
      const mockLogHandler = vi.fn()

      globalErrorHandler.registerLogHandler(
        'test-log-handler',
        mockLogHandler
      )

      const appError = createAppError(
        'Test log error',
        ERROR_CODES.CONNECTION_FAILED
      )

      await globalErrorHandler.handleError(appError)

      expect(mockLogHandler).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('[DB:3001]'),
        appError
      )
    })
  })

  describe('実用的なユースケース', () => {
    it('API呼び出しのエラーハンドリング', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(
        new Error('Network connection failed')
      )

      const result = await executeWithAutoRecovery(
        mockApiCall,
        ERROR_CODES.API_UNAVAILABLE,
        {
          source: 'api-client',
          context: { url: '/api/test', method: 'GET' }
        }
      )

      expect(result.success).toBe(false)
      expect(result.error?.category).toBe('EXTERNAL')
      expect(result.retryCount).toBeGreaterThan(0)
    })

    it('データベース操作のエラーハンドリング', async () => {
      const mockDbOperation = vi.fn()
        .mockRejectedValueOnce(new Error('connection timeout'))
        .mockRejectedValueOnce(new Error('connection timeout'))
        .mockResolvedValueOnce({ id: 1, name: 'success' })

      const result = await executeWithAutoRecovery(
        mockDbOperation,
        ERROR_CODES.QUERY_TIMEOUT,
        {
          source: 'database',
          context: { operation: 'SELECT * FROM users', table: 'users' }
        }
      )

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1, name: 'success' })
      expect(mockDbOperation).toHaveBeenCalledTimes(3)
    })
  })
})