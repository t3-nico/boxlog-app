import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  // AppBar State (L1 - always visible)
  isAppBarOpen: boolean
  setAppBarOpen: (open: boolean) => void
  toggleAppBar: () => void

  // Sidebar State (L2 - collapsible & resizable)
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Sidebar Resize Settings
  sidebarWidth: number
  sidebarMinWidth: number
  sidebarMaxWidth: number
  sidebarDefaultWidth: number
  setSidebarWidth: (width: number) => void
  setSidebarWidthConstrained: (width: number) => void

  // Secondary Navigation (L2) State - deprecated
  isSecondaryNavCollapsed: boolean
  setSecondaryNavCollapsed: (collapsed: boolean) => void
  toggleSecondaryNav: () => void

  // Column Widths (Legacy - AppBar用)
  primaryNavWidth: number
  secondaryNavWidth: number

  // Resizable AppBar Settings (Legacy)
  minWidth: number
  maxWidth: number
  defaultWidth: number

  setPrimaryNavWidth: (width: number) => void
  setSecondaryNavWidth: (width: number) => void

  // AppBar resize methods (Legacy)
  setPrimaryNavWidthConstrained: (width: number) => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // AppBar State (L1)
      isAppBarOpen: true,
      setAppBarOpen: (open) => set({ isAppBarOpen: open }),
      toggleAppBar: () => set((state) => ({ isAppBarOpen: !state.isAppBarOpen })),

      // Sidebar State (L2)
      isSidebarOpen: true,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Sidebar Resize Settings
      sidebarWidth: 240, // デフォルト幅
      sidebarMinWidth: 200,
      sidebarMaxWidth: 480,
      sidebarDefaultWidth: 240,
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setSidebarWidthConstrained: (width) => {
        const { sidebarMinWidth, sidebarMaxWidth } = get()
        const constrainedWidth = Math.max(sidebarMinWidth, Math.min(sidebarMaxWidth, width))
        set({ sidebarWidth: constrainedWidth })
      },

      // Secondary Navigation State - deprecated
      isSecondaryNavCollapsed: false,
      setSecondaryNavCollapsed: (collapsed) => set({ isSecondaryNavCollapsed: collapsed }),
      toggleSecondaryNav: () => set((state) => ({ isSecondaryNavCollapsed: !state.isSecondaryNavCollapsed })),

      // Column Widths (Legacy)
      primaryNavWidth: 280, // デフォルト幅
      secondaryNavWidth: 240,

      // Resizable Settings (Legacy)
      minWidth: 200,
      maxWidth: 480,
      defaultWidth: 280,

      setPrimaryNavWidth: (width) => set({ primaryNavWidth: width }),
      setSecondaryNavWidth: (width) => set({ secondaryNavWidth: width }),

      // AppBar resize with constraints (Legacy)
      setPrimaryNavWidthConstrained: (width) => {
        const { minWidth, maxWidth } = get()
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, width))
        set({ primaryNavWidth: constrainedWidth })
      },
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({
        isAppBarOpen: state.isAppBarOpen,
        isSidebarOpen: state.isSidebarOpen,
        sidebarWidth: state.sidebarWidth,
        isSecondaryNavCollapsed: state.isSecondaryNavCollapsed,
        primaryNavWidth: state.primaryNavWidth,
        secondaryNavWidth: state.secondaryNavWidth,
      }),
    }
  )
)
