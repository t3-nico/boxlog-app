'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { DeletedItem, TrashStats, TrashState } from '@/types/trash'

// 30日間をミリ秒で表現
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export const useTrashStore = create<TrashState>()(
  persist(
    (set, get) => ({
      deletedItems: [],
      loading: false,

      moveToTrash: async (item: unknown, type: DeletedItem['type']) => {
        const now = new Date()
        const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS)
        
        const deletedItem: DeletedItem = {
          id: `deleted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalId: item.id,
          type,
          data: { ...item },
          deletedAt: now,
          deletedBy: 'user', // 将来的にはユーザーIDを使用
          expiresAt,
          originalPath: item.path || item.folder || undefined
        }

        set(state => ({
          deletedItems: [...state.deletedItems, deletedItem]
        }))

        // 期限切れアイテムの自動削除をチェック
        const state = get()
        const currentTime = new Date()
        const validItems = state.deletedItems.filter(item => 
          item.expiresAt.getTime() > currentTime.getTime()
        )
        
        if (validItems.length !== state.deletedItems.length) {
          set({ deletedItems: validItems })
        }
      },

      restoreItem: async (deletedItemId: string) => {
        const { deletedItems } = get()
        const itemToRestore = deletedItems.find(item => item.id === deletedItemId)
        
        if (!itemToRestore) {
          throw new Error('Item not found in trash')
        }

        // ゴミ箱から削除
        set(state => ({
          deletedItems: state.deletedItems.filter(item => item.id !== deletedItemId)
        }))

        // 実際の復元処理は各ストアで実装

        console.log('Restoring item:', itemToRestore)
      },

      permanentDelete: async (deletedItemId: string) => {
        set(state => ({
          deletedItems: state.deletedItems.filter(item => item.id !== deletedItemId)
        }))
      },

      emptyTrash: async () => {
        set({ deletedItems: [] })
      },

      loadTrashItems: async () => {
        set({ loading: true })
        
        try {
          // 期限切れアイテムをクリーンアップ
          const state = get()
          const cleanupTime = new Date()
          const validItems = state.deletedItems.filter(item => 
            item.expiresAt.getTime() > cleanupTime.getTime()
          )
          
          if (validItems.length !== state.deletedItems.length) {
            set({ deletedItems: validItems })
          }
        } finally {
          set({ loading: false })
        }
      },

      getTrashStats: (): TrashStats => {
        const { deletedItems } = get()
        
        const itemsByType = deletedItems.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const oldestItem = deletedItems.length > 0 
          ? new Date(Math.min(...deletedItems.map(item => item.deletedAt.getTime())))
          : undefined

        return {
          totalItems: deletedItems.length,
          itemsByType,
          oldestItem
        }
      },

      // 期限切れアイテムの自動削除（内部メソッド）
      cleanupExpiredItems: () => {
        const now = new Date()
        
        set(state => ({
          deletedItems: state.deletedItems.filter(item => 
            new Date(item.expiresAt).getTime() > now.getTime()
          )
        }))
      }
    }),
    {
      name: 'trash-storage',
      // 日付オブジェクトのシリアライゼーション処理
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          
          const data = JSON.parse(str)
          // 日付文字列を Date オブジェクトに変換
          if (data.state?.deletedItems) {
            data.state.deletedItems = data.state.deletedItems.map((item: TrashItem) => ({
              ...item,
              deletedAt: new Date(item.deletedAt),
              expiresAt: new Date(item.expiresAt)
            }))
          }
          return data
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)