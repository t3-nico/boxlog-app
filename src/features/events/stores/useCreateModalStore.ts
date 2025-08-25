'use client'

import { create } from 'zustand'
import type { CreateEventRequest } from '../types/events'

type ModalSource = 'sidebar' | 'calendar' | 'table' | 'kanban' | 'keyboard'

interface ModalContext {
  source: ModalSource
  date?: Date
  viewType?: string
}

interface CreateModalStore {
  // 状態
  isOpen: boolean
  initialData: Partial<CreateEventRequest>
  context: ModalContext
  
  // アクション
  openModal: (options?: {
    initialData?: Partial<CreateEventRequest>
    context?: Partial<ModalContext>
  }) => void
  
  closeModal: () => void
  
  setInitialData: (data: Partial<CreateEventRequest>) => void
}

export const useCreateModalStore = create<CreateModalStore>((set) => ({
  // 初期状態
  isOpen: false,
  initialData: {},
  context: {
    source: 'sidebar'
  },
  
  // アクション
  openModal: (options = {}) => {
    const {
      initialData = {},
      context = {}
    } = options
    
    set({
      isOpen: true,
      initialData,
      context: {
        source: context.source || 'sidebar',
        date: context.date,
        viewType: context.viewType
      }
    })
  },
  
  closeModal: () => {
    set({
      isOpen: false,
      initialData: {},
      context: {
        source: 'sidebar'
      }
    })
  },
  
  setInitialData: (data) => {
    set({ initialData: data })
  }
}))

// キーボードショートカット用フック
export const useCreateModalKeyboardShortcuts = () => {
  const { openModal } = useCreateModalStore()
  
  const handleKeyDown = (event: KeyboardEvent) => {
    // Cmd/Ctrl + N でモーダルを開く
    if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
      event.preventDefault()
      openModal({
        context: { source: 'keyboard' }
      })
    }
  }
  
  return { handleKeyDown }
}