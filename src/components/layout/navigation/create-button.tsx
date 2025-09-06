'use client'

import React from 'react'
import { CreateEventTrigger } from '@/features/events/components/create/CreateEventTrigger'
import { SidebarSection } from './shared'
import { usePathname } from 'next/navigation'

export function CreateButton() {
  const pathname = usePathname()
  
  // パスに応じてsourceを決定
  let source: 'calendar' | 'table' | 'kanban' | 'sidebar' = 'sidebar'
  if (pathname.startsWith('/calendar')) {
    source = 'calendar'
  } else if (pathname.startsWith('/table')) {
    source = 'table'
  } else if (pathname.startsWith('/board')) {
    source = 'kanban'
  }

  return (
    <div className="flex-shrink-0 mb-4">
      <SidebarSection>
        <div className="relative">
          <CreateEventTrigger variant="sidebar" source={source} />
        </div>
      </SidebarSection>
    </div>
  )
}