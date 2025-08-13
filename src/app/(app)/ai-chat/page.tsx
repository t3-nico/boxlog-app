'use client'

import React from 'react'
import { AiChatSidebar } from '@/features/aichat'

export default function AIChatPage() {
  return (
    <div className="h-full flex">
      {/* Main chat area */}
      <div className="flex-1">
        <AiChatSidebar isOpen={true} onClose={() => {}} isMainView={true} />
      </div>
    </div>
  )
}