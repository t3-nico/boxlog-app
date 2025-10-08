import { create } from 'zustand'

interface AIPanelStore {
  isOpen: boolean
  panelHeight: number
  isMinimized: boolean
  setIsOpen: (open: boolean) => void
  setPanelHeight: (height: number) => void
  setIsMinimized: (minimized: boolean) => void
}

export const useAIPanelStore = create<AIPanelStore>((set) => ({
  isOpen: false,
  panelHeight: 400,
  isMinimized: false,

  setIsOpen: (open) => set({ isOpen: open }),
  setPanelHeight: (height) => set({ panelHeight: height }),
  setIsMinimized: (minimized) => set({ isMinimized: minimized }),
}))
