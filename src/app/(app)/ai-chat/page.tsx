'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import { AiChatSkeleton } from '@/features/aichat/components/AiChatSkeleton'

// AI Chat機能を動的インポート（Bundle size最適化）
const AiChatSidebar = dynamic(() => import('@/features/aichat').then((mod) => ({ default: mod.AiChatSidebar })), {
  loading: () => <AiChatSkeleton />,
  ssr: false,
})

const AIChatPage = () => {
  const handleClose = React.useCallback(() => {
    // No-op in main view
  }, [])

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1">
        <AiChatSidebar isOpen={true} onClose={handleClose} isMainView={true} />
      </div>
    </div>
  )
}

export default AIChatPage
