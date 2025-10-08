'use client'

import { BarChart3, Calendar, HelpCircle, Search, Settings, SquareKanban, Table as TableIcon } from 'lucide-react'

import { useAuthContext } from '@/features/auth'

import { NavMain } from './nav-main'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'

const data = {
  navMain: [
    {
      title: 'Calendar',
      url: '/ja/calendar',
      icon: Calendar,
    },
    {
      title: 'Board',
      url: '/ja/board',
      icon: SquareKanban,
    },
    {
      title: 'Table',
      url: '/ja/table',
      icon: TableIcon,
    },
    {
      title: 'Stats',
      url: '/ja/stats',
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/ja/settings',
      icon: Settings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircle,
    },
    {
      title: 'Search',
      url: '#',
      icon: Search,
    },
  ],
}

export function AppSidebar() {
  const { user } = useAuthContext()

  const userData = {
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: user?.user_metadata?.avatar_url,
  }

  return (
    <aside className="bg-secondary flex h-full w-64 flex-col px-4 py-2">
      {/* Header - User Menu */}
      <div className="mb-4">
        <NavUser user={userData} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </div>
    </aside>
  )
}
