import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { KanbanCardInput } from '../types'

import { useKanbanStore } from './useKanbanStore'

describe('useKanbanStore', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      useKanbanStore.getState().clearAllData()
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('初期状態', () => {
    it('デフォルトボードが存在する', () => {
      const { boards, activeBoard } = useKanbanStore.getState()
      expect(boards.length).toBe(1)
      expect(activeBoard).not.toBeNull()
      expect(activeBoard?.name).toBe('マイボード')
    })

    it('デフォルトで3つのカラムがある', () => {
      const { activeBoard } = useKanbanStore.getState()
      expect(activeBoard?.columns.length).toBe(3)

      const statuses = activeBoard?.columns.map((col) => col.status)
      expect(statuses).toContain('todo')
      expect(statuses).toContain('in_progress')
      expect(statuses).toContain('done')
    })

    it('初期状態でカードは空', () => {
      const { activeBoard } = useKanbanStore.getState()
      activeBoard?.columns.forEach((col) => {
        expect(col.cards.length).toBe(0)
      })
    })

    it('selectedCardはnull', () => {
      const { selectedCard } = useKanbanStore.getState()
      expect(selectedCard).toBeNull()
    })

    it('filterは空オブジェクト', () => {
      const { filter } = useKanbanStore.getState()
      expect(filter).toEqual({})
    })
  })

  describe('Board操作', () => {
    it('新しいボードを作成できる', () => {
      act(() => {
        useKanbanStore.getState().createBoard('新規ボード', '説明テキスト')
      })

      const { boards, activeBoard } = useKanbanStore.getState()
      expect(boards.length).toBe(2)
      expect(activeBoard?.name).toBe('新規ボード')
      expect(activeBoard?.description).toBe('説明テキスト')
    })

    it('ボードを更新できる', () => {
      const { activeBoard } = useKanbanStore.getState()
      const boardId = activeBoard!.id

      act(() => {
        useKanbanStore.getState().updateBoard(boardId, { name: '更新後の名前' })
      })

      const updated = useKanbanStore.getState().activeBoard
      expect(updated?.name).toBe('更新後の名前')
    })

    it('ボードを削除できる', () => {
      // 2つ目のボードを作成
      act(() => {
        useKanbanStore.getState().createBoard('削除用ボード')
      })

      const boardIdToDelete = useKanbanStore.getState().activeBoard!.id

      act(() => {
        useKanbanStore.getState().deleteBoard(boardIdToDelete)
      })

      const { boards, activeBoard } = useKanbanStore.getState()
      expect(boards.length).toBe(1)
      expect(activeBoard).toBeNull() // アクティブボードが削除された
    })

    it('アクティブボードを切り替えできる', () => {
      act(() => {
        useKanbanStore.getState().createBoard('ボード2')
      })

      const { boards } = useKanbanStore.getState()
      const firstBoardId = boards[0]!.id

      act(() => {
        useKanbanStore.getState().setActiveBoard(firstBoardId)
      })

      const { activeBoard } = useKanbanStore.getState()
      expect(activeBoard?.name).toBe('マイボード')
    })
  })

  describe('Card操作', () => {
    it('カードを追加できる', () => {
      const { activeBoard } = useKanbanStore.getState()
      const todoColumnId = activeBoard!.columns.find((col) => col.status === 'todo')!.id

      const cardInput: KanbanCardInput = {
        title: 'テストカード',
        description: 'テスト説明',
        status: 'todo',
        priority: 'medium',
        tags: [],
        isBlocked: false,
      }

      act(() => {
        useKanbanStore.getState().addCard(todoColumnId, cardInput)
      })

      const updatedBoard = useKanbanStore.getState().activeBoard
      const todoColumn = updatedBoard?.columns.find((col) => col.status === 'todo')
      expect(todoColumn?.cards.length).toBe(1)
      expect(todoColumn?.cards[0]?.title).toBe('テストカード')
    })

    it('カードを更新できる', () => {
      const { activeBoard } = useKanbanStore.getState()
      const todoColumnId = activeBoard!.columns.find((col) => col.status === 'todo')!.id

      // カードを追加
      let cardId: string = ''
      act(() => {
        const card = useKanbanStore.getState().addCard(todoColumnId, {
          title: '元のタイトル',
          status: 'todo',
          priority: 'low',
          tags: [],
          isBlocked: false,
        })
        cardId = card.id
      })

      // カードを更新
      act(() => {
        useKanbanStore.getState().updateCard(cardId, { title: '更新後のタイトル' })
      })

      const updatedBoard = useKanbanStore.getState().activeBoard
      const card = updatedBoard?.columns.flatMap((col) => col.cards).find((c) => c.id === cardId)
      expect(card?.title).toBe('更新後のタイトル')
    })

    it('カードを削除できる', () => {
      const { activeBoard } = useKanbanStore.getState()
      const todoColumnId = activeBoard!.columns.find((col) => col.status === 'todo')!.id

      // カードを追加
      let cardId: string = ''
      act(() => {
        const card = useKanbanStore.getState().addCard(todoColumnId, {
          title: '削除対象',
          status: 'todo',
          priority: 'medium',
          tags: [],
          isBlocked: false,
        })
        cardId = card.id
      })

      // カードを削除
      act(() => {
        useKanbanStore.getState().deleteCard(cardId)
      })

      const updatedBoard = useKanbanStore.getState().activeBoard
      const todoColumn = updatedBoard?.columns.find((col) => col.status === 'todo')
      expect(todoColumn?.cards.length).toBe(0)
    })

    it('カードを選択できる', () => {
      const { activeBoard } = useKanbanStore.getState()
      const todoColumnId = activeBoard!.columns.find((col) => col.status === 'todo')!.id

      // カードを追加
      let cardId: string = ''
      act(() => {
        const card = useKanbanStore.getState().addCard(todoColumnId, {
          title: '選択対象',
          status: 'todo',
          priority: 'high',
          tags: [],
          isBlocked: false,
        })
        cardId = card.id
      })

      // カードを選択
      act(() => {
        useKanbanStore.getState().selectCard(cardId)
      })

      const { selectedCard } = useKanbanStore.getState()
      expect(selectedCard?.id).toBe(cardId)
      expect(selectedCard?.title).toBe('選択対象')
    })

    it('選択を解除できる', () => {
      const { activeBoard } = useKanbanStore.getState()
      const todoColumnId = activeBoard!.columns.find((col) => col.status === 'todo')!.id

      // カードを追加して選択
      act(() => {
        const card = useKanbanStore.getState().addCard(todoColumnId, {
          title: 'テスト',
          status: 'todo',
          priority: 'medium',
          tags: [],
          isBlocked: false,
        })
        useKanbanStore.getState().selectCard(card.id)
      })

      expect(useKanbanStore.getState().selectedCard).not.toBeNull()

      // 選択解除
      act(() => {
        useKanbanStore.getState().selectCard(null)
      })

      expect(useKanbanStore.getState().selectedCard).toBeNull()
    })
  })

  describe('クエリ操作', () => {
    beforeEach(() => {
      const { activeBoard } = useKanbanStore.getState()
      const todoColumnId = activeBoard!.columns.find((col) => col.status === 'todo')!.id
      const doingColumnId = activeBoard!.columns.find((col) => col.status === 'in_progress')!.id

      // テストデータを追加
      act(() => {
        useKanbanStore.getState().addCard(todoColumnId, {
          title: 'Todo 1',
          status: 'todo',
          priority: 'high',
          tags: [],
          isBlocked: false,
        })
        useKanbanStore.getState().addCard(todoColumnId, {
          title: 'Todo 2',
          status: 'todo',
          priority: 'low',
          tags: [],
          isBlocked: false,
        })
        useKanbanStore.getState().addCard(doingColumnId, {
          title: 'Doing 1',
          status: 'in_progress',
          priority: 'medium',
          tags: [],
          isBlocked: false,
        })
      })
    })

    it('ステータスでカードを取得できる', () => {
      const todoCards = useKanbanStore.getState().getCardsByStatus('todo')
      expect(todoCards.length).toBe(2)

      const doingCards = useKanbanStore.getState().getCardsByStatus('in_progress')
      expect(doingCards.length).toBe(1)

      const doneCards = useKanbanStore.getState().getCardsByStatus('done')
      expect(doneCards.length).toBe(0)
    })

    it('全カードを取得できる', () => {
      const allCards = useKanbanStore.getState().getAllCards()
      expect(allCards.length).toBe(3)
    })

    it('カラムIDでカードを取得できる', () => {
      const { activeBoard } = useKanbanStore.getState()
      const todoColumnId = activeBoard!.columns.find((col) => col.status === 'todo')!.id

      const cards = useKanbanStore.getState().getCardsByColumn(todoColumnId)
      expect(cards.length).toBe(2)
    })
  })

  describe('フィルター&ソート', () => {
    it('フィルターを設定できる', () => {
      act(() => {
        useKanbanStore.getState().setFilter({ priority: 'high' })
      })

      const { filter } = useKanbanStore.getState()
      expect(filter.priority).toBe('high')
    })

    it('フィルターを追加できる', () => {
      act(() => {
        useKanbanStore.getState().setFilter({ priority: 'high' })
        useKanbanStore.getState().setFilter({ search: 'test' })
      })

      const { filter } = useKanbanStore.getState()
      expect(filter.priority).toBe('high')
      expect(filter.search).toBe('test')
    })

    it('フィルターをクリアできる', () => {
      act(() => {
        useKanbanStore.getState().setFilter({ priority: 'high', search: 'test' })
        useKanbanStore.getState().clearFilter()
      })

      const { filter } = useKanbanStore.getState()
      expect(filter).toEqual({})
    })

    it('ソートを設定できる', () => {
      act(() => {
        useKanbanStore.getState().setSort({ key: 'title', order: 'asc' })
      })

      const { sort } = useKanbanStore.getState()
      expect(sort.key).toBe('title')
      expect(sort.order).toBe('asc')
    })
  })

  describe('ユーティリティ', () => {
    it('全データをクリアできる', () => {
      // データを追加
      act(() => {
        useKanbanStore.getState().createBoard('追加ボード')
      })

      expect(useKanbanStore.getState().boards.length).toBe(2)

      // クリア
      act(() => {
        useKanbanStore.getState().clearAllData()
      })

      // 初期状態に戻る
      const { boards, activeBoard } = useKanbanStore.getState()
      expect(boards.length).toBe(1)
      expect(activeBoard?.name).toBe('マイボード')
    })

    it('ローディング状態を設定できる', () => {
      expect(useKanbanStore.getState().isLoading).toBe(false)

      act(() => {
        useKanbanStore.getState().setLoading(true)
      })

      expect(useKanbanStore.getState().isLoading).toBe(true)

      act(() => {
        useKanbanStore.getState().setLoading(false)
      })

      expect(useKanbanStore.getState().isLoading).toBe(false)
    })
  })

  describe('デフォルトカラム設定', () => {
    it('To DoカラムはWIP制限なし', () => {
      const { activeBoard } = useKanbanStore.getState()
      const todoColumn = activeBoard?.columns.find((col) => col.status === 'todo')
      expect(todoColumn?.wipLimit).toBeUndefined()
    })

    it('In ProgressカラムはWIP制限3', () => {
      const { activeBoard } = useKanbanStore.getState()
      const doingColumn = activeBoard?.columns.find((col) => col.status === 'in_progress')
      expect(doingColumn?.wipLimit).toBe(3)
    })

    it('各カラムにDefinition of Doneが設定されている', () => {
      const { activeBoard } = useKanbanStore.getState()
      activeBoard?.columns.forEach((col) => {
        expect(col.definitionOfDone).toBeDefined()
        expect(col.definitionOfDone!.length).toBeGreaterThan(0)
      })
    })
  })
})
