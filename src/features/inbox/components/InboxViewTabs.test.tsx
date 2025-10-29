import { fireEvent, render, screen } from '@testing-library/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InboxViewTabs } from './InboxViewTabs'

// Next.js navigation hooks のモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  useParams: vi.fn(),
}))

describe('InboxViewTabs', () => {
  const mockPush = vi.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    })
    ;(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockSearchParams)
    ;(useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      locale: 'ja',
    })
  })

  describe('基本レンダリング', () => {
    it('タブが正しく表示される', () => {
      render(<InboxViewTabs />)

      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Board' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Table' })).toBeInTheDocument()
    })

    it('aria属性が正しく設定される', () => {
      render(<InboxViewTabs />)

      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Inbox view selector')

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      const tableTab = screen.getByRole('tab', { name: 'Table' })

      expect(boardTab).toHaveAttribute('aria-controls', 'inbox-view-panel')
      expect(tableTab).toHaveAttribute('aria-controls', 'inbox-view-panel')
    })
  })

  describe('デフォルトビュー', () => {
    it('パラメータがない場合、Boardがアクティブになる', () => {
      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      const tableTab = screen.getByRole('tab', { name: 'Table' })

      expect(boardTab).toHaveAttribute('aria-selected', 'true')
      expect(tableTab).toHaveAttribute('aria-selected', 'false')
    })

    it('view=board の場合、Boardがアクティブになる', () => {
      const params = new URLSearchParams('view=board')
      ;(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(params)

      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      const tableTab = screen.getByRole('tab', { name: 'Table' })

      expect(boardTab).toHaveAttribute('aria-selected', 'true')
      expect(tableTab).toHaveAttribute('aria-selected', 'false')
    })

    it('view=table の場合、Tableがアクティブになる', () => {
      const params = new URLSearchParams('view=table')
      ;(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(params)

      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      const tableTab = screen.getByRole('tab', { name: 'Table' })

      expect(boardTab).toHaveAttribute('aria-selected', 'false')
      expect(tableTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('タブ切り替え', () => {
    it('Boardタブクリックで /ja/inbox?view=board に遷移する', () => {
      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      fireEvent.click(boardTab)

      expect(mockPush).toHaveBeenCalledWith('/ja/inbox?view=board')
    })

    it('Tableタブクリックで /ja/inbox?view=table に遷移する', () => {
      render(<InboxViewTabs />)

      const tableTab = screen.getByRole('tab', { name: 'Table' })
      fireEvent.click(tableTab)

      expect(mockPush).toHaveBeenCalledWith('/ja/inbox?view=table')
    })

    it('既存のクエリパラメータを保持する', () => {
      const params = new URLSearchParams('filter=active&sort=date')
      ;(useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(params)

      render(<InboxViewTabs />)

      const tableTab = screen.getByRole('tab', { name: 'Table' })
      fireEvent.click(tableTab)

      expect(mockPush).toHaveBeenCalledWith('/ja/inbox?filter=active&sort=date&view=table')
    })
  })

  describe('アクセシビリティ', () => {
    it('キーボードフォーカスが可能', () => {
      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      boardTab.focus()

      expect(document.activeElement).toBe(boardTab)
    })

    it('フォーカス時にring表示のためのクラスが設定される', () => {
      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      expect(boardTab.className).toContain('focus-visible:ring-2')
    })
  })

  describe('スタイリング', () => {
    it('アクティブなタブに正しいスタイルが適用される（アンダーラインデザイン）', () => {
      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      expect(boardTab.className).toContain('border-primary') // アクティブ時はプライマリカラーのボーダー
      expect(boardTab.className).toContain('text-foreground')
    })

    it('非アクティブなタブに正しいスタイルが適用される', () => {
      render(<InboxViewTabs />)

      const tableTab = screen.getByRole('tab', { name: 'Table' })
      expect(tableTab.className).toContain('border-transparent') // 非アクティブ時は透明ボーダー
      expect(tableTab.className).toContain('text-muted-foreground')
      expect(tableTab.className).toContain('hover:text-foreground')
    })
  })
})
