import { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type UserValues = Database['public']['Tables']['user_values']['Row']
export type SmartFilter = Database['public']['Tables']['smart_filters']['Row']

export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type TaskStatus = 'backlog' | 'scheduled' | 'completed' | 'rescheduled' | 'stopped' | 'delegated'

export interface CreateTaskData {
  title: string
  plannedStart?: Date
  plannedDuration?: number
  tags?: string[]
  memo?: string
  status?: TaskStatus
}