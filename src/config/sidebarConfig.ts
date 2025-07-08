export interface MenuItem {
  id: string
  label: string
  icon: string // アイコン名（文字列）
  href: string
  tooltip: string
  badge?: string
  requiresFeature?: string[]
  minPlan?: 'free' | 'pro' | 'enterprise'
  count?: number // 動的アイテム用
}

export interface MenuSection {
  id: string
  title?: string // セクションタイトル（undefinedの場合はタイトルなし）
  items: MenuItem[]
  requiresAuth?: boolean
  minPlan?: 'free' | 'pro' | 'enterprise'
  maxItems?: number // 無料プランでの表示制限
}

export const sidebarConfig: MenuSection[] = [
  // アクション系（最重要）
  {
    id: 'actions',
    items: [
      {
        id: 'create',
        label: 'Create New',
        icon: 'PlusCircleIcon',
        href: '/add',
        tooltip: 'Add new events, tasks, and time blocks',
      }
    ]
  },
  
  // 検索
  {
    id: 'search',
    items: [
      {
        id: 'search',
        label: 'Search...',
        icon: 'MagnifyingGlassIcon',
        href: '/search',
        tooltip: 'Search through your tasks and events',
      }
    ]
  },
  
  // ビュー系
  {
    id: 'views',
    title: 'Views',
    items: [
      {
        id: 'calendar',
        label: 'Calendar',
        icon: 'CalendarIcon',
        href: '/calendar',
        tooltip: 'View and manage your schedule'
      },
      {
        id: 'table',
        label: 'Table',
        icon: 'TableCellsIcon',
        href: '/table',
        tooltip: 'View tasks in table format'
      },
      {
        id: 'board',
        label: 'Board',
        icon: 'ViewColumnsIcon',
        href: '/board',
        tooltip: 'Kanban board view of your tasks'
      },
      {
        id: 'stats',
        label: 'Stats',
        icon: 'ChartBarIcon',
        href: '/stats',
        tooltip: 'View productivity analytics and insights'
      }
    ]
  },
  
  // スマートフォルダ
  {
    id: 'smart-folders',
    title: 'Smart Folders',
    items: [], // 動的生成
    minPlan: 'pro',
    maxItems: 2 // 無料プランは2個まで
  },
  
  // タグ
  {
    id: 'tags',
    title: 'Tags',
    items: [], // 動的生成
    maxItems: 5 // 無料プランは5個まで
  },
  
  // ヘルプ・アップグレード
  {
    id: 'support',
    items: [
      {
        id: 'help',
        label: 'Help',
        icon: 'QuestionMarkCircleIcon',
        href: '/help',
        tooltip: 'Get help and support'
      },
      {
        id: 'upgrade',
        label: 'Upgrade',
        icon: 'StarIcon',
        href: '/upgrade',
        tooltip: 'Unlock premium features',
        minPlan: 'free' // 無料プランのみ表示
      }
    ]
  }
]