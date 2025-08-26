import { Event } from '../types/events'

export interface DeletionStats {
  totalDeleted: number
  recentlyDeleted: number
  oldDeleted: number
}

export const eventDeletionUtils = {
  
  isDeletionPending: (event: Event): boolean => {
    return event.isDeleted === true && event.deletedAt !== null
  },

  isOldDeletion: (event: Event, daysThreshold = 30): boolean => {
    if (!event.isDeleted || !event.deletedAt) return false
    
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - daysThreshold)
    
    return event.deletedAt < threshold
  },

  getDaysUntilAutoDelete: (event: Event): number | null => {
    if (!event.isDeleted || !event.deletedAt) return null
    
    const deletedAt = new Date(event.deletedAt)
    const thirtyDaysLater = new Date(deletedAt)
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
    
    const today = new Date()
    const diffTime = thirtyDaysLater.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  },

  canBeRestored: (event: Event): boolean => {
    return event.isDeleted === true && event.deletedAt !== null
  },

  canBePermanentlyDeleted: (event: Event): boolean => {
    return event.isDeleted === true
  },

  getDeletedEventsStats: (events: Event[]): DeletionStats => {
    const deletedEvents = events.filter(event => event.isDeleted)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentlyDeleted = deletedEvents.filter(event => 
      event.deletedAt && event.deletedAt >= thirtyDaysAgo
    ).length

    const oldDeleted = deletedEvents.filter(event =>
      event.deletedAt && event.deletedAt < thirtyDaysAgo
    ).length

    return {
      totalDeleted: deletedEvents.length,
      recentlyDeleted,
      oldDeleted
    }
  },

  formatDeletedDate: (deletedAt: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - deletedAt.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return '今日'
    } else if (diffDays === 1) {
      return '昨日'
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      return `${diffWeeks}週間前`
    } else {
      const diffMonths = Math.floor(diffDays / 30)
      return `${diffMonths}ヶ月前`
    }
  },

  validateDeletion: (event: Event): { canDelete: boolean; reason?: string } => {
    if (!event) {
      return { canDelete: false, reason: 'イベントが見つかりません' }
    }

    if (event.isDeleted) {
      return { canDelete: false, reason: 'このイベントは既に削除済みです' }
    }

    return { canDelete: true }
  },

  validateRestore: (event: Event): { canRestore: boolean; reason?: string } => {
    if (!event) {
      return { canRestore: false, reason: 'イベントが見つかりません' }
    }

    if (!event.isDeleted) {
      return { canRestore: false, reason: 'このイベントは削除されていません' }
    }

    if (!event.deletedAt) {
      return { canRestore: false, reason: '削除日時が不正です' }
    }

    return { canRestore: true }
  },

  validatePermanentDeletion: (event: Event): { canPermanentlyDelete: boolean; reason?: string } => {
    if (!event) {
      return { canPermanentlyDelete: false, reason: 'イベントが見つかりません' }
    }

    if (!event.isDeleted) {
      return { canPermanentlyDelete: false, reason: 'まず通常の削除を行ってください' }
    }

    return { canPermanentlyDelete: true }
  },

  filterActiveEvents: (events: Event[]): Event[] => {
    return events.filter(event => !event.isDeleted)
  },

  filterDeletedEvents: (events: Event[]): Event[] => {
    return events.filter(event => event.isDeleted)
  },

  filterOldDeletedEvents: (events: Event[], daysThreshold = 30): Event[] => {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - daysThreshold)
    
    return events.filter(event => 
      event.isDeleted && event.deletedAt && event.deletedAt < threshold
    )
  },

  sortDeletedEventsByDate: (events: Event[]): Event[] => {
    return events
      .filter(event => event.isDeleted && event.deletedAt)
      .sort((a, b) => {
        const aTime = a.deletedAt?.getTime() || 0
        const bTime = b.deletedAt?.getTime() || 0
        return bTime - aTime
      })
  }
}