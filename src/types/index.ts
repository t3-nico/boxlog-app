// import { Database } from './supabase' // Disabled for localStorage-only mode

// Export unified types first (highest priority)
export * from './unified'

// Re-export other type modules (excluding types already in unified)
export * from './common'
export * from './box'
// export * from './tags' // Already exported from unified
// export * from './smart-folders' // Already exported from unified  
export * from './sidebar'
export * from './chronotype'
export * from './trash'
export * from './task'
// export * from './events' // Already exported from unified

// Local storage stub types (replacing Supabase types)
export interface Profile {
  id: string
  email?: string
  name?: string
}

export interface UserValues {
  id: string
  user_id: string
  key: string
  value: string
}

export interface SmartFilter {
  id: string
  name: string
  criteria: Record<string, unknown>
}

export interface TaskInsert {
  title: string
  status?: string
  planned_start?: string
}

export interface TaskUpdate {
  title?: string
  status?: string
  planned_start?: string
}

export interface ProfileUpdate {
  name?: string
  email?: string
}

// Task type is now imported from unified.ts
// export type TaskStatus is now imported from unified.ts

export interface CreateTaskData {
  title: string
  plannedStart?: Date
  plannedDuration?: number
  tags?: string[]
  memo?: string
  status?: string
}