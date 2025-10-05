// Offline Feature Types

import { OfflineActionData, ConflictData } from '@/types/common'

export interface OfflineAction<T = unknown> extends OfflineActionData<T> {
  syncStatus: 'pending' | 'syncing' | 'completed' | 'conflict'
  retryCount?: number
}

export interface SyncResult<T = unknown> {
  success: boolean
  conflicts?: ConflictData<T>[]
  serverData?: T
  error?: string
}

export interface ConflictResolution {
  choice: 'local' | 'server' | 'merge'
  mergedData?: unknown
}

export interface OfflineManagerStatus {
  isOnline: boolean
  isInitialized: boolean
  syncInProgress: boolean
  queueSize: number
}

export interface SyncCompletedEvent {
  processed: number
  conflicts: number
}

export interface ConflictDetectedEvent {
  action: OfflineAction
  conflicts: ConflictData[]
  conflictId: string
}

export interface ConflictResolvedEvent {
  conflictId: string
  resolution: ConflictResolution
  finalData: unknown
}

export interface SyncFailedEvent {
  action: OfflineAction
  error: unknown
}
