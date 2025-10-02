'use client'

import { useCreateModalStore } from '@/features/events/stores/useCreateModalStore'
import type { CreateEventRequest } from '@/features/events/types/events'

import { useInspectorStore } from '../stores/inspector.store'

// Inspector向けのCreateEvent連携フック
export function useCreateEventInspector() {
  const { setInspectorOpen, setActiveContent } = useInspectorStore()
  const { openModal, openEditModal } = useCreateModalStore()

  // 新規イベント作成でInspectorを開く
  const openCreateInspector = (options?: {
    initialData?: Partial<CreateEventRequest>
    context?: {
      source?: 'sidebar' | 'calendar' | 'table' | 'kanban' | 'keyboard' | 'fab'
      date?: Date
      viewType?: string
    }
  }) => {
    // useCreateModalStoreに状態を保存（CreateEventInspectorContentで使用）
    openModal(options)
    
    // Inspectorを開いてcreate-eventコンテンツを表示
    setActiveContent('create-event')
    setInspectorOpen(true)
  }

  // 編集モードでInspectorを開く
  const openEditInspector = (
    eventId: string,
    eventData: Partial<CreateEventRequest>,
    context?: {
      source?: 'sidebar' | 'calendar' | 'table' | 'kanban' | 'keyboard' | 'fab'
      date?: Date
      viewType?: string
    }
  ) => {
    // useCreateModalStoreに状態を保存（CreateEventInspectorContentで使用）
    openEditModal(eventId, eventData, context)
    
    // Inspectorを開いてcreate-eventコンテンツを表示
    setActiveContent('create-event')
    setInspectorOpen(true)
  }

  // Inspectorを閉じる（コンテンツのみクリア）
  const closeCreateInspector = () => {
    setActiveContent(null)
    // Inspectorはそのまま開いておく
  }

  return {
    openCreateInspector,
    openEditInspector,
    closeCreateInspector
  }
}