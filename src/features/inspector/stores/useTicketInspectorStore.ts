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
  open: (mode: InspectorMode, ticketId?: string, sessionId?: string) => void
  close: () => void
}

export const useTicketInspectorStore = create<TicketInspectorState>((set) => ({
  isOpen: false,
  mode: null,
  ticketId: null,
  sessionId: null,
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
}))
