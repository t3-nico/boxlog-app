import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  SidebarStore, 
  SidebarState, 
  SidebarActions, 
  Notification,
  SmartFolder,
  Tag 
} from '@/types/sidebar'

// モック通知データ
const mockNotifications: Notification[] = [
  { 
    id: '1', 
    type: 'task', 
    title: 'New comment on your task', 
    description: 'John added a comment to "Design Review"',
    timestamp: Date.now() - 2 * 60 * 1000, 
    read: false,
    priority: 'normal'
  },
  { 
    id: '2', 
    type: 'reminder', 
    title: 'Task deadline approaching', 
    description: 'Submit final design by 5 PM today',
    timestamp: Date.now() - 60 * 60 * 1000, 
    read: false,
    priority: 'high'
  },
  { 
    id: '3', 
    type: 'meeting', 
    title: 'Weekly report generated', 
    description: 'Your team productivity report is ready',
    timestamp: Date.now() - 3 * 60 * 60 * 1000, 
    read: false,
    priority: 'normal'
  },
  { 
    id: '4', 
    type: 'mention', 
    title: 'You were mentioned', 
    description: 'Sarah mentioned you in the project chat',
    timestamp: Date.now() - 24 * 60 * 60 * 1000, 
    read: true,
    priority: 'normal'
  },
]

// モックタグデータ (3階層まで)
const mockTags: Tag[] = [
  { id: '1', name: 'Work', count: 15, color: '#3b82f6', icon: 'BriefcaseIcon', parentId: null },
  { id: '2', name: 'Personal', count: 8, color: '#10b981', icon: 'UserIcon', parentId: null },
  { id: '3', name: 'Design', count: 12, color: '#f59e0b', icon: 'PaintBrushIcon', parentId: '1' },
  { id: '4', name: 'Development', count: 23, color: '#8b5cf6', icon: 'CodeBracketIcon', parentId: '1' },
  { id: '5', name: 'Meeting', count: 7, color: '#f97316', icon: 'VideoCameraIcon', parentId: '1' },
  { id: '6', name: 'Health', count: 5, color: '#84cc16', icon: 'HeartIcon', parentId: '2' },
  { id: '7', name: 'Learning', count: 9, color: '#ec4899', icon: 'BookOpenIcon', parentId: '2' },
  { id: '8', name: 'Shopping', count: 3, color: '#6b7280', icon: 'ShoppingCartIcon', parentId: '2' },
  { id: '9', name: 'UI/UX', count: 13, color: '#ff6b6b', icon: 'SwatchIcon', parentId: '3' },
  { id: '10', name: 'Prototyping', count: 4, color: '#4ecdc4', icon: 'CubeIcon', parentId: '3' },
  { id: '11', name: 'Research', count: 7, color: '#45b7d1', icon: 'MagnifyingGlassIcon', parentId: '3' },
  { id: '12', name: 'Frontend', count: 18, color: '#06b6d4', icon: 'ComputerDesktopIcon', parentId: '4' },
  { id: '13', name: 'Backend', count: 11, color: '#ef4444', icon: 'ServerIcon', parentId: '4' },
  { id: '14', name: 'DevOps', count: 6, color: '#336791', icon: 'CpuChipIcon', parentId: '4' },
  { id: '15', name: 'Exercise', count: 12, color: '#96ceb4', icon: 'BoltIcon', parentId: '6' },
  { id: '16', name: 'Nutrition', count: 8, color: '#feca57', icon: 'SparklesIcon', parentId: '6' },
]

