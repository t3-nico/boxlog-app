'use client'

import React from 'react'

import dynamic from 'next/dynamic'

import { FeatureErrorBoundary } from '@/components/error-boundary'
import { AiChatSkeleton } from '@/features/aichat/components/AiChatSkeleton'
import { useI18n } from '@/lib/i18n/hooks'

// AI Chat機能を動的インポート（Bundle size最適化）
const AiChatSidebar = dynamic(() => import('@/features/aichat').then((mod) => ({ default: mod.AiChatSidebar })), {
  loading: () => <AiChatSkeleton />,
  ssr: false,
})

const AIChatPage = () => {
  const { t } = useI18n()

  const handleClose = React.useCallback(() => {
    // No-op in main view
  }, [])

  return (
    <FeatureErrorBoundary
      featureName="ai-chat"
      fallback={
        <div className="bg-neutral-200 dark:bg-neutral-700 p-4 rounded border border-neutral-300 dark:border-neutral-600">
          <p className="text-neutral-800 dark:text-neutral-200 text-center">
            {t('aiChat.errors.loadingFailed')}
          </p>
        </div>
      }
    >
      <div className="flex h-full">
        {/* Main chat area */}
        <div className="flex-1">
          <AiChatSidebar isOpen={true} onClose={handleClose} isMainView={true} />
        </div>
      </div>
    </FeatureErrorBoundary>
  )
}

export default AIChatPage
