'use client'

import React from 'react'
import { useNavigationStore } from '@/store/navigation.store'
import { Sparkles as SparklesIcon } from 'lucide-react'

export function RightPanelActions() {
  const { setAIChatOpen } = useNavigationStore()

  return (
    <div className="w-12 bg-background border-l border-border flex flex-col items-center py-4 gap-2 z-40">
      <button
        onClick={() => setAIChatOpen(true)}
        className="p-2 rounded-lg transition-colors hover:bg-accent/50 text-gray-600 dark:text-gray-400"
        title="AI Assistant"
      >
        <SparklesIcon className="w-5 h-5" />
      </button>
    </div>
  )
}