// 初期状態
const initialState: SidebarState = {
  // UI状態
  collapsed: false,
  activeSection: 'views',
  
  // 通知関連
  unreadNotifications: mockNotifications.filter(n => !n.read).length,
  notifications: mockNotifications,
  
  // スマートフォルダ
  smartFolders: [],
  
  // タグ関連
  tags: mockTags,
  tagCounts: {},
  expandedTags: ['1', '2', '3', '4'], // いくつかのタグを初期展開状態に
  
  // ユーザー設定
  preferences: {
    hiddenSections: [],
    pinnedItems: [],
  },
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // UI操作
      setCollapsed: (collapsed: boolean) => 
        set({ collapsed }),
      
      setActiveSection: (activeSection: string) => 
        set({ activeSection }),

      // 通知操作
      addNotification: (notification: Notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadNotifications: state.unreadNotifications + 1,
        })),

      markNotificationRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadNotifications: Math.max(0, state.unreadNotifications - 1),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadNotifications: 0,
        })),

      setUnreadCount: (unreadNotifications: number) =>
        set({ unreadNotifications }),

      setNotifications: (notifications: Notification[]) => {
        const unreadCount = notifications.filter(n => !n.read).length
        set({ 
          notifications,
          unreadNotifications: unreadCount 
        })
      },

      // スマートフォルダ操作
      setSmartFolders: (smartFolders: SmartFolder[]) =>
        set({ smartFolders }),

      addSmartFolder: (folder: SmartFolder) =>
        set((state) => ({
          smartFolders: [...state.smartFolders, folder],
        })),

      // タグ操作
      setTags: (tags: Tag[]) =>
        set({ tags }),

      updateTag: (tagId: string, updates: Partial<Tag>) =>
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === tagId ? { ...tag, ...updates } : tag
          ),
        })),

      deleteTag: (tagId: string) =>
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== tagId),
          expandedTags: state.expandedTags.filter((id) => id !== tagId),
        })),

      addTag: (tag: Tag) =>
        set((state) => ({
          tags: [...state.tags, tag],
        })),

      updateTagCounts: (tagCounts: Record<string, number>) =>
        set({ tagCounts }),

      toggleTagExpansion: (tagId: string) =>
        set((state) => ({
          expandedTags: state.expandedTags.includes(tagId)
            ? state.expandedTags.filter((id) => id !== tagId)
            : [...state.expandedTags, tagId],
        })),

      // 設定操作
      hideSection: (sectionId: string) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            hiddenSections: [...state.preferences.hiddenSections, sectionId],
          },
        })),

      showSection: (sectionId: string) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            hiddenSections: state.preferences.hiddenSections.filter(
              (id) => id !== sectionId
            ),
          },
        })),

      pinItem: (itemId: string) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            pinnedItems: [...state.preferences.pinnedItems, itemId],
          },
        })),

      unpinItem: (itemId: string) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            pinnedItems: state.preferences.pinnedItems.filter(
              (id) => id !== itemId
            ),
          },
        })),
    }),
    {
      name: 'sidebar-store',
      partialize: (state) => ({
        collapsed: state.collapsed,
        activeSection: state.activeSection,
        expandedTags: state.expandedTags,
        preferences: state.preferences,
      }),
    }
  )
)

// セレクター関数（パフォーマンス最適化用）
export const sidebarSelectors = {
  // UI状態
  getCollapsed: (state: SidebarStore) => state.collapsed,
  getActiveSection: (state: SidebarStore) => state.activeSection,
  
  // 通知関連
  getUnreadCount: (state: SidebarStore) => state.unreadNotifications,
  getNotifications: (state: SidebarStore) => state.notifications,
  getUnreadNotifications: (state: SidebarStore) => 
    state.notifications.filter(n => !n.read),
  
  // タブ別通知
  getMentionNotifications: (state: SidebarStore) => 
    state.notifications.filter(n => n.type === 'mention' && !n.read),
  getScheduledNotifications: (state: SidebarStore) => 
    state.notifications.filter(n => (n.type === 'reminder' || n.type === 'meeting') && !n.read),
  
  // タグ関連
  getExpandedTags: (state: SidebarStore) => state.expandedTags,
  getTagCounts: (state: SidebarStore) => state.tagCounts,
  
  // 設定
  getHiddenSections: (state: SidebarStore) => state.preferences.hiddenSections,
  getPinnedItems: (state: SidebarStore) => state.preferences.pinnedItems,
}