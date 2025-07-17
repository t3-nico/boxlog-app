'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { ApplicationLayout } from './(app)/application-layout'

// 404ページのコンテンツコンポーネント
function NotFoundContent() {

  return (
      <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Large 404 Typography - Dominant, muted color */}
          <div>
            <h1 className="text-9xl font-bold select-none text-gray-400 dark:text-gray-500 leading-none">
              404
            </h1>
          </div>

          {/* Brief explanation */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              The page you're looking for doesn't exist
            </p>
          </div>

          {/* Message directing to sidebar - Small, with arrow */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ArrowLeft className="w-4 h-4 animate-pulse" />
            <span>Check the side menu to navigate</span>
          </div>
        </div>
      </div>
  )
}

export default function NotFound() {
  // Empty arrays for events and reviews since this is a 404 page
  const events: any[] = []
  const reviews: any[] = []

  return (
    <ApplicationLayout events={events} reviews={reviews} hideHeader={true}>
      <NotFoundContent />
    </ApplicationLayout>
  )
}