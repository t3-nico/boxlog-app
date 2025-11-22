import { create } from 'zustand'

/**
 * Ticket Inspector状態管理
 *
 * 全ページ共通のTicket詳細Sheet表示を制御
 */

/**
 * Ticket作成時に事前設定するデータ
 */
interface TicketInitialData {
  start_time?: string // ISO datetime string
  end_time?: string // ISO datetime string
  // 将来的に追加可能: title?, description?, tags?, etc.
}

interface TicketInspectorStore {
  isOpen: boolean
  ticketId: string | null
  initialData?: TicketInitialData
  openInspector: (ticketId: string | null, initialData?: TicketInitialData) => void
  closeInspector: () => void
}

export const useTicketInspectorStore = create<TicketInspectorStore>((set) => ({
  isOpen: false,
  ticketId: null,
  initialData: undefined,
  openInspector: (ticketId, initialData) =>
    set({ isOpen: true, ticketId, initialData: ticketId === null ? initialData : undefined }),
  closeInspector: () => set({ isOpen: false, ticketId: null, initialData: undefined }),
}))
