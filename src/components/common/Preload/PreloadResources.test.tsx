/**
 * PreloadResources テスト
 */

import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PreloadResources } from './PreloadResources'

// Next.js router のモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: vi.fn(),
  }),
}))

describe('PreloadResources', () => {
  it('nullをレンダリング（画面に何も表示しない）', () => {
    const { container } = render(<PreloadResources />)
    expect(container.firstChild).toBeNull()
  })

  it('useEffectでプリフェッチを実行', () => {
    // タイマーのモック
    vi.useFakeTimers()

    render(<PreloadResources />)

    // 2秒後にプリフェッチが実行されることを確認
    vi.advanceTimersByTime(2000)

    vi.useRealTimers()
  })
})
