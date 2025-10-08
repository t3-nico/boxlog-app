'use client'

import { ArrowLeft } from 'lucide-react'

import { BaseLayout } from '@/components/base-layout'
import { cn } from '@/lib/utils'

// 404ページのコンテンツコンポーネント
const NotFoundContent = () => {
  return (
    <div
      className={cn('flex min-h-screen flex-1 items-center justify-center p-6 py-12', 'bg-white dark:bg-neutral-800')}
    >
      <div className="flex w-full max-w-md flex-col gap-6 text-center">
        {/* Large 404 Typography - Dominant, muted color */}
        <div>
          <h1 className="text-9xl leading-none font-bold text-neutral-600 select-none dark:text-neutral-400">404</h1>
        </div>

        {/* Brief explanation */}
        <div>
          <p className="text-base leading-normal text-neutral-800 dark:text-neutral-200">
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
  return (
    <BaseLayout>
      <NotFoundContent />
    </BaseLayout>
  )
}

export default NotFound
