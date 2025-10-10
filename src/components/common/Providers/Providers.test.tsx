/**
 * Providers テスト
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Providers } from './Providers'

// 必要なモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    prefetch: vi.fn(),
  }),
}))

vi.mock('@/contexts/chat-context', () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Providers', () => {
  it('子要素を正しくレンダリング', () => {
    render(
      <Providers>
        <div>テストコンテンツ</div>
      </Providers>
    )

    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument()
  })

  it('複数のプロバイダーで子要素をラップ', () => {
    const { container } = render(
      <Providers>
        <div data-testid="content">ネストされたコンテンツ</div>
      </Providers>
    )

    // QueryClientProvider, AuthProvider がネストされていることを確認
    expect(container.querySelector('[data-testid="content"]')).toBeInTheDocument()
  })
})
