import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as useInboxDataModule from '../hooks/useInboxData'
import * as useInboxBoardFilterStoreModule from '../stores/useInboxBoardFilterStore'
import { InboxBoardView } from './InboxBoardView'

// KanbanBoardとKanbanToolbarのモック
vi.mock('@/features/board', () => ({
  KanbanBoard: () => <div data-testid="kanban-board">Kanban Board</div>,
}))

vi.mock('@/features/board/components/KanbanToolbar', () => ({
  KanbanToolbar: () => <div data-testid="kanban-toolbar">Kanban Toolbar</div>,
}))

describe('InboxBoardView', () => {
  const mockFilters = {
    status: [],
    priority: [],
    tags: [],
    search: '',
    assignee: '',
    setStatus: vi.fn(),
    setPriority: vi.fn(),
    setTags: vi.fn(),
    setSearch: vi.fn(),
    setAssignee: vi.fn(),
    reset: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック
    vi.spyOn(useInboxBoardFilterStoreModule, 'useInboxBoardFilterStore').mockReturnValue(mockFilters)
    vi.spyOn(useInboxDataModule, 'useInboxData').mockReturnValue({
      items: [],
      tickets: [],
      sessions: [],
      isLoading: false,
      error: null,
    })
  })

  describe('基本レンダリング', () => {
    it('正常時にKanbanBoardとKanbanToolbarが表示される', () => {
      render(<InboxBoardView />)

      expect(screen.getByTestId('kanban-toolbar')).toBeInTheDocument()
      expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
    })

    it('role="tabpanel"とid="inbox-view-panel"が設定される', () => {
      render(<InboxBoardView />)

      const panel = screen.getByRole('tabpanel')
      expect(panel).toHaveAttribute('id', 'inbox-view-panel')
    })
  })

  describe('ローディング状態', () => {
    it('ローディング中はスピナーが表示される', () => {
      vi.spyOn(useInboxDataModule, 'useInboxData').mockReturnValue({
        items: [],
        tickets: [],
        sessions: [],
        isLoading: true,
        error: null,
      })

      render(<InboxBoardView />)

      expect(screen.getByText('読み込み中...')).toBeInTheDocument()
      expect(screen.queryByTestId('kanban-board')).not.toBeInTheDocument()
    })
  })

  describe('エラー状態', () => {
    it('エラー時はエラーメッセージが表示される', () => {
      const errorMessage = 'データ取得に失敗しました'
      const mockError = {
        message: errorMessage,
        shape: null,
        data: null,
      }
      vi.spyOn(useInboxDataModule, 'useInboxData').mockReturnValue({
        items: [],
        tickets: [],
        sessions: [],
        isLoading: false,
        error: mockError as any,
      })

      render(<InboxBoardView />)

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.queryByTestId('kanban-board')).not.toBeInTheDocument()
    })
  })

  describe('フィルタ連携', () => {
    it('useInboxBoardFilterStoreからフィルタを取得する', () => {
      const spy = vi.spyOn(useInboxBoardFilterStoreModule, 'useInboxBoardFilterStore')

      render(<InboxBoardView />)

      expect(spy).toHaveBeenCalled()
    })

    it('フィルタをuseInboxDataに渡す', () => {
      const filters = {
        ...mockFilters,
        status: ['open' as const],
        priority: ['high' as const],
        search: 'test query',
      }
      vi.spyOn(useInboxBoardFilterStoreModule, 'useInboxBoardFilterStore').mockReturnValue(filters)

      const dataSpy = vi.spyOn(useInboxDataModule, 'useInboxData')

      render(<InboxBoardView />)

      expect(dataSpy).toHaveBeenCalledWith({
        status: 'open',
        priority: 'high',
        search: 'test query',
      })
    })

    it('フィルタが空の場合はundefinedで渡す', () => {
      const dataSpy = vi.spyOn(useInboxDataModule, 'useInboxData')

      render(<InboxBoardView />)

      expect(dataSpy).toHaveBeenCalledWith({
        status: undefined,
        priority: undefined,
        search: '',
      })
    })
  })
})
