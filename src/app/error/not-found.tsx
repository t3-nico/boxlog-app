'use client'

import React from 'react'

import { ArrowLeft } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/layout'
import { colors, typography, spacing } from '@/config/theme'

// 404ページのコンテンツコンポーネント
const NotFoundContent = () => {

  return (
      <div className={`flex-1 flex items-center justify-center ${spacing.padding.lg} py-12 min-h-screen ${colors.background.surface}`}>
        <div className={`max-w-md w-full text-center ${spacing.stack.lg}`}>
          {/* Large 404 Typography - Dominant, muted color */}
          <div>
            <h1 className={`text-9xl font-bold select-none ${colors.text.tertiary} leading-none`}>
              404
            </h1>
          </div>

          {/* Brief explanation */}
          <div>
            <p className={`${colors.text.secondary} ${typography.body.base}`}>
              The page you&apos;re looking for doesn&apos;t exist
            </p>
          </div>

          {/* Message directing to sidebar - Small, with arrow */}
          <div className={`flex items-center justify-center gap-2 ${typography.body.sm} ${colors.text.secondary}`}>
            <ArrowLeft className="w-4 h-4 animate-pulse" />
            <span>Check the side menu to navigate</span>
          </div>
        </div>
      </div>
  )
}

const NotFound = () => {
  // Empty arrays for events and reviews since this is a 404 page
  const events: any[] = []
  const reviews: any[] = []

  return (
    <DashboardLayout events={events} reviews={reviews}>
      <NotFoundContent />
    </DashboardLayout>
  )
}

export default NotFound