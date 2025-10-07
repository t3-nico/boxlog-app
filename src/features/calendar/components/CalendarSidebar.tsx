'use client'

import React from 'react'

import { Calendar, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SidebarHeader, SidebarSection } from '@/components/layout/sidebar/components'

/**
 * CalendarSidebar - カレンダーページ用のサイドバー
 */
export const CalendarSidebar = () => {
  return (
    <>
      {/* Header */}
      <SidebarHeader
        title="Calendar"
        icon={<Calendar className="h-5 w-5" />}
        action={
          <Button size="sm" variant="ghost">
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      {/* My Calendars Section */}
      <SidebarSection title="My Calendars" defaultOpen={true}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Work</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Personal</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span>Holidays</span>
          </label>
        </div>
      </SidebarSection>

      {/* Upcoming Events Section */}
      <SidebarSection title="Upcoming Events" defaultOpen={true}>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
            <div className="font-medium">Team Meeting</div>
            <div className="text-xs text-neutral-500">Today, 2:00 PM</div>
          </div>
          <div className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
            <div className="font-medium">Lunch Break</div>
            <div className="text-xs text-neutral-500">Today, 12:00 PM</div>
          </div>
        </div>
      </SidebarSection>
    </>
  )
}
