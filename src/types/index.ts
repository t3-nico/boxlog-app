/**
 * BoxLog Shared Type Definitions
 *
 * This directory contains only basic type definitions
 * used across the application.
 *
 * Placement rules:
 * - Feature-specific types: features/X/types.ts (colocation)
 * - DB types: lib/database.types.ts (auto-generated)
 * - i18n types: lib/i18n/types.ts
 * - API common types: types/api.ts
 */

// ============================================
// Basic Type Definitions
// ============================================

/**
 * Task status
 */
export type TaskStatus =
  | 'backlog'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'stopped'

/**
 * Task priority
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Task type (for development management)
 */
export type TaskType = 'feature' | 'bug' | 'improvement' | 'maintenance' | 'documentation'

/**
 * Task entity
 */
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type?: TaskType
  planned_start: string
  planned_duration: number
  tags?: string[]
  created_at: string
  updated_at: string
  user_id: string
}

/**
 * User profile
 */
export interface Profile {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

/**
 * User values (key-value settings)
 */
export interface UserValues {
  id: string
  user_id: string
  key: string
  value: string
}

// ============================================
// Data Operation Types (Utility Types)
// ============================================

/**
 * Task insert input
 */
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>

/**
 * Task update input
 */
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>

/**
 * Profile update input
 */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>

// ============================================
// API Types Export
// ============================================

export * from './api'
