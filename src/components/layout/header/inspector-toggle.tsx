'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useInspectorStore } from '@/components/layout/inspector/stores/inspector.store'
import { ghost } from '@/config/theme/colors'
import { componentRadius, animations, layout, icon } from '@/config/theme'
import { PanelRightOpen } from 'lucide-react'

const { compact } = layout.heights.header
const { sm } = icon.size

export function InspectorToggle() {
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const { toggleInspector } = useInspectorStore()

  // Inspectorが開いている場合は何も表示しない
  if (isInspectorOpen) {
    return null
  }

  return (
    <div className={cn(
      'flex items-center justify-end',
      compact // 40px height
    )}>
      <button
        onClick={() => toggleInspector()}
        className={cn(
          'w-8 h-8 flex items-center justify-center',
          componentRadius.button.sm,
          animations.transition.fast,
          ghost.text,
          ghost.hover,
          ghost.active,
          'flex-shrink-0'
        )}
        title="Inspector を開く"
      >
        <PanelRightOpen className={sm} />
      </button>
    </div>
  )
}