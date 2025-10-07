/**
 * AppBar/Sidebar Navigation Items
 *
 * Next.js 14 公式準拠: コロケーション原則に基づき、
 * ナビゲーション定義をUIコンポーネントと近接配置
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing
 * @see /CLAUDE.md - 公式ベストプラクティス優先
 */

import {
  Calendar as CalendarIcon,
  SquareKanban as BoardIcon,
  TableProperties as TableIcon,
  BarChart3 as StatsIcon,
  Sparkles as AIIcon,
  Tag as TagIcon,
  FileText as TemplateIcon,
  Trash as TrashIcon,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  tooltip?: string
}

export interface NavigationSection {
  id: string
  label?: string
  items: NavigationItem[]
}

// Views Section
export const viewsNavigation: NavigationItem[] = [
  {
    id: 'calendar',
    label: 'Calendar',
    href: '/calendar',
    icon: CalendarIcon,
    tooltip: 'Calendar view',
  },
  {
    id: 'board',
    label: 'Board',
    href: '/board',
    icon: BoardIcon,
    tooltip: 'Kanban board',
  },
  {
    id: 'table',
    label: 'Table',
    href: '/table',
    icon: TableIcon,
    tooltip: 'Table view',
  },
  {
    id: 'stats',
    label: 'Stats',
    href: '/stats',
    icon: StatsIcon,
    tooltip: 'Statistics & Analytics',
  },
]

// Tools Section
export const toolsNavigation: NavigationItem[] = [
  {
    id: 'ai-chat',
    label: 'AI assistant',
    href: '/ai-chat',
    icon: AIIcon,
    tooltip: 'AI Assistant',
  },
  {
    id: 'all-tags',
    label: 'All tags',
    href: '/tags',
    icon: TagIcon,
    tooltip: 'View all tags',
  },
  {
    id: 'templates',
    label: 'Templates',
    href: '/templates',
    icon: TemplateIcon,
    tooltip: 'Event templates',
  },
  {
    id: 'trash',
    label: 'Trash',
    href: '/trash',
    icon: TrashIcon,
    tooltip: 'Deleted items',
  },
]

// All Navigation Sections (for compatibility)
export const allNavigationSections: NavigationSection[] = [
  {
    id: 'views',
    label: 'Views',
    items: viewsNavigation,
  },
  {
    id: 'tools',
    label: 'Tools',
    items: toolsNavigation,
  },
  {
    id: 'smart-folders',
    label: 'Smart Folders',
    items: [], // Dynamically populated
  },
]

// Helper: Check if navigation item is active
export function isNavItemActive(item: NavigationItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
