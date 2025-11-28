import { fireEvent, render, screen } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { InboxViewTabs } from './InboxViewTabs'

// Next.js navigation hooks のモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}))

// Zustand store のモック
const mockSetActiveView = vi.fn()
const mockDeleteView = vi.fn()
const mockCreateView = vi.fn()

const defaultViews = [
  {
    id: 'default-board',
    name: 'Board',
    type: 'board' as const,
    filters: {},
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-table',
    name: 'Table',
    type: 'table' as const,
    filters: {},
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

vi.mock('../stores/useInboxViewStore', () => ({
  useInboxViewStore: vi.fn(() => ({
    views: defaultViews,
    activeViewId: 'default-board',
    setActiveView: mockSetActiveView,
    deleteView: mockDeleteView,
    createView: mockCreateView,
  })),
}))

describe('InboxViewTabs', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    })
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

    it('activeViewId=default-board の場合、Boardがアクティブになる', () => {
      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      const tableTab = screen.getByRole('tab', { name: 'Table' })

      expect(boardTab).toHaveAttribute('aria-selected', 'true')
      expect(tableTab).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('タブ切り替え', () => {
    it('Boardタブクリックで /ja/inbox?view=default-board に遷移する', () => {
      render(<InboxViewTabs />)

      const boardTab = screen.getByRole('tab', { name: 'Board' })
      fireEvent.click(boardTab)

      expect(mockSetActiveView).toHaveBeenCalledWith('default-board')
      expect(mockPush).toHaveBeenCalledWith('/ja/inbox?view=default-board')
    })

    it('Tableタブクリックで /ja/inbox?view=default-table に遷移する', () => {
      render(<InboxViewTabs />)

      const tableTab = screen.getByRole('tab', { name: 'Table' })
      fireEvent.click(tableTab)

      expect(mockSetActiveView).toHaveBeenCalledWith('default-table')
      expect(mockPush).toHaveBeenCalledWith('/ja/inbox?view=default-table')
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
      expect(tableTab.className).toContain('hover:border-primary/50') // M3: テキスト色変更なし、ボーダーのみ
    })
  })
})
