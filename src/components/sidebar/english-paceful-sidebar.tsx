'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Search as MagnifyingGlassIcon,
  Plus as PlusIcon,
  Calendar as CalendarIcon,
  Table as TableCellsIcon,
  Columns3 as ViewColumnsIcon,
  BarChart3 as ChartBarIcon,
  Bell as BellIcon,
  Heart as HeartIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarLabel } from '@/components/sidebar'
import { UserProfile } from './user-profile'
import { SmartFilters } from './smart-filters'
import { TagTree } from './tag-tree'

interface EnglishPacefulSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function EnglishPacefulSidebar({ collapsed = false, onToggleCollapse }: EnglishPacefulSidebarProps) {
  const pathname = usePathname()
  const [notificationCount] = useState(3)

  const handleTagSelect = (tagId: string) => {
    // TODO: Implement tag filtering logic
    console.log('Selected tag:', tagId)
  }

  return (
    <div className="w-60 h-full bg-gray-900 flex flex-col">
    <Sidebar collapsed={collapsed} className="flex-1">
      {/* Header */}
      <SidebarHeader className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">P</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-medium text-gray-200">
              Paceful
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-gray-800 rounded-md transition-colors duration-150"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeftIcon className="size-4 text-gray-400" />
        </button>
      </SidebarHeader>

      <SidebarBody className="flex flex-col h-full space-y-6">
        {/* User Profile */}
        <UserProfile collapsed={collapsed} />

        {/* Quick Actions */}
        {!collapsed && (
          <div className="px-4">
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 text-sm bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:bg-gray-700 transition-colors duration-150"
                />
              </div>

              {/* Create New Button */}
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors duration-150">
                <PlusIcon className="size-4" />
                Create New
              </button>
            </div>
          </div>
        )}

        {/* Views Navigation */}
        {!collapsed && (
          <div className="px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Views
            </h3>
            <div className="space-y-1">
              <a href="/calendar" className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-200 hover:bg-gray-800 transition-colors duration-150 ${pathname === '/calendar' ? 'eagle-item-selected' : ''}`}>
                <CalendarIcon className="size-4 text-gray-400" />
                <span className="text-sm">Calendar</span>
              </a>
              <a href="/table" className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-200 hover:bg-gray-800 transition-colors duration-150 ${pathname === '/table' ? 'eagle-item-selected' : ''}`}>
                <TableCellsIcon className="size-4 text-gray-400" />
                <span className="text-sm">Table</span>
              </a>
              <a href="/board" className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-200 hover:bg-gray-800 transition-colors duration-150 ${pathname === '/board' ? 'eagle-item-selected' : ''}`}>
                <ViewColumnsIcon className="size-4 text-gray-400" />
                <span className="text-sm">Board</span>
              </a>
              <a href="/analytics" className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-200 hover:bg-gray-800 transition-colors duration-150 ${pathname === '/analytics' ? 'eagle-item-selected' : ''}`}>
                <ChartBarIcon className="size-4 text-gray-400" />
                <span className="text-sm">Analytics</span>
              </a>
            </div>
          </div>
        )}

        {/* Smart Filters */}
        <SmartFilters collapsed={collapsed} currentPath={pathname} />

        {/* Tag System */}
        <TagTree 
          collapsed={collapsed} 
          currentPath={pathname}
          onTagSelect={handleTagSelect}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer Actions */}
        {!collapsed && (
          <div className="px-4 py-4">
            <div className="space-y-1">
              <a href="/values" className="flex items-center gap-3 px-3 py-2 text-gray-200 hover:bg-gray-800 transition-colors duration-150">
                <HeartIcon className="size-4 text-gray-400" />
                <span className="text-sm">Values</span>
              </a>
              <a href="/notifications" className="flex items-center gap-3 px-3 py-2 text-gray-200 hover:bg-gray-800 transition-colors duration-150">
                <div className="relative">
                  <BellIcon className="size-4 text-gray-400" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 text-xs font-medium text-white bg-red-500 rounded-full flex items-center justify-center">
                      {notificationCount > 3 ? '3+' : notificationCount}
                    </span>
                  )}
                </div>
                <span className="text-sm">Notifications</span>
              </a>
            </div>
          </div>
        )}
      </SidebarBody>
    </Sidebar>
    </div>
  )
}