import { create } from 'zustand'

interface NotificationDialogStore {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useNotificationDialogStore = create<NotificationDialogStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
