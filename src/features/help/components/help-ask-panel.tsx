'use client'

import React from 'react'
import { AskPanel } from './ask-panel'
import { useAskPanelStore } from '../stores/useAskPanelStore'

export function HelpAskPanel() {
  const { open, expand } = useAskPanelStore()

  // Ensure the panel is open and not collapsed when used in main content
  React.useEffect(() => {
    open() // Open the panel
    expand() // Ensure it's not collapsed
  }, [open, expand])

  return (
    <div className="h-full w-full max-w-6xl mx-auto">
      <div className="h-full flex justify-center">
        <div className="w-full max-w-4xl">
          <AskPanel />
        </div>
      </div>
    </div>
  )
}