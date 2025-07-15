import { SmartFolder as BoxSmartFolder, FolderCondition } from './box'

export interface Notification {
  id: string
  type: 'meeting' | 'task' | 'reminder' | 'mention' | 'system'
  title: string
  description?: string
  timestamp: number
  read: boolean
  actionUrl?: string
  priority: 'low' | 'normal' | 'high'
}

export interface SmartFolder extends Omit<BoxSmartFolder, 'createdAt' | 'updatedAt'> {
  count: number
  orderIndex: number
}

export interface Tag {
  id: string
  name: string
  count: number
  parentId?: string | null
  color?: string
  icon?: string
  level?: number
}

export interface SidebarPreferences {
  hiddenSections: string[]
  pinnedItems: string[]
}

export interface SidebarState {
  // UI状態
  collapsed: boolean
  activeSection: string
  
  // 通知関連
  unreadNotifications: number
  notifications: Notification[]
  
  // スマートフォルダ
  smartFolders: SmartFolder[]
  
  // タグ関連
  tags: Tag[]
  tagCounts: Record<string, number>
  expandedTags: string[]
  
  // ユーザー設定
  preferences: SidebarPreferences
}

export interface SidebarActions {
  // UI操作
  setCollapsed: (collapsed: boolean) => void
  setActiveSection: (section: string) => void
  
  // 通知操作
  addNotification: (notification: Notification) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  setUnreadCount: (count: number) => void
  setNotifications: (notifications: Notification[]) => void
  
  // スマートフォルダ操作
  setSmartFolders: (folders: SmartFolder[]) => void
  addSmartFolder: (folder: SmartFolder) => void
  
  // タグ操作
  setTags: (tags: Tag[]) => void
  updateTag: (tagId: string, updates: Partial<Tag>) => void
  deleteTag: (tagId: string) => void
  addTag: (tag: Tag) => void
  updateTagCounts: (counts: Record<string, number>) => void
  toggleTagExpansion: (tagId: string) => void
  
  // 設定操作
  hideSection: (sectionId: string) => void
  showSection: (sectionId: string) => void
  pinItem: (itemId: string) => void
  unpinItem: (itemId: string) => void
}

export type SidebarStore = SidebarState & SidebarActions