'use client'

import { useCreateModalStore } from '@/features/events/stores/useCreateModalStore'

// ポップアップコンテキストの型定義
interface PopupContext {
  initialData?: Record<string, unknown>
  source?: string
  date?: Date
  dueDate?: Date
  editingEvent?: Record<string, unknown>
}

// Legacy hook - 新しいuseCreateModalStoreへの移行用
// Scheduled for removal - tracked in Issue #89
export function useAddPopup() {
  const { openModal, closeModal, isOpen } = useCreateModalStore()

  return {
    isOpen,
    openPopup: (type: 'event' | 'log' = 'event', context?: PopupContext) => {
      // 'event' の場合のみ新しいモーダルを開く
      if (type === 'event') {
        openModal({
          initialData: context?.initialData || {},
          context: {
            source: context?.source || 'sidebar',
            date: context?.date
          }
        })
      }
      // 'log' は一旦無視（必要に応じて後で対応）
    },
    openEventPopup: (context?: PopupContext) => {
      openModal({
        initialData: context?.editingEvent || context?.initialData || {},
        context: {
          source: context?.source || 'sidebar',
          date: context?.dueDate || context?.date
        }
      })
    },
    closePopup: closeModal
  }
}