'use client'

import React from 'react'
import { useNavigationStore } from '@/store/navigation.store'
import { PanelLeft, PanelRight } from 'lucide-react'

export function RightPanelToggle() {
  const { 
    isRightPanelHidden, 
    isAIChatOpen, 
    isCodebaseAIChatOpen,
    toggleRightPanel 
  } = useNavigationStore()

  // Only show toggle when no AI chat is open
  if (isAIChatOpen || isCodebaseAIChatOpen) {
    return null
  }

  return (
    <button
      onClick={toggleRightPanel}
      className={`fixed right-2 bottom-4 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 z-40 ${
        isRightPanelHidden 
          ? 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      title={isRightPanelHidden ? "Show sidebar" : "Hide sidebar"}
    >
      {isRightPanelHidden ? (
        <PanelLeft className="w-5 h-5" />
      ) : (
        <PanelRight className="w-5 h-5" />
      )}
    </button>
  )
}