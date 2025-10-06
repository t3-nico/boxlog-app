import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  // AppBar State (L1 - always visible)
  isAppBarOpen: boolean
  setAppBarOpen: (open: boolean) => void
  toggleAppBar: () => void

  // Sidebar State (L2 - collapsible)
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Secondary Navigation (L2) State - deprecated
  isSecondaryNavCollapsed: boolean
  setSecondaryNavCollapsed: (collapsed: boolean) => void
  toggleSecondaryNav: () => void
  
  // Column Widths
  primaryNavWidth: number
  secondaryNavWidth: number
  
  // Resizable AppBar Settings
  minWidth: number
  maxWidth: number
  defaultWidth: number
  
  setPrimaryNavWidth: (width: number) => void
  setSecondaryNavWidth: (width: number) => void
  
  // AppBar resize methods
  setPrimaryNavWidthConstrained: (width: number) => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // AppBar State (L1)
      isAppBarOpen: true,
      setAppBarOpen: (open) => set({ isAppBarOpen: open }),
      toggleAppBar: () =>
        set((state) => ({ isAppBarOpen: !state.isAppBarOpen })),

      // Sidebar State (L2)
      isSidebarOpen: true,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Secondary Navigation State - deprecated
      isSecondaryNavCollapsed: false,
      setSecondaryNavCollapsed: (collapsed) =>
        set({ isSecondaryNavCollapsed: collapsed }),
      toggleSecondaryNav: () =>
        set((state) => ({ isSecondaryNavCollapsed: !state.isSecondaryNavCollapsed })),
      
      // Column Widths
      primaryNavWidth: 280, // デフォルト幅
      secondaryNavWidth: 240,
      
      // Resizable Settings
      minWidth: 200,
      maxWidth: 480,
      defaultWidth: 280,
      
      setPrimaryNavWidth: (width) => set({ primaryNavWidth: width }),
      setSecondaryNavWidth: (width) => set({ secondaryNavWidth: width }),
      
      // AppBar resize with constraints
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
        isSecondaryNavCollapsed: state.isSecondaryNavCollapsed,
        primaryNavWidth: state.primaryNavWidth,
        secondaryNavWidth: state.secondaryNavWidth,
      }),
    }
  )
)