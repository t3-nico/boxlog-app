'use client'

import { ArrowLeft } from 'lucide-react'

import { DashboardLayout } from '@/components/layout/layout'
import { colors, spacing, typography } from '@/config/theme'
import type { Event } from '@/types/unified'

// 404ページのコンテンツコンポーネント
const NotFoundContent = () => {
  return (
    <div
      className={`flex flex-1 items-center justify-center ${spacing.padding.lg} min-h-screen py-12 ${colors.background.surface}`}
    >
      <div className={`w-full max-w-md text-center ${spacing.stack.lg}`}>
        {/* Large 404 Typography - Dominant, muted color */}
        <div>
          <h1 className={`select-none text-9xl font-bold ${colors.text.tertiary} leading-none`}>404</h1>
        </div>

        {/* Brief explanation */}
        <div>
          <p className={`${colors.text.secondary} ${typography.body.base}`}>
            The page you&apos;re looking for doesn&apos;t exist
          </p>
        </div>

        {/* Message directing to sidebar - Small, with arrow */}
        <div className={`flex items-center justify-center gap-2 ${typography.body.sm} ${colors.text.secondary}`}>
          <ArrowLeft className="h-4 w-4 animate-pulse" />
          <span>Check the side menu to navigate</span>
        </div>
      </div>
    </div>
  )
}

const NotFound = () => {
  // Empty arrays for events and reviews since this is a 404 page
  const events: Event[] = []
  const reviews: unknown[] = []

  return (
    <DashboardLayout events={events} reviews={reviews}>
      <NotFoundContent />
    </DashboardLayout>
  )
}

export default NotFound
