import {
  Calendar as CalendarIcon,
  SquareKanban as BoardIcon,
  TableProperties as TableIcon,
  BarChart3 as StatsIcon,
  Sparkles as AIIcon,
  Tag as TagIcon,
  FileText as TemplateIcon,
  Trash as TrashIcon,
} from 'lucide-react'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<any>
  isActive?: (pathname: string) => boolean
  badge?: number | string
  tooltip?: string
}

export interface NavigationSection {
  id: string
  label?: string
  items: NavigationItem[]
}

// L1 Primary Navigation Configuration
export const primaryNavigation: NavigationSection[] = [
  {
    id: 'views',
    label: 'Views',
    items: [
      {
        id: 'calendar',
        label: 'Calendar',
        href: '/calendar',
        icon: CalendarIcon,
        isActive: (pathname) => pathname.startsWith('/calendar'),
        tooltip: 'Calendar view'
      },
      {
        id: 'board',
        label: 'Board',
        href: '/board',
        icon: BoardIcon,
        isActive: (pathname) => pathname.startsWith('/board'),
        tooltip: 'Kanban board'
      },
      {
        id: 'table',
        label: 'Table',
        href: '/table',
        icon: TableIcon,
        isActive: (pathname) => pathname.startsWith('/table'),
        tooltip: 'Table view'
      },
      {
        id: 'stats',
        label: 'Stats',
        href: '/stats',
        icon: StatsIcon,
        isActive: (pathname) => pathname.startsWith('/stats'),
        tooltip: 'Statistics & Analytics'
      },
    ]
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      {
        id: 'ai-chat',
        label: 'AI assistant',
        href: '/ai-chat',
        icon: AIIcon,
        isActive: (pathname) => pathname.startsWith('/ai-chat'),
        tooltip: 'AI Assistant'
      },
      {
        id: 'all-tags',
        label: 'All tags',
        href: '/tags',
        icon: TagIcon,
        isActive: (pathname) => pathname.startsWith('/tags'),
        tooltip: 'View all tags'
      },
      {
        id: 'templates',
        label: 'Templates',
        href: '/templates',
        icon: TemplateIcon,
        isActive: (pathname) => pathname.startsWith('/templates'),
        tooltip: 'Event templates'
      },
      {
        id: 'trash',
        label: 'Trash',
        href: '/trash',
        icon: TrashIcon,
        isActive: (pathname) => pathname.startsWith('/trash'),
        tooltip: 'Deleted items'
      },
    ]
  },
  {
    id: 'smart-folders',
    label: 'Smart Folders',
    items: [
      // Smart folders will be dynamically populated
    ]
  }
]

// Page Configuration
export const pageConfig = {
  '/': { title: 'BoxLog', redirect: '/calendar' },
  '/calendar': { title: 'Calendar', description: 'スケジュールと予定の管理' },
  '/board': { title: 'Board', description: 'カンバン形式でタスクを管理' },
  '/table': { title: 'Table', description: 'テーブル形式でタスクを表示' },
  '/stats': { title: 'Stats', description: '分析と統計情報' },
  '/ai-chat': { title: 'AI Chat', description: 'AI assistant and document chat' },
  '/tags': { title: 'Tags', description: 'すべてのタグを管理' },
  '/templates': { title: 'Templates', description: 'イベントテンプレートの管理' },
  '/trash': { title: 'Trash', description: '削除されたアイテム' },
  '/help': { title: 'Help', description: 'Help and support' },
  '/settings': { title: 'Settings', description: 'アプリケーション設定' },
}

// Helper functions
export function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageConfig[pathname as keyof typeof pageConfig]) {
    return pageConfig[pathname as keyof typeof pageConfig].title
  }
  
  // Prefix match for sub-pages
  const matchedPath = Object.keys(pageConfig).find(path => 
    path !== '/' && pathname.startsWith(path)
  )
  
  if (matchedPath) {
    return pageConfig[matchedPath as keyof typeof pageConfig].title
  }
  
  return 'BoxLog'
}

export function getPageDescription(pathname: string): string {
  const config = pageConfig[pathname as keyof typeof pageConfig] ||
    Object.entries(pageConfig).find(([path]) => 
      path !== '/' && pathname.startsWith(path)
    )?.[1]
  
  return (config && 'description' in config) ? config.description : ''
}

export function isNavItemActive(item: NavigationItem, pathname: string): boolean {
  if (item.isActive) {
    return item.isActive(pathname)
  }
  return pathname === item.href || pathname.startsWith(`${item.href  }/`)
}