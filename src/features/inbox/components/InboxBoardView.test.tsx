import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as useInboxDataModule from '../hooks/useInboxData'
import * as useInboxFilterStoreModule from '../stores/useInboxFilterStore'
import { InboxBoardView } from './InboxBoardView'

// KanbanBoardとInboxBoardToolbarのモック
vi.mock('@/features/board', () => ({
  KanbanBoard: () => <div data-testid="kanban-board">Kanban Board</div>,
}))

vi.mock('./board/InboxBoardToolbar', () => ({
  InboxBoardToolbar: () => <div data-testid="inbox-board-toolbar">Inbox Board Toolbar</div>,
}))

describe('InboxBoardView', () => {
  const mockFilters = {
    status: [],
    priority: [],
    tags: [],
    search: '',
    assignee: '',
    dueDate: 'all' as const,
    setStatus: vi.fn(),
    setPriority: vi.fn(),
    setTags: vi.fn(),
    setSearch: vi.fn(),
    setAssignee: vi.fn(),
    setDueDate: vi.fn(),
    reset: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック
    vi.spyOn(useInboxFilterStoreModule, 'useInboxFilterStore').mockReturnValue(mockFilters)
    vi.spyOn(useInboxDataModule, 'useInboxData').mockReturnValue({
      items: [],
      plans: [],
      isLoading: false,
      error: null,
    })
  })

  describe('基本レンダリング', () => {
    it('正常時にKanbanBoardとInboxBoardToolbarが表示される', () => {
      render(<InboxBoardView />)

      expect(screen.getByTestId('inbox-board-toolbar')).toBeInTheDocument()
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
        plans: [],
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
      // TRPCClientErrorBaseをモック（unknown経由でキャスト）
      const mockError = {
        message: errorMessage,
        shape: {
          message: errorMessage,
          code: -32600,
          data: {
            stack: undefined,
            code: 'INTERNAL_SERVER_ERROR' as const,
            httpStatus: 500,
          },
        },
        data: {
          stack: undefined,
          code: 'INTERNAL_SERVER_ERROR' as const,
          httpStatus: 500,
        },
        name: 'TRPCClientError',
      }
      vi.spyOn(useInboxDataModule, 'useInboxData').mockReturnValue({
        items: [],
        plans: [],
        isLoading: false,
        error: mockError as unknown as ReturnType<typeof useInboxDataModule.useInboxData>['error'],
      })

      render(<InboxBoardView />)

      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.queryByTestId('kanban-board')).not.toBeInTheDocument()
    })
  })

  describe('フィルタ連携', () => {
    it('useInboxFilterStoreからフィルタを取得する', () => {
      const spy = vi.spyOn(useInboxFilterStoreModule, 'useInboxFilterStore')

      render(<InboxBoardView />)

      expect(spy).toHaveBeenCalled()
    })

    it('フィルタをuseInboxDataに渡す', () => {
      const filters = {
        ...mockFilters,
        status: ['open' as const],
        priority: ['high' as const],
        search: 'test query',
        tags: ['tag1'],
        dueDate: 'today' as const,
      }
      vi.spyOn(useInboxFilterStoreModule, 'useInboxFilterStore').mockReturnValue(filters)

      const dataSpy = vi.spyOn(useInboxDataModule, 'useInboxData')

      render(<InboxBoardView />)

      expect(dataSpy).toHaveBeenCalledWith({
        status: 'open',
        search: 'test query',
        tags: ['tag1'],
        dueDate: 'today',
      })
    })

    it('フィルタが空の場合はundefinedで渡す', () => {
      const dataSpy = vi.spyOn(useInboxDataModule, 'useInboxData')

      render(<InboxBoardView />)

      expect(dataSpy).toHaveBeenCalledWith({
        status: undefined,
        search: '',
        tags: [],
        dueDate: 'all',
      })
    })
  })
})
