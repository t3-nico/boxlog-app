import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface InspectorState {
  // Inspector State
  isInspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
  toggleInspector: () => void
  
  // Width Control
  inspectorWidth: number
  setInspectorWidth: (width: number) => void
  
  // Resizable Settings
  minWidth: number
  maxWidth: number
  defaultWidth: number
  
  // Content Management
  activeContent: string | null
  setActiveContent: (content: string | null) => void
  
  // Inspector resize methods
  setInspectorWidthConstrained: (width: number) => void
}

export const useInspectorStore = create<InspectorState>()(
  persist(
    (set, get) => ({
      // Inspector State
      isInspectorOpen: true, // テスト用: デフォルトで表示
      setInspectorOpen: (open) => set({ isInspectorOpen: open }),
      toggleInspector: () => 
        set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
      
      // Width Control
      inspectorWidth: 320, // デフォルト幅
      setInspectorWidth: (width) => set({ inspectorWidth: width }),
      
      // Resizable Settings
      minWidth: 280,
      maxWidth: 600,
      defaultWidth: 320,
      
      // Content Management
      activeContent: 'calendar', // テスト用: カレンダーコンテンツ表示
      setActiveContent: (content) => set({ activeContent: content }),
      
      // Inspector resize with constraints
      setInspectorWidthConstrained: (width) => {
        const { minWidth, maxWidth } = get()
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, width))
        set({ inspectorWidth: constrainedWidth })
      },
    }),
    {
      name: 'inspector-store',
      partialize: (state) => ({
        isInspectorOpen: state.isInspectorOpen,
        inspectorWidth: state.inspectorWidth,
        activeContent: state.activeContent,
      }),
    }
  )
)