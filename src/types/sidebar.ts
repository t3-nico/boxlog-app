export interface Notification {
  id: string;
  type: 'meeting' | 'task' | 'reminder' | 'mention' | 'system';
  title: string;
  description?: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high';
}

export interface SidebarTag {
  id: string;
  name: string;
  count: number;
  parentId?: string | null;
  color?: string;
  icon?: string;
  level?: number;
}

export interface SidebarPreferences {
  hiddenSections: string[];
  pinnedItems: string[];
}

export interface SidebarState {
  // UI状態
  collapsed: boolean;
  activeSection: string;

  // 通知関連
  unreadNotifications: number;
  notifications: Notification[];

  // タグ関連
  tags: SidebarTag[];
  tagCounts: Record<string, number>;
  expandedTags: string[];

  // ユーザー設定
  preferences: SidebarPreferences;
}

export interface SidebarActions {
  // UI操作
  setCollapsed: (_collapsed: boolean) => void;
  setActiveSection: (_section: string) => void;

  // 通知操作
  addNotification: (_notification: Notification) => void;
  markNotificationRead: (_id: string) => void;
  markAllNotificationsRead: () => void;
  setUnreadCount: (_count: number) => void;
  setNotifications: (_notifications: Notification[]) => void;

  // タグ操作
  setTags: (_tags: SidebarTag[]) => void;
  updateTag: (_tagId: string, _updates: Partial<SidebarTag>) => void;
  deleteTag: (_tagId: string) => void;
  addTag: (_tag: SidebarTag) => void;
  updateTagCounts: (_counts: Record<string, number>) => void;
  toggleTagExpansion: (_tagId: string) => void;

  // 設定操作
  hideSection: (_sectionId: string) => void;
  showSection: (_sectionId: string) => void;
  pinItem: (_itemId: string) => void;
  unpinItem: (_itemId: string) => void;
}

export type SidebarStore = SidebarState & SidebarActions;
