import { create } from 'zustand'

export type InspectorMode =
  | 'create-ticket'
  | 'edit-ticket'
  | 'view-ticket'
  | 'create-session'
  | 'edit-session'
  | 'view-session'
  | null

interface TicketInspectorState {
  isOpen: boolean
  mode: InspectorMode
  ticketId: string | null
  sessionId: string | null
  width: number
  isResizing: boolean
  open: (mode: InspectorMode, ticketId?: string, sessionId?: string) => void
  close: () => void
  setWidth: (width: number) => void
  setIsResizing: (isResizing: boolean) => void
}

export const useTicketInspectorStore = create<TicketInspectorState>((set) => ({
  isOpen: false,
  mode: null,
  ticketId: null,
  sessionId: null,
  width: 700,
  isResizing: false,
  open: (mode, ticketId, sessionId) =>
    set({
      isOpen: true,
      mode,
      ticketId: ticketId ?? null,
      sessionId: sessionId ?? null,
    }),
  close: () =>
    set({
      isOpen: false,
      mode: null,
      ticketId: null,
      sessionId: null,
    }),
  setWidth: (width) => set({ width }),
  setIsResizing: (isResizing) => set({ isResizing }),
}))
