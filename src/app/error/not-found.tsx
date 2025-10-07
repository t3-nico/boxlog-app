'use client'

import { ArrowLeft } from 'lucide-react'

import { BaseLayout } from '@/components/base-layout'
import { cn } from '@/lib/utils'
import type { Event } from '@/types/unified'

// 404ページのコンテンツコンポーネント
const NotFoundContent = () => {
  return (
    <div
      className={cn(
        'flex flex-1 items-center justify-center p-6 min-h-screen py-12',
        'bg-white dark:bg-neutral-800'
      )}
    >
      <div className="w-full max-w-md text-center flex flex-col gap-6">
        {/* Large 404 Typography - Dominant, muted color */}
        <div>
          <h1 className="select-none text-9xl font-bold text-neutral-600 dark:text-neutral-400 leading-none">404</h1>
        </div>

        {/* Brief explanation */}
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-base leading-normal">
            The page you&apos;re looking for doesn&apos;t exist
          </p>
        </div>

        {/* Message directing to sidebar - Small, with arrow */}
        <div className="flex items-center justify-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
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
    <BaseLayout events={events} reviews={reviews}>
      <NotFoundContent />
    </BaseLayout>
  )
}

export default NotFound
