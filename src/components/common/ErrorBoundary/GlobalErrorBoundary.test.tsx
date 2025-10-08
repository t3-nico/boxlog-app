/**
 * GlobalErrorBoundary テスト
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GlobalErrorBoundary } from './GlobalErrorBoundary'

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
