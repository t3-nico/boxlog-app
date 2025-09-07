'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useInspectorStore } from './stores/inspector.store'
import { background, text, border } from '@/config/theme/colors'
import { componentRadius, animations } from '@/config/theme'
import { PanelRightClose } from 'lucide-react'

export function InspectorHeader() {
  const { toggleInspector } = useInspectorStore()
  
  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 border-b',
      border.subtle
    )}>
      {/* Inspector Title */}
      <div className={cn(
        'flex items-center gap-2',
        text.primary,
        'font-medium text-sm'
      )}>
        <span>詳細情報</span>
      </div>

      {/* Close Inspector Button */}
      <button
        onClick={() => toggleInspector()}
        className={cn(
          'w-8 h-8 flex items-center justify-center hover:bg-accent',
          componentRadius.button.sm,
          animations.transition.fast,
          'flex-shrink-0'
        )}
      >
        <PanelRightClose className="w-4 h-4" />
      </button>
    </div>
  )
}