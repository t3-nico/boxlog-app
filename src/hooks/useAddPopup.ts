'use client'

import { useCreateModalStore } from '@/features/events/stores/useCreateModalStore'

// Legacy hook - 新しいuseCreateModalStoreへの移行用
// TODO: 段階的に削除予定
export function useAddPopup() {
  const { openModal, closeModal, isOpen } = useCreateModalStore()
  
  return {
    isOpen,
    openPopup: (type: 'event' | 'log' = 'event', context?: any) => {
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
    openEventPopup: (context?: any) => {
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