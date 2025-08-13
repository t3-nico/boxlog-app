'use client'

import React from 'react'
import { useNavigationStore } from '@/store/navigation.store'
import { PanelLeft, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SecondaryNavHeaderProps {
  title: string
  isSettings?: boolean
}

export function SecondaryNavHeader({ title, isSettings = false }: SecondaryNavHeaderProps) {
  const { setSecondaryNavCollapsed } = useNavigationStore()
  const router = useRouter()

  return (
    <div className="flex-shrink-0 mb-4">
      <div className="px-2 flex items-center justify-between">
        {isSettings ? (
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to app</span>
          </button>
        ) : (
          <h1 className="text-xl font-semibold text-foreground">
            {title}
          </h1>
        )}
        
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