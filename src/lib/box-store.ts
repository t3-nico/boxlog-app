import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, TaskFilters, SortConfig, TaskStatus, TaskPriority, TaskType } from '@/types/box'
import { initialTasks } from '@/lib/tasks'

interface BoxStore {
  tasks: Task[]
  filters: TaskFilters
  sortConfig: SortConfig
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id'>) => Promise<boolean>
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  toggleTaskSelection: (id: string) => void
  selectAllTasks: (selected: boolean) => void
  
  // Filter actions
  setSearchFilter: (search: string) => void
  setStatusFilter: (status: TaskStatus[]) => void
  setPriorityFilter: (priority: TaskPriority[]) => void
  setTypeFilter: (type: TaskType[]) => void
  setTagFilter: (tags: string[]) => void
  setSmartFolderFilter: (smartFolderId: string) => void
  clearFilters: () => void
  
  // Sort actions
  setSortConfig: (config: SortConfig) => void
  
  // Computed values
  getFilteredTasks: () => Task[]
  getSortedTasks: () => Task[]
  getSelectedTasks: () => Task[]
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export const useBoxStore = create<BoxStore>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      filters: {
        search: '',
        status: [],
        priority: [],
        type: [],
        tags: [],
        smartFolder: '',
      },
      sortConfig: {
        key: null,
        direction: 'asc',
      },
  
      setTasks: (tasks) => set({ tasks }),
  
      addTask: async (task) => {
        try {
          const now = new Date()
          const newTask: Task = {
            ...task,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
            attachments: [],
            comments: [],
          }
          set((state) => ({ tasks: [...state.tasks, newTask] }))
          return true
        } catch (error) {
          console.error('Failed to add task:', error)
          return false
        }
      },
      
      updateTask: async (id, updates) => {
        try {
          const { tasks } = get()
          const taskExists = tasks.some(task => task.id === id)
          
          if (!taskExists) {
            throw new Error('Task not found')
          }
          
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
            ),
          }))
          return true
        } catch (error) {
          console.error('Failed to update task:', error)
          return false
        }
      },
      
      deleteTask: async (id) => {
        try {
          const { tasks } = get()
          const taskExists = tasks.some(task => task.id === id)
          
          if (!taskExists) {
            throw new Error('Task not found')
          }
          
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }))
          return true
        } catch (error) {
          console.error('Failed to delete task:', error)
          return false
        }
      },
      
      toggleTaskSelection: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, selected: !task.selected } : task
          ),
        }))
      },
      
      selectAllTasks: (selected) => {
        set((state) => ({
          tasks: state.tasks.map((task) => ({ ...task, selected })),
        }))
      },
      
      setSearchFilter: (search) => {
        set((state) => ({
          filters: { ...state.filters, search },
        }))
      },
      
      setStatusFilter: (status) => {
        set((state) => ({
          filters: { ...state.filters, status },
        }))
      },
      
      setPriorityFilter: (priority) => {
        set((state) => ({
          filters: { ...state.filters, priority },
        }))
      },
      
      setTypeFilter: (type) => {
        set((state) => ({
          filters: { ...state.filters, type },
        }))
      },
      
      setTagFilter: (tags) => {
        set((state) => ({
          filters: { ...state.filters, tags, smartFolder: '' },
        }))
      },

      setSmartFolderFilter: (smartFolder) => {
        set((state) => ({
          filters: { ...state.filters, smartFolder, tags: [] },
        }))
      },
      
      clearFilters: () => {
        set({
          filters: {
            search: '',
            status: [],
            priority: [],
            type: [],
            tags: [],
            smartFolder: '',
          },
        })
      },
      
      setSortConfig: (config) => {
        set({ sortConfig: config })
      },
      
      getFilteredTasks: () => {
        const { tasks, filters } = get()
        
        // Note: SmartFolder filtering is handled at the component level
        if (filters.smartFolder) {
          return tasks
        }
        
        return tasks.filter((task) => {
          // Search filter
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            const matchesSearch = 
              task.task.toLowerCase().includes(searchTerm) ||
              task.title.toLowerCase().includes(searchTerm) ||
              task.type.toLowerCase().includes(searchTerm)
            
            if (!matchesSearch) return false
          }
          
          // Status filter
          if (filters.status.length > 0) {
            if (!filters.status.includes(task.status)) return false
          }
          
          // Priority filter
          if (filters.priority.length > 0) {
            if (!filters.priority.includes(task.priority)) return false
          }
          
          // Type filter
          if (filters.type.length > 0) {
            if (!filters.type.includes(task.type)) return false
          }
          
          // Tag filter with hierarchy support
          if (filters.tags.length > 0) {
            const taskTags = task.tags || []
            const hasMatchingTag = filters.tags.some(tagId => {
              // Check if task has this tag directly
              if (taskTags.includes(tagId)) return true
              
              // Check if task has any child tags of this tag
              // This logic would be implemented if needed for hierarchical filtering
              return false
            })
            if (!hasMatchingTag) return false
          }
          
          return true
        })
      },
      
      getSortedTasks: () => {
        const { sortConfig } = get()
        const filteredTasks = get().getFilteredTasks()
        
        if (!sortConfig.key) return filteredTasks
        
        return [...filteredTasks].sort((a, b) => {
          const aValue = a[sortConfig.key as keyof Task]
          const bValue = b[sortConfig.key as keyof Task]
          
          // Handle undefined values
          if (aValue === undefined && bValue === undefined) return 0
          if (aValue === undefined) return 1
          if (bValue === undefined) return -1
          
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1
          }
          return 0
        })
      },
  
      getSelectedTasks: () => {
        const { tasks } = get()
        return tasks.filter((task) => task.selected)
      },
    }),
    {
      name: 'box-storage',
      // Only persist tasks and ignore filters/sortConfig for better UX
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
)