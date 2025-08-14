import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  // Secondary Navigation (L2) State
  isSecondaryNavCollapsed: boolean
  setSecondaryNavCollapsed: (collapsed: boolean) => void
  toggleSecondaryNav: () => void
  
  // Column Widths
  primaryNavWidth: number
  secondaryNavWidth: number
  
  setPrimaryNavWidth: (width: number) => void
  setSecondaryNavWidth: (width: number) => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // Secondary Navigation State
      isSecondaryNavCollapsed: false,
      setSecondaryNavCollapsed: (collapsed) => 
        set({ isSecondaryNavCollapsed: collapsed }),
      toggleSecondaryNav: () => 
        set((state) => ({ isSecondaryNavCollapsed: !state.isSecondaryNavCollapsed })),
      
      // Column Widths
      primaryNavWidth: 60,
      secondaryNavWidth: 240,
      
      setPrimaryNavWidth: (width) => set({ primaryNavWidth: width }),
      setSecondaryNavWidth: (width) => set({ secondaryNavWidth: width }),
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({
        isSecondaryNavCollapsed: state.isSecondaryNavCollapsed,
        primaryNavWidth: state.primaryNavWidth,
        secondaryNavWidth: state.secondaryNavWidth,
      }),
    }
  )
)