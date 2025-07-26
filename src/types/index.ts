import { Database } from './supabase'

// Export unified types first (highest priority)
export * from './unified'

// Re-export other type modules
export * from './common'
export * from './box'
export * from './tags'
export * from './smart-folders'
export * from './sidebar'
export * from './chronotype'
export * from './trash'
export * from './events'

// Supabase database types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserValues = Database['public']['Tables']['user_values']['Row']
export type SmartFilter = Database['public']['Tables']['smart_filters']['Row']

export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Task type is now imported from unified.ts
// export type TaskStatus is now imported from unified.ts

export interface CreateTaskData {
  title: string
  plannedStart?: Date
  plannedDuration?: number
  tags?: string[]
  memo?: string
  status?: TaskStatus
}