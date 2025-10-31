import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  DragEvent,
  KanbanBoard,
  KanbanCard,
  KanbanCardInput,
  KanbanCardUpdate,
  KanbanColumn,
  KanbanFilter,
  KanbanSort,
  KanbanStatus,
} from '../types'

/**
 * LocalStorage保存用（Date → string変換後）
 */
interface KanbanCardForStorage extends Omit<KanbanCard, 'createdAt' | 'updatedAt' | 'dueDate'> {
  createdAt: string
  updatedAt: string
  dueDate?: string
}

interface KanbanBoardForStorage extends Omit<KanbanBoard, 'createdAt' | 'updatedAt' | 'columns'> {
  createdAt: string
  updatedAt: string
  columns: Array<Omit<KanbanColumn, 'cards'> & { cards: KanbanCardForStorage[] }>
}

interface KanbanStoreState {
  boards: KanbanBoard[]
  activeBoard: KanbanBoard | null
  selectedCard: KanbanCard | null
  filter: KanbanFilter
  sort: KanbanSort
  isLoading: boolean
}

interface KanbanStore extends KanbanStoreState {
  // Board operations
  setActiveBoard: (boardId: string) => void
  createBoard: (name: string, description?: string) => KanbanBoard
  updateBoard: (boardId: string, updates: Partial<Omit<KanbanBoard, 'id' | 'columns'>>) => void
  deleteBoard: (boardId: string) => void

  // Card operations
  moveCard: (event: DragEvent) => void
  addCard: (columnId: string, card: KanbanCardInput) => KanbanCard
  updateCard: (cardId: string, updates: KanbanCardUpdate) => void
  deleteCard: (cardId: string) => void
  selectCard: (cardId: string | null) => void

  // Query operations
  getCardsByStatus: (status: KanbanStatus) => KanbanCard[]
  getCardsByColumn: (columnId: string) => KanbanCard[]
  getAllCards: () => KanbanCard[]

  // Filter & Sort
  setFilter: (filter: Partial<KanbanFilter>) => void
  clearFilter: () => void
  setSort: (sort: KanbanSort) => void

  // Utility
  clearAllData: () => void
  setLoading: (isLoading: boolean) => void
}

// ユーティリティ関数
function generateId(): string {
  return crypto.randomUUID()
}

function createDefaultColumns(): KanbanColumn[] {
  return [
    {
      id: generateId(),
      title: 'To Do',
      status: 'todo',
      cards: [],
      order: 0,
      wipLimit: undefined, // To Doは制限なし
      definitionOfDone: ['タスクの詳細が明確', '担当者が決定', '優先度が設定済み'],
      color: 'gray',
    },
    {
      id: generateId(),
      title: 'In Progress',
      status: 'in_progress',
      cards: [],
      order: 1,
      wipLimit: 3, // 同時進行は3つまで（ベストプラクティス）
      definitionOfDone: ['作業完了', 'テスト実施', 'レビュー完了'],
      color: 'blue',
    },
    {
      id: generateId(),
      title: 'Done',
      status: 'done',
      cards: [],
      order: 2,
      wipLimit: undefined, // Doneは制限なし
      definitionOfDone: ['全ての要件を満たす', 'ステークホルダーの承認'],
      color: 'green',
    },
  ]
}

// デフォルトボードを作成
function createDefaultBoard(): KanbanBoard {
  const now = new Date()
  return {
    id: generateId(),
    name: 'マイボード',
    description: 'タスクを視覚的に管理',
    columns: createDefaultColumns(),
    createdAt: now,
    updatedAt: now,
  }
}

// 初期状態（デフォルトボード作成済み）
const defaultBoard = createDefaultBoard()
const initialState: KanbanStoreState = {
  boards: [defaultBoard],
  activeBoard: defaultBoard,
  selectedCard: null,
  filter: {},
  sort: {
    key: 'createdAt',
    order: 'desc',
  },
  isLoading: false,
}

