import { create } from 'zustand'

/**
 * Ticket Inspector状態管理
 *
 * 全ページ共通のTicket詳細Sheet表示を制御
 */
interface TicketInspectorStore {
  isOpen: boolean
  ticketId: string | null
  openInspector: (ticketId: string) => void
  closeInspector: () => void
}

export const useTicketInspectorStore = create<TicketInspectorStore>((set) => ({
  isOpen: false,
  ticketId: null,
  openInspector: (ticketId) => set({ isOpen: true, ticketId }),
  closeInspector: () => set({ isOpen: false, ticketId: null }),
}))
