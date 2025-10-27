import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type { Ticket, TicketPriority, TicketStatus, TicketWithTags, UpdateTicketInput } from '../types/ticket'

interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  search?: string
}

interface TicketStore {
  // State
  tickets: Ticket[]
  ticketsWithTags: TicketWithTags[]
  filters: TicketFilters
  isLoading: boolean
  error: string | null

  // Actions - CRUD
  setTickets: (tickets: Ticket[]) => void
  setTicketsWithTags: (tickets: TicketWithTags[]) => void
  addTicket: (ticket: Ticket) => void
  updateTicket: (id: string, updates: UpdateTicketInput) => void
  removeTicket: (id: string) => void

  // Actions - Filters
  setFilters: (filters: TicketFilters) => void
  clearFilters: () => void

  // Actions - UI State
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void

  // Getters
  getTicketById: (id: string) => Ticket | undefined
  getTicketsByStatus: (status: TicketStatus) => Ticket[]
  getTicketsByPriority: (priority: TicketPriority) => Ticket[]
  getFilteredTickets: () => Ticket[]
}

export const useTicketStore = create<TicketStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      tickets: [],
      ticketsWithTags: [],
      filters: {},
      isLoading: false,
      error: null,

      // CRUD Actions
      setTickets: (tickets) => set({ tickets }),

      setTicketsWithTags: (ticketsWithTags) => set({ ticketsWithTags }),

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, ticket],
        })),

      updateTicket: (id, updates) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === id
              ? {
                  ...ticket,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : ticket
          ),
        })),

      removeTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id),
        })),

      // Filter Actions
      setFilters: (filters) => set({ filters }),

      clearFilters: () => set({ filters: {} }),

      // UI State Actions
      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // Getters
      getTicketById: (id) => {
        const { tickets } = get()
        return tickets.find((ticket) => ticket.id === id)
      },

      getTicketsByStatus: (status) => {
        const { tickets } = get()
        return tickets.filter((ticket) => ticket.status === status)
      },

      getTicketsByPriority: (priority) => {
        const { tickets } = get()
        return tickets.filter((ticket) => ticket.priority === priority)
      },

      getFilteredTickets: () => {
        const { tickets, filters } = get()

        return tickets.filter((ticket) => {
          // Status filter
          if (filters.status && ticket.status !== filters.status) {
            return false
          }

          // Priority filter
          if (filters.priority && ticket.priority !== filters.priority) {
            return false
          }

          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            const matchesTitle = ticket.title.toLowerCase().includes(searchLower)
            const matchesDescription = ticket.description?.toLowerCase().includes(searchLower)
            const matchesNumber = ticket.ticket_number.toLowerCase().includes(searchLower)

            if (!matchesTitle && !matchesDescription && !matchesNumber) {
              return false
            }
          }

          return true
        })
      },
    }),
    {
      name: 'ticket-store',
    }
  )
)
