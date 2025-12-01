/**
 * LoadingStates テスト
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LoadingButton, LoadingCard, LoadingOverlay, LoadingSpinner } from './LoadingStates'

// i18n モック
vi.mock('@/features/i18n/lib/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.loading.default': '読み込み中...',
        'errors.loading.title': '読み込み中',
        'errors.loading.loadingData': 'データを取得しています...',
        'errors.loading.loadFailed': 'データの読み込みに失敗しました',
        'errors.loading.retry': '再試行',
        'errors.loading.noData': 'データがありません',
        'errors.loading.loadingPage': 'ページを読み込み中',
        'errors.loading.pleaseWait': 'しばらくお待ちください',
      }
      return translations[key] ?? key
    },
    locale: 'ja',
  }),
}))

describe('LoadingSpinner', () => {
  it('デフォルトサイズでレンダリング', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('[role="status"]')).toBeInTheDocument()
  })

  it('カスタムサイズでレンダリング', () => {
    const { container } = render(<LoadingSpinner size="xl" />)
    const spinner = container.querySelector('[role="status"]')
    expect(spinner).toHaveClass('h-12', 'w-12')
  })
})

describe('LoadingOverlay', () => {
  it('ローディング時にオーバーレイを表示', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>コンテンツ</div>
      </LoadingOverlay>
    )

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('ローディング終了時は子要素のみ表示', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>コンテンツ</div>
      </LoadingOverlay>
    )

    expect(screen.getByText('コンテンツ')).toBeInTheDocument()
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
  })
})

describe('LoadingCard', () => {
  it('タイトルとメッセージを表示', () => {
    render(<LoadingCard title="読み込み中" message="データを取得しています..." />)

    expect(screen.getByText('読み込み中')).toBeInTheDocument()
    expect(screen.getByText('データを取得しています...')).toBeInTheDocument()
  })
})

describe('LoadingButton', () => {
  it('ローディング時は無効化されテキストが変わる', () => {
    render(
      <LoadingButton isLoading={true} loadingText="処理中...">
        送信
      </LoadingButton>
    )

    expect(screen.getByText('処理中...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('ローディング終了時は通常のボタン', () => {
    render(<LoadingButton isLoading={false}>送信</LoadingButton>)

    expect(screen.getByText('送信')).toBeInTheDocument()
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})
