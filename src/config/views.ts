import {
  Calendar as CalendarIcon,
  TableProperties as TableCellsIcon,
  BarChart3 as ChartBarIcon,
  SquareKanban as Squares2X2Icon,
} from 'lucide-react'

export const views = [
  {
    id: 'calendar',
    label: 'Calendar',
    path: '/calendar',
    icon: CalendarIcon,
  },
  {
    id: 'table',
    label: 'Table',
    path: '/table',
    icon: TableCellsIcon,
  },
  {
    id: 'board',
    label: 'Board',
    path: '/board',
    icon: Squares2X2Icon,
  },
  {
    id: 'stats',
    label: 'Stats',
    path: '/stats',
    icon: ChartBarIcon,
  },
]

export function getPageTitle(pathname: string): string {
  const currentView = views.find(view => 
    pathname === view.path || pathname.startsWith(view.path)
  )
  return currentView?.label || 'BoxLog'
}

export function getCurrentViewIcon(pathname: string) {
  const currentView = views.find(view => 
    pathname === view.path || pathname.startsWith(view.path)
  )
  return currentView?.icon || null
}