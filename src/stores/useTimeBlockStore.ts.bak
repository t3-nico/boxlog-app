import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { addMinutes, startOfDay, endOfDay, isWithinInterval, differenceInMinutes } from 'date-fns'
import type { 
  TimeBlock, 
  TimeBlockTemplate, 
  TimeSuggestion, 
  UserPreferences,
  Task 
} from '@/components/box/calendar-view/types/timeBlock'
import { 
  suggestOptimalBlockPlacement,
  isTimeSlotAvailable,
  evaluateTimeSlot 
} from '@/components/box/calendar-view/algorithms/smartPlacement'
import { 
  timeBlockTemplates,
  createBlockFromTemplate 
} from '@/components/box/calendar-view/templates/timeBlockTemplates'

interface TimeBlockState {
  // State
  timeBlocks: TimeBlock[]
  selectedBlockId: string | null
  draggedBlockId: string | null
  isCreatingBlock: boolean
  preferences: UserPreferences
  recentTemplates: string[]
  
  // Actions
  createTimeBlock: (block: Omit<TimeBlock, 'id'>) => TimeBlock
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void
  deleteTimeBlock: (id: string) => void
  duplicateTimeBlock: (id: string) => TimeBlock | null
  
  // Block operations
  addTaskToBlock: (blockId: string, task: Task) => void
  removeTaskFromBlock: (blockId: string, taskId: string) => void
  reorderTasksInBlock: (blockId: string, taskIds: string[]) => void
  moveTaskBetweenBlocks: (taskId: string, fromBlockId: string, toBlockId: string) => void
  
  // Template operations
  createBlockFromTemplate: (templateId: string, startTime: Date) => TimeBlock | null
  getAvailableTemplates: () => TimeBlockTemplate[]
  addToRecentTemplates: (templateId: string) => void
  
  // Time operations
  moveBlock: (id: string, newStartTime: Date) => boolean
  resizeBlock: (id: string, newEndTime: Date) => boolean
  checkTimeConflicts: (blockId: string, startTime: Date, endTime: Date) => TimeBlock[]
  
  // Smart suggestions
  getSuggestionsForBlock: (block: TimeBlock, targetDate?: Date) => TimeSuggestion[]
  getOptimalTimeForTemplate: (templateId: string, targetDate?: Date) => TimeSuggestion[]
  evaluateTimeSlot: (time: Date, blockType: TimeBlock['type']) => { score: number; reasons: string[] }
  
  // Selection and interaction
  selectBlock: (id: string | null) => void
  setDraggedBlock: (id: string | null) => void
  setCreatingBlock: (creating: boolean) => void
  
  // Preferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  
  // Bulk operations
  getBlocksForDate: (date: Date) => TimeBlock[]
  getBlocksInRange: (startDate: Date, endDate: Date) => TimeBlock[]
  clearBlocksForDate: (date: Date) => void
  
  // Analytics
  getBlockStatistics: () => {
    totalBlocks: number
    completedTasks: number
    totalTasks: number
    averageBlockDuration: number
    mostUsedType: TimeBlock['type']
    productivityScore: number
  }
}

// デフォルトの設定
const defaultPreferences: UserPreferences = {
  chronotype: 'morning',
  workingHours: { start: 9, end: 18 },
  breakFrequency: 90, // 90分ごと
  focusBlockDuration: 90
}

