'use client'

import React from 'react'
import { useNavigationStore } from '@/store/navigation.store'
import { PanelLeft } from 'lucide-react'
interface SecondaryNavHeaderProps {
  title: string
}

export function SecondaryNavHeader({ title }: SecondaryNavHeaderProps) {
  const { setSecondaryNavCollapsed } = useNavigationStore()

  return (
    <div className="flex-shrink-0 mb-4">
      <div className="px-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {title}
        </h1>
        
        <button
          onClick={() => setSecondaryNavCollapsed(true)}
          className="p-1 rounded-md hover:bg-accent/50 transition-colors"
          title="Close sidebar"
        >
          <PanelLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}