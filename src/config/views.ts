import {
  Calendar as CalendarIcon,
  TableProperties as TableCellsIcon,
  BarChart3 as ChartBarIcon,
  SquareKanban as Squares2X2Icon,
} from 'lucide-react'

export const views = [
  {
    id: 'home',
    label: 'Dashboard',
    path: '/',
    icon: CalendarIcon,
    description: 'タスクの概要とダッシュボード',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    path: '/calendar',
    icon: CalendarIcon,
    description: 'スケジュールと予定の管理',
  },
  {
    id: 'table',
    label: 'Table',
    path: '/table',
    icon: TableCellsIcon,
    description: 'テーブル形式でタスクを表示',
  },
  {
    id: 'board',
    label: 'Board',
    path: '/board',
    icon: Squares2X2Icon,
    description: 'カンバン形式でタスクを管理',
  },
  {
    id: 'stats',
    label: 'Stats',
    path: '/stats',
    icon: ChartBarIcon,
    description: '分析と統計情報',
  },
]

export function getPageTitle(pathname: string): string {
  // ホームページの完全一致を最初にチェック
  if (pathname === '/') {
    return 'Dashboard'
  }
  
  // その他のページはstartsWith でチェック
  const currentView = views.find(view => 
    view.path !== '/' && pathname.startsWith(view.path)
  )
  return currentView?.label || 'BoxLog'
}

export function getPageDescription(pathname: string): string {
  const currentView = views.find(view => 
    pathname === view.path || pathname.startsWith(view.path)
  )
  return currentView?.description || ''
}

export function getCurrentViewIcon(pathname: string) {
  const currentView = views.find(view => 
    pathname === view.path || pathname.startsWith(view.path)
  )
  return currentView?.icon || null
}