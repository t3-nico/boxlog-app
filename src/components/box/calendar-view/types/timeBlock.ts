import type { Task } from '../types'

export interface TimeBlock {
  id: string
  title: string
  color: string
  tasks: Task[]
  startTime: Date
  endTime: Date
  isLocked: boolean
  type: 'focus' | 'meeting' | 'break' | 'routine'
  metadata?: {
    templateId?: string
    cycles?: number
    breakDuration?: number
    preparationTime?: number
    wrapUpTime?: number
    activities?: string[]
  }
}

export interface TimeBlockTemplate {
  id: string
  name: string
  type: 'focus' | 'meeting' | 'break' | 'routine'
  duration: number
  color: string
  suggestedTasks?: string[]
  bestTime?: { start: number; end: number }
  icon?: React.ComponentType<{ className?: string }>
  breakDuration?: number
  cycles?: number
  preparationTime?: number
  wrapUpTime?: number
  activities?: string[]
}

export interface TimeSuggestion {
  time: Date
  score: number
  reason: string
}

export interface TimeBlockDropZoneProps {
  time: Date
  onDrop: (time: Date) => void
  isOptimal?: boolean
  suggestion?: TimeSuggestion
}

export interface UserPreferences {
  chronotype: 'morning' | 'evening' | 'custom'
  workingHours: { start: number; end: number }
  breakFrequency: number
  focusBlockDuration: number
}