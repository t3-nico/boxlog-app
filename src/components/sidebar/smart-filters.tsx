'use client'

import { useState } from 'react'
import {
  Folder,
  AlertTriangle,
  Plus,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { SidebarItem, SidebarLabel, SidebarSection, SidebarHeading } from '@/components/sidebar'

interface SmartFilter {
  id: string
  label: string
  count: number
  icon: string
  urgent?: boolean
  href: string
}

interface SmartFiltersProps {
  collapsed?: boolean
  currentPath?: string
}

const defaultFilters: SmartFilter[] = [
  {
    id: 'important-week',
    label: 'Important This Week',
    count: 8,
    icon: '⭐',
    href: '/filters/important-week'
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    count: 12,
    icon: '🔄',
    href: '/filters/in-progress'
  },
  {
    id: 'pending-review',
    label: 'Pending Review',
    count: 5,
    icon: '👀',
    href: '/filters/pending-review'
  },
  {
    id: 'overdue',
    label: 'Overdue',
    count: 3,
    icon: '⚠️',
    urgent: true,
    href: '/filters/overdue'
  }
]

export function SmartFilters({ collapsed = false, currentPath = '' }: SmartFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (collapsed) {
    return null
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-400 transition-colors duration-150"
        >
          {isExpanded ? (
            <ChevronDown className="size-3" data-slot="icon" />
          ) : (
            <ChevronRight className="size-3" data-slot="icon" />
          )}
          Smart Filters
        </button>
        <button
          className="p-1 text-gray-400 hover:text-gray-300 transition-colors duration-150"
          title="Create new filter"
        >
          <Plus className="size-3" data-slot="icon" />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-1">
          {defaultFilters.map((filter) => (
            <a
              key={filter.id}
              href={filter.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-200 hover:bg-gray-800 transition-colors duration-150"
            >
              <span className="text-sm">{filter.icon}</span>
              <span className="flex-1 text-sm">{filter.label}</span>
              <div className="flex items-center gap-1">
                {filter.urgent && (
                  <AlertTriangle className="size-3 text-red-400" data-slot="icon" />
                )}
                <span className="text-xs text-gray-400">
                  {filter.count}
                </span>
              </div>
            </a>
          ))}
          
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 transition-colors duration-150">
            <Plus className="size-4" data-slot="icon" />
            Create Filter
          </button>
        </div>
      )}
    </div>
  )
}