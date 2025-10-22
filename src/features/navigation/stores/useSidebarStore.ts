import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  /** Sidebarの開閉状態 */
  isOpen: boolean
  /** Sidebarを開く */
  open: () => void
  /** Sidebarを閉じる */
  close: () => void
  /** Sidebarの開閉をトグル */
  toggle: () => void
}

/**
 * Sidebar開閉状態を管理するStore
 *
 * @example
 * ```tsx
 * const { isOpen, toggle } = useSidebarStore()
 * <button onClick={toggle}>Toggle Sidebar</button>
 * ```
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true, // デフォルトは開いた状態
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'sidebar-storage', // localStorage key
    }
  )
)
