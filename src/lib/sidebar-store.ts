import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SidebarSection } from '@/types/box'

interface SidebarStore {
  // Section state
  sections: SidebarSection[]
  
  // Actions
  toggleSection: (sectionId: string) => void
  setSectionCollapsed: (sectionId: string, collapsed: boolean) => void
  updateSectionOrder: (sectionId: string, newOrder: number) => void
  
  // Getters
  getSectionState: (sectionId: string) => SidebarSection | undefined
  isSectionCollapsed: (sectionId: string) => boolean
}

const defaultSections: SidebarSection[] = [
  {
    id: 'smart-folders',
    name: 'Smart Folders',
    collapsed: false,
    order: 1
  },
  {
    id: 'folders',
    name: 'Folders',
    collapsed: false,
    order: 2
  }
]

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      sections: defaultSections,
      
      toggleSection: (sectionId: string) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, collapsed: !section.collapsed }
              : section
          )
        }))
      },
      
      setSectionCollapsed: (sectionId: string, collapsed: boolean) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, collapsed }
              : section
          )
        }))
      },
      
      updateSectionOrder: (sectionId: string, newOrder: number) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, order: newOrder }
              : section
          )
        }))
      },
      
      getSectionState: (sectionId: string) => {
        return get().sections.find((section) => section.id === sectionId)
      },
      
      isSectionCollapsed: (sectionId: string) => {
        const section = get().sections.find((section) => section.id === sectionId)
        return section?.collapsed ?? false
      }
    }),
    {
      name: 'sidebar-store',
      version: 1,
    }
  )
)