'use client'

import React from 'react'

import { AiChatSidebar } from '@/features/aichat'

const AIChatPage = () => {
  const handleClose = React.useCallback(() => {
    // No-op in main view
  }, [])

  return (
    <div className="h-full flex">
      {/* Main chat area */}
      <div className="flex-1">
        <AiChatSidebar isOpen={true} onClose={handleClose} isMainView={true} />
      </div>
    </div>
  )
}

export default AIChatPage