'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useInspectorStore } from './stores/inspector.store'
import { CalendarInspectorContent } from './content/CalendarInspectorContent'
import { TaskInspectorContent } from './content/TaskInspectorContent'
import { DefaultInspectorContent } from './content/DefaultInspectorContent'
import { background, text } from '@/config/theme/colors'

export function InspectorContent() {
  const pathname = usePathname()
  const activeContent = useInspectorStore((state) => state.activeContent)
  
  // ページに基づいたコンテンツの決定
  const getContentComponent = () => {
    // 明示的にactiveContentが設定されている場合はそれを優先
    if (activeContent) {
      switch (activeContent) {
        case 'calendar':
          return <CalendarInspectorContent />
        case 'task':
          return <TaskInspectorContent />
        case 'event':
          return <CalendarInspectorContent />
        default:
          return <DefaultInspectorContent />
      }
    }
    
    // パスに基づいた自動判定
    if (pathname.startsWith('/calendar')) {
      return <CalendarInspectorContent />
    }
    
    if (pathname.startsWith('/tasks')) {
      return <TaskInspectorContent />
    }
    
    return <DefaultInspectorContent />
  }
  
  return (
    <div className={cn(
      'flex-1 overflow-hidden',
      background.surface
    )}>
      {getContentComponent()}
    </div>
  )
}