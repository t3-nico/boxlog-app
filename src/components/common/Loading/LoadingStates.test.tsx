/**
 * LoadingStates テスト
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoadingButton, LoadingCard, LoadingOverlay, LoadingSpinner } from './LoadingStates'

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