export const useKanbanStore = create<KanbanStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Board operations
        setActiveBoard: (boardId: string) => {
          const board = get().boards.find((b) => b.id === boardId)
          set({ activeBoard: board || null })
        },

        createBoard: (name: string, description?: string) => {
          const now = new Date()
          const newBoard: KanbanBoard = {
            id: generateId(),
            name,
            description,
            columns: createDefaultColumns(),
            createdAt: now,
            updatedAt: now,
          }

          set((state) => ({
            boards: [...state.boards, newBoard],
            activeBoard: newBoard,
          }))

          return newBoard
        },

        updateBoard: (boardId: string, updates: Partial<Omit<KanbanBoard, 'id' | 'columns'>>) => {
          set((state) => ({
            boards: state.boards.map((board) =>
              board.id === boardId ? { ...board, ...updates, updatedAt: new Date() } : board
            ),
            activeBoard:
              state.activeBoard?.id === boardId
                ? { ...state.activeBoard, ...updates, updatedAt: new Date() }
                : state.activeBoard,
          }))
        },

        deleteBoard: (boardId: string) => {
          set((state) => ({
            boards: state.boards.filter((board) => board.id !== boardId),
            activeBoard: state.activeBoard?.id === boardId ? null : state.activeBoard,
          }))
        },

        // Card operations
        moveCard: (event: DragEvent) => {
          set((state) => {
            if (!state.activeBoard) return state

            const sourceColumn = state.activeBoard.columns.find((col) => col.id === event.sourceColumnId)
            const targetColumn = state.activeBoard.columns.find((col) => col.id === event.targetColumnId)

            if (!sourceColumn || !targetColumn) return state

            // カードを移動
            const [movedCard] = sourceColumn.cards.splice(event.sourceIndex, 1)
            const now = new Date()

            // ステータス変更時のサイクルタイム・リードタイム計測
            if (movedCard.status !== targetColumn.status) {
              // In Progressに移動した場合、startedAtを記録
              if (targetColumn.status === 'in_progress' && !movedCard.startedAt) {
                movedCard.startedAt = now
              }
              // Doneに移動した場合、completedAtを記録
              if (targetColumn.status === 'done' && !movedCard.completedAt) {
                movedCard.completedAt = now
              }
            }

            movedCard.status = targetColumn.status
            movedCard.updatedAt = now
            targetColumn.cards.splice(event.targetIndex, 0, movedCard)

            return {
              activeBoard: { ...state.activeBoard, updatedAt: new Date() },
              boards: state.boards.map((board) =>
                board.id === state.activeBoard?.id ? { ...state.activeBoard, updatedAt: new Date() } : board
              ),
            }
          })
        },

        addCard: (columnId: string, cardInput: KanbanCardInput) => {
          const now = new Date()
          const newCard: KanbanCard = {
            ...cardInput,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          }

          set((state) => {
            if (!state.activeBoard) return state

            const column = state.activeBoard.columns.find((col) => col.id === columnId)
            if (!column) return state

            column.cards.push(newCard)

            return {
              activeBoard: { ...state.activeBoard, updatedAt: new Date() },
              boards: state.boards.map((board) =>
                board.id === state.activeBoard?.id ? { ...state.activeBoard, updatedAt: new Date() } : board
              ),
            }
          })

          return newCard
        },

        updateCard: (cardId: string, updates: KanbanCardUpdate) => {
          set((state) => {
            if (!state.activeBoard) return state

            for (const column of state.activeBoard.columns) {
              const cardIndex = column.cards.findIndex((c) => c.id === cardId)
              if (cardIndex !== -1) {
                column.cards[cardIndex] = {
                  ...column.cards[cardIndex],
                  ...updates,
                  updatedAt: new Date(),
                }
                break
              }
            }

            return {
              activeBoard: { ...state.activeBoard, updatedAt: new Date() },
              boards: state.boards.map((board) =>
                board.id === state.activeBoard?.id ? { ...state.activeBoard, updatedAt: new Date() } : board
              ),
              selectedCard:
                state.selectedCard?.id === cardId
                  ? { ...state.selectedCard, ...updates, updatedAt: new Date() }
                  : state.selectedCard,
            }
          })
        },

        deleteCard: (cardId: string) => {
          set((state) => {
            if (!state.activeBoard) return state

            for (const column of state.activeBoard.columns) {
              column.cards = column.cards.filter((c) => c.id !== cardId)
            }

            return {
              activeBoard: { ...state.activeBoard, updatedAt: new Date() },
              boards: state.boards.map((board) =>
                board.id === state.activeBoard?.id ? { ...state.activeBoard, updatedAt: new Date() } : board
              ),
              selectedCard: state.selectedCard?.id === cardId ? null : state.selectedCard,
            }
          })
        },

        selectCard: (cardId: string | null) => {
          if (!cardId) {
            set({ selectedCard: null })
            return
          }

          const card = get()
            .activeBoard?.columns.flatMap((col) => col.cards)
            .find((c) => c.id === cardId)

          set({ selectedCard: card || null })
        },

        // Query operations
        getCardsByStatus: (status: KanbanStatus) => {
          const cards = get().activeBoard?.columns.flatMap((col) => col.cards) || []
          return cards.filter((card) => card.status === status)
        },

        getCardsByColumn: (columnId: string) => {
          const column = get().activeBoard?.columns.find((col) => col.id === columnId)
          return column?.cards || []
        },

        getAllCards: () => {
          return get().activeBoard?.columns.flatMap((col) => col.cards) || []
        },

        // Filter & Sort
        setFilter: (filter: Partial<KanbanFilter>) => {
          set((state) => ({
            filter: { ...state.filter, ...filter },
          }))
        },

        clearFilter: () => {
          set({ filter: {} })
        },

        setSort: (sort: KanbanSort) => {
          set({ sort })
        },

        // Utility
        clearAllData: () => {
          set(initialState)
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading })
        },
      }),
      {
        name: 'kanban-storage',
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name)
            if (!str) return null
            const { state } = JSON.parse(str) as {
              state: Omit<KanbanStoreState, 'boards'> & { boards: KanbanBoardForStorage[] }
            }

            return {
              state: {
                ...state,
                boards: state.boards.map((board) => ({
                  ...board,
                  createdAt: new Date(board.createdAt),
                  updatedAt: new Date(board.updatedAt),
                  columns: board.columns.map((col) => ({
                    ...col,
                    cards: col.cards.map((card) => ({
                      ...card,
                      createdAt: new Date(card.createdAt),
                      updatedAt: new Date(card.updatedAt),
                      dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
                    })),
                  })),
                })),
                activeBoard: state.activeBoard
                  ? {
                      ...state.activeBoard,
                      createdAt: new Date((state.activeBoard as unknown as KanbanBoardForStorage).createdAt),
                      updatedAt: new Date((state.activeBoard as unknown as KanbanBoardForStorage).updatedAt),
                      columns: (state.activeBoard as unknown as KanbanBoardForStorage).columns.map((col) => ({
                        ...col,
                        cards: col.cards.map((card) => ({
                          ...card,
                          createdAt: new Date(card.createdAt),
                          updatedAt: new Date(card.updatedAt),
                          dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
                        })),
                      })),
                    }
                  : null,
                selectedCard: state.selectedCard
                  ? {
                      ...state.selectedCard,
                      createdAt: new Date((state.selectedCard as unknown as KanbanCardForStorage).createdAt),
                      updatedAt: new Date((state.selectedCard as unknown as KanbanCardForStorage).updatedAt),
                      dueDate: (state.selectedCard as unknown as KanbanCardForStorage).dueDate
                        ? new Date((state.selectedCard as unknown as KanbanCardForStorage).dueDate as string)
                        : undefined,
                    }
                  : null,
              },
            }
          },
          setItem: (name, value) => {
            const { state } = value as { state: KanbanStoreState }
            const str = JSON.stringify({
              state: {
                ...state,
                boards: state.boards.map((board) => ({
                  ...board,
                  createdAt: board.createdAt.toISOString(),
                  updatedAt: board.updatedAt.toISOString(),
                  columns: board.columns.map((col) => ({
                    ...col,
                    cards: col.cards.map((card) => ({
                      ...card,
                      createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
                      updatedAt: card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
                      dueDate: card.dueDate instanceof Date ? card.dueDate.toISOString() : card.dueDate,
                      startTime: card.startTime instanceof Date ? card.startTime.toISOString() : card.startTime,
                      endTime: card.endTime instanceof Date ? card.endTime.toISOString() : card.endTime,
                    })),
                  })),
                })),
                activeBoard: state.activeBoard
                  ? {
                      ...state.activeBoard,
                      createdAt: state.activeBoard.createdAt.toISOString(),
                      updatedAt: state.activeBoard.updatedAt.toISOString(),
                      columns: state.activeBoard.columns.map((col) => ({
                        ...col,
                        cards: col.cards.map((card) => ({
                          ...card,
                          createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
                          updatedAt: card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
                          dueDate: card.dueDate instanceof Date ? card.dueDate.toISOString() : card.dueDate,
                          startTime: card.startTime instanceof Date ? card.startTime.toISOString() : card.startTime,
                          endTime: card.endTime instanceof Date ? card.endTime.toISOString() : card.endTime,
                        })),
                      })),
                    }
                  : null,
                selectedCard: state.selectedCard
                  ? {
                      ...state.selectedCard,
                      createdAt:
                        state.selectedCard.createdAt instanceof Date
                          ? state.selectedCard.createdAt.toISOString()
                          : state.selectedCard.createdAt,
                      updatedAt:
                        state.selectedCard.updatedAt instanceof Date
                          ? state.selectedCard.updatedAt.toISOString()
                          : state.selectedCard.updatedAt,
                      dueDate:
                        state.selectedCard.dueDate instanceof Date
                          ? state.selectedCard.dueDate.toISOString()
                          : state.selectedCard.dueDate,
                      startTime:
                        state.selectedCard.startTime instanceof Date
                          ? state.selectedCard.startTime.toISOString()
                          : state.selectedCard.startTime,
                      endTime:
                        state.selectedCard.endTime instanceof Date
                          ? state.selectedCard.endTime.toISOString()
                          : state.selectedCard.endTime,
                    }
                  : null,
              },
            })
            localStorage.setItem(name, str)
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    ),
    { name: 'KanbanStore' }
  )
)
