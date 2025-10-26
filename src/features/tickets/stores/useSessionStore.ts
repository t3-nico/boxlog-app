import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Session, SessionStatus, SessionWithTags, UpdateSessionInput } from '../types/session'

interface SessionFilters {
  ticket_id?: string
  status?: SessionStatus
}

interface SessionStore {
  // State
  sessions: Session[]
  sessionsWithTags: SessionWithTags[]
  filters: SessionFilters
  isLoading: boolean
  error: string | null
  activeSessionId: string | null

  // Actions - CRUD
  setSessions: (sessions: Session[]) => void
  setSessionsWithTags: (sessions: SessionWithTags[]) => void
  addSession: (session: Session) => void
  updateSession: (id: string, updates: UpdateSessionInput) => void
  removeSession: (id: string) => void

  // Actions - Session Control
  startSession: (id: string) => void
  stopSession: (id: string) => void
  setActiveSession: (id: string | null) => void

  // Actions - Filters
  setFilters: (filters: SessionFilters) => void
  clearFilters: () => void

  // Actions - UI State
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void

  // Getters
  getSessionById: (id: string) => Session | undefined
  getSessionsByTicketId: (ticketId: string) => Session[]
  getSessionsByStatus: (status: SessionStatus) => Session[]
  getActiveSession: () => Session | undefined
  getFilteredSessions: () => Session[]
  getSessionDuration: (id: string) => number | null
}

export const useSessionStore = create<SessionStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      sessions: [],
      sessionsWithTags: [],
      filters: {},
      isLoading: false,
      error: null,
      activeSessionId: null,

      // CRUD Actions
      setSessions: (sessions) => set({ sessions }),

      setSessionsWithTags: (sessionsWithTags) => set({ sessionsWithTags }),

      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
        })),

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : session
          ),
        })),

      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
          activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
        })),

      // Session Control Actions
      startSession: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  actual_start: now,
                  status: 'in_progress' as SessionStatus,
                  updated_at: now,
                }
              : session
          ),
          activeSessionId: id,
        }))
      },

      stopSession: (id) => {
        const now = new Date().toISOString()
        const session = get().sessions.find((s) => s.id === id)

        if (!session || !session.actual_start) return

        const startTime = new Date(session.actual_start).getTime()
        const endTime = new Date(now).getTime()
        const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60))

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  actual_end: now,
                  status: 'completed' as SessionStatus,
                  duration_minutes: durationMinutes,
                  updated_at: now,
                }
              : s
          ),
          activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
        }))
      },

      setActiveSession: (id) => set({ activeSessionId: id }),

      // Filter Actions
      setFilters: (filters) => set({ filters }),

      clearFilters: () => set({ filters: {} }),

      // UI State Actions
      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // Getters
      getSessionById: (id) => {
        const { sessions } = get()
        return sessions.find((session) => session.id === id)
      },

      getSessionsByTicketId: (ticketId) => {
        const { sessions } = get()
        return sessions.filter((session) => session.ticket_id === ticketId)
      },

      getSessionsByStatus: (status) => {
        const { sessions } = get()
        return sessions.filter((session) => session.status === status)
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get()
        if (!activeSessionId) return undefined
        return sessions.find((session) => session.id === activeSessionId)
      },

      getFilteredSessions: () => {
        const { sessions, filters } = get()

        return sessions.filter((session) => {
          // Ticket filter
          if (filters.ticket_id && session.ticket_id !== filters.ticket_id) {
            return false
          }

          // Status filter
          if (filters.status && session.status !== filters.status) {
            return false
          }

          return true
        })
      },

      getSessionDuration: (id) => {
        const { sessions } = get()
        const session = sessions.find((s) => s.id === id)

        if (!session) return null

        // Return saved duration if completed
        if (session.duration_minutes) {
          return session.duration_minutes
        }

        // Calculate current duration for active session
        if (session.actual_start && !session.actual_end) {
          const startTime = new Date(session.actual_start).getTime()
          const now = Date.now()
          return Math.floor((now - startTime) / (1000 * 60))
        }

        return null
      },
    }),
    {
      name: 'session-store',
    }
  )
)
