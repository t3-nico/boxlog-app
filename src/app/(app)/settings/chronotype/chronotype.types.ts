import type { ChronotypeType } from '@/types/chronotype'

export interface ChronotypeAutoSaveSettings {
  type: ChronotypeType
  enabled: boolean
  displayMode: 'border' | 'background' | 'both'
  opacity: number
}

export interface ChronoTypeSchedule {
  id: string
  type: 'focus' | 'creative' | 'rest' | 'admin' | 'sleep'
  label: string
  startTime: string
  endTime: string
  description: string
  icon: string
}

export interface ChronoTypeProfile {
  id: string
  name: string
  description: string
  peakHours: string
  lowHours: string
  schedules: ChronoTypeSchedule[]
}

export interface DiagnosisQuestion {
  id: number
  question: string
  answers: {
    text: string
    score: { lion: number; bear: number; wolf: number; dolphin: number }
  }[]
}

export const typeColors = {
  lion: 'bg-orange-500',
  bear: 'bg-green-500',
  wolf: 'bg-purple-500',
  dolphin: 'bg-blue-500',
} as const

export const typeIcons = {
  focus: '🎯',
  creative: '💡',
  rest: '☕',
  admin: '📋',
  sleep: '😴',
} as const