// ID生成関数
function generateId(): string {
  return `tb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const useTimeBlockStore = create<TimeBlockState>()(
  persist(
    (set, get) => ({
      // Initial State
      timeBlocks: [],
      selectedBlockId: null,
      draggedBlockId: null,
      isCreatingBlock: false,
      preferences: defaultPreferences,
      recentTemplates: [],
      
      // Create Time Block
      createTimeBlock: (blockData) => {
        const newBlock: TimeBlock = {
          id: generateId(),
          ...blockData
        }
        
        set((state) => ({
          timeBlocks: [...state.timeBlocks, newBlock]
        }))
        
        return newBlock
      },
      
      // Update Time Block
      updateTimeBlock: (id, updates) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map(block =>
            block.id === id ? { ...block, ...updates } : block
          )
        }))
      },
      
      // Delete Time Block
      deleteTimeBlock: (id) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.filter(block => block.id !== id),
          selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
        }))
      },
      
      // Duplicate Time Block
      duplicateTimeBlock: (id) => {
        const block = get().timeBlocks.find(b => b.id === id)
        if (!block) return null
        
        const duplicated = get().createTimeBlock({
          ...block,
          title: `${block.title} (コピー)`,
          startTime: addMinutes(block.endTime, 15),
          endTime: addMinutes(block.endTime, 15 + differenceInMinutes(block.endTime, block.startTime)),
          tasks: [...block.tasks] // タスクをコピー
        })
        
        return duplicated
      },
      
      // Add Task to Block
      addTaskToBlock: (blockId, task) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map(block =>
            block.id === blockId
              ? { ...block, tasks: [...block.tasks, task] }
              : block
          )
        }))
      },
      
      // Remove Task from Block
      removeTaskFromBlock: (blockId, taskId) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map(block =>
            block.id === blockId
              ? { ...block, tasks: block.tasks.filter(task => task.id !== taskId) }
              : block
          )
        }))
      },
      
      // Reorder Tasks in Block
      reorderTasksInBlock: (blockId, taskIds) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map(block => {
            if (block.id !== blockId) return block
            
            const orderedTasks = taskIds
              .map(id => block.tasks.find(task => task.id === id))
              .filter(Boolean) as Task[]
            
            return { ...block, tasks: orderedTasks }
          })
        }))
      },
      
      // Move Task Between Blocks
      moveTaskBetweenBlocks: (taskId, fromBlockId, toBlockId) => {
        const state = get()
        const fromBlock = state.timeBlocks.find(b => b.id === fromBlockId)
        const task = fromBlock?.tasks.find(t => t.id === taskId)
        
        if (!task) return
        
        // Remove from source block
        get().removeTaskFromBlock(fromBlockId, taskId)
        // Add to target block
        get().addTaskToBlock(toBlockId, task)
      },
      
      // Create Block from Template
      createBlockFromTemplate: (templateId, startTime) => {
        const template = timeBlockTemplates.find(t => t.id === templateId)
        if (!template) return null
        
        const block = createBlockFromTemplate(template, startTime)
        const createdBlock = get().createTimeBlock(block)
        
        // Add to recent templates
        get().addToRecentTemplates(templateId)
        
        return createdBlock
      },
      
      // Get Available Templates
      getAvailableTemplates: () => {
        return timeBlockTemplates
      },
      
      // Add to Recent Templates
      addToRecentTemplates: (templateId) => {
        set((state) => {
          const recent = state.recentTemplates.filter(id => id !== templateId)
          return {
            recentTemplates: [templateId, ...recent].slice(0, 5) // 最新5個まで
          }
        })
      },
      
      // Move Block
      moveBlock: (id, newStartTime) => {
        const state = get()
        const block = state.timeBlocks.find(b => b.id === id)
        if (!block) return false
        
        const duration = differenceInMinutes(block.endTime, block.startTime)
        const newEndTime = addMinutes(newStartTime, duration)
        
        // Check for conflicts (excluding current block)
        const conflicts = get().checkTimeConflicts(id, newStartTime, newEndTime)
        if (conflicts.length > 0) return false
        
        get().updateTimeBlock(id, {
          startTime: newStartTime,
          endTime: newEndTime
        })
        
        return true
      },
      
      // Resize Block
      resizeBlock: (id, newEndTime) => {
        const state = get()
        const block = state.timeBlocks.find(b => b.id === id)
        if (!block) return false
        
        // Minimum 15 minutes
        if (differenceInMinutes(newEndTime, block.startTime) < 15) return false
        
        // Check for conflicts
        const conflicts = get().checkTimeConflicts(id, block.startTime, newEndTime)
        if (conflicts.length > 0) return false
        
        get().updateTimeBlock(id, { endTime: newEndTime })
        return true
      },
      
      // Check Time Conflicts
      checkTimeConflicts: (blockId, startTime, endTime) => {
        const state = get()
        return state.timeBlocks.filter(block => {
          if (block.id === blockId) return false // Exclude self
          
          return (
            (startTime < block.endTime && endTime > block.startTime) ||
            (startTime <= block.startTime && endTime >= block.endTime)
          )
        })
      },
      
      // Get Suggestions for Block
      getSuggestionsForBlock: (block, targetDate = new Date()) => {
        const state = get()
        const otherBlocks = state.timeBlocks.filter(b => b.id !== block.id)
        
        return suggestOptimalBlockPlacement(block, otherBlocks, state.preferences, targetDate)
      },
      
      // Get Optimal Time for Template
      getOptimalTimeForTemplate: (templateId, targetDate = new Date()) => {
        const template = timeBlockTemplates.find(t => t.id === templateId)
        if (!template) return []
        
        const dummyBlock = createBlockFromTemplate(template, targetDate)
        return get().getSuggestionsForBlock(dummyBlock, targetDate)
      },
      
      // Evaluate Time Slot
      evaluateTimeSlot: (time, blockType) => {
        const state = get()
        return evaluateTimeSlot(time, blockType, state.timeBlocks, state.preferences)
      },
      
      // Selection and Interaction
      selectBlock: (id) => set({ selectedBlockId: id }),
      setDraggedBlock: (id) => set({ draggedBlockId: id }),
      setCreatingBlock: (creating) => set({ isCreatingBlock: creating }),
      
      // Update Preferences
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        }))
      },
      
      // Get Blocks for Date
      getBlocksForDate: (date) => {
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)
        
        return get().timeBlocks.filter(block =>
          isWithinInterval(block.startTime, { start: dayStart, end: dayEnd }) ||
          isWithinInterval(block.endTime, { start: dayStart, end: dayEnd }) ||
          (block.startTime <= dayStart && block.endTime >= dayEnd)
        )
      },
      
      // Get Blocks in Range
      getBlocksInRange: (startDate, endDate) => {
        return get().timeBlocks.filter(block =>
          isWithinInterval(block.startTime, { start: startDate, end: endDate }) ||
          isWithinInterval(block.endTime, { start: startDate, end: endDate }) ||
          (block.startTime <= startDate && block.endTime >= endDate)
        )
      },
      
      // Clear Blocks for Date
      clearBlocksForDate: (date) => {
        const blocksToKeep = get().timeBlocks.filter(block => {
          const dayStart = startOfDay(date)
          const dayEnd = endOfDay(date)
          
          return !(
            isWithinInterval(block.startTime, { start: dayStart, end: dayEnd }) ||
            isWithinInterval(block.endTime, { start: dayStart, end: dayEnd })
          )
        })
        
        set({ timeBlocks: blocksToKeep })
      },
      
      // Get Block Statistics
      getBlockStatistics: () => {
        const state = get()
        const blocks = state.timeBlocks
        
        const totalTasks = blocks.reduce((sum, block) => sum + block.tasks.length, 0)
        const completedTasks = blocks.reduce(
          (sum, block) => sum + block.tasks.filter(task => task.status === 'completed').length,
          0
        )
        
        const totalDuration = blocks.reduce(
          (sum, block) => sum + differenceInMinutes(block.endTime, block.startTime),
          0
        )
        
        const typeCounts = blocks.reduce((acc, block) => {
          acc[block.type] = (acc[block.type] || 0) + 1
          return acc
        }, {} as Record<TimeBlock['type'], number>)
        
        const mostUsedType = Object.entries(typeCounts).reduce(
          (max, [type, count]) => count > max.count ? { type: type as TimeBlock['type'], count } : max,
          { type: 'focus' as TimeBlock['type'], count: 0 }
        ).type
        
        const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        
        return {
          totalBlocks: blocks.length,
          completedTasks,
          totalTasks,
          averageBlockDuration: blocks.length > 0 ? Math.round(totalDuration / blocks.length) : 0,
          mostUsedType,
          productivityScore
        }
      }
    }),
    {
      name: 'timeblock-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        timeBlocks: state.timeBlocks,
        preferences: state.preferences,
        recentTemplates: state.recentTemplates
      })
    }
  )
)

// Selector hooks for better performance
export const useTimeBlocks = () => useTimeBlockStore((state) => state.timeBlocks)
export const useSelectedBlock = () => useTimeBlockStore((state) => 
  state.timeBlocks.find(block => block.id === state.selectedBlockId)
)
export const useTimeBlockPreferences = () => useTimeBlockStore((state) => state.preferences)
export const useBlockStatistics = () => useTimeBlockStore((state) => state.getBlockStatistics())

// Date-specific selectors
export const useBlocksForDate = (date: Date) => useTimeBlockStore((state) => 
  state.getBlocksForDate(date)
)

export const useBlocksForWeek = (startDate: Date) => useTimeBlockStore((state) => {
  const endDate = addMinutes(startDate, 7 * 24 * 60) // 7 days
  return state.getBlocksInRange(startDate, endDate)
})