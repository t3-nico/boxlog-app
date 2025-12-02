/**
 * GlobalErrorBoundary テスト
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GlobalErrorBoundary } from './GlobalErrorBoundary'

// i18n モック
vi.mock('@/features/i18n/lib/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.globalBoundary.title': 'システムエラーが発生しました',
        'errors.globalBoundary.errorId': 'エラーID',
        'errors.globalBoundary.severity': '重大度',
        'errors.globalBoundary.autoRecovering': '自動復旧中...',
        'errors.globalBoundary.pleaseWait': 'しばらくお待ちください',
        'errors.globalBoundary.retryCount': '再試行回数',
        'errors.globalBoundary.problemAndSolution': '問題と解決策',
        'errors.globalBoundary.category': 'カテゴリ',
        'errors.globalBoundary.system': 'システム',
        'errors.globalBoundary.autoRecovery': '自動復旧',
        'errors.globalBoundary.possible': '可能',
        'errors.globalBoundary.manualRequired': '手動対応が必要',
        'errors.globalBoundary.recommendedActions': '推奨アクション',
        'errors.globalBoundary.autoRecoverySystem': '自動復旧システム',
        'errors.globalBoundary.enabled': '有効',
        'errors.globalBoundary.disabled': '無効',
        'errors.globalBoundary.manualRetry': '手動再試行',
        'errors.globalBoundary.retriesLeft': '残り{{count}}回',
        'errors.globalBoundary.reloadPage': 'ページを再読み込み',
        'errors.globalBoundary.goHome': 'ホームに戻る',
        'errors.globalBoundary.technicalDetails': '技術詳細',
        'errors.globalBoundary.error': 'エラー',
        'errors.globalBoundary.analysisCode': '分析コード',
        'errors.globalBoundary.categoryLabel': 'カテゴリ',
        'errors.globalBoundary.recoverable': '復旧可能',
        'errors.globalBoundary.yes': 'はい',
        'errors.globalBoundary.no': 'いいえ',
        'errors.globalBoundary.stackTrace': 'スタックトレース',
      }
      return translations[key] ?? key
    },
    locale: 'ja',
  }),
}))

// エラーをスローするコンポーネント
const ThrowError = () => {
  throw new Error('Test error')
}

describe('GlobalErrorBoundary', () => {
  it('正常なコンポーネントをレンダリング', () => {
    render(
      <GlobalErrorBoundary>
        <div>正常なコンテンツ</div>
      </GlobalErrorBoundary>
    )

    expect(screen.getByText('正常なコンテンツ')).toBeInTheDocument()
  })

  it('エラー発生時にフォールバックUIを表示', () => {
    // console.errorのモック化（エラーログを抑制）
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <GlobalErrorBoundary>
        <ThrowError />
      </GlobalErrorBoundary>
    )

    expect(screen.getByText('システムエラーが発生しました')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('エラーIDが表示される', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <GlobalErrorBoundary>
        <ThrowError />
      </GlobalErrorBoundary>
    )

    expect(screen.getByText(/エラーID:/)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
