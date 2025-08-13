import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  // Secondary Navigation (L2) State
  isSecondaryNavCollapsed: boolean
  setSecondaryNavCollapsed: (collapsed: boolean) => void
  toggleSecondaryNav: () => void
  
  // Right Panel (R1) State
  isRightPanelHidden: boolean
  setRightPanelHidden: (hidden: boolean) => void
  toggleRightPanel: () => void
  
  // AI Chat State
  isAIChatOpen: boolean
  setAIChatOpen: (open: boolean) => void
  
  isCodebaseAIChatOpen: boolean
  setCodebaseAIChatOpen: (open: boolean) => void
  
  // Column Widths
  primaryNavWidth: number
  secondaryNavWidth: number
  rightPanelWidth: number
  
  setPrimaryNavWidth: (width: number) => void
  setSecondaryNavWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
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
      
      // Right Panel State
      isRightPanelHidden: false,
      setRightPanelHidden: (hidden) => 
        set({ isRightPanelHidden: hidden }),
      toggleRightPanel: () => 
        set((state) => ({ isRightPanelHidden: !state.isRightPanelHidden })),
      
      // AI Chat State
      isAIChatOpen: false,
      setAIChatOpen: (open) => {
        if (open) {
          set({ isAIChatOpen: true, isCodebaseAIChatOpen: false })
        } else {
          set({ isAIChatOpen: false })
        }
      },
      
      isCodebaseAIChatOpen: false,
      setCodebaseAIChatOpen: (open) => {
        if (open) {
          set({ isCodebaseAIChatOpen: true, isAIChatOpen: false })
        } else {
          set({ isCodebaseAIChatOpen: false })
        }
      },
      
      // Column Widths
      primaryNavWidth: 60,
      secondaryNavWidth: 240,
      rightPanelWidth: 320,
      
      setPrimaryNavWidth: (width) => set({ primaryNavWidth: width }),
      setSecondaryNavWidth: (width) => set({ secondaryNavWidth: width }),
      setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({
        isSecondaryNavCollapsed: state.isSecondaryNavCollapsed,
        isRightPanelHidden: state.isRightPanelHidden,
        primaryNavWidth: state.primaryNavWidth,
        secondaryNavWidth: state.secondaryNavWidth,
        rightPanelWidth: state.rightPanelWidth,
      }),
    }
  )
)