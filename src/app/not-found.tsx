'use client'

import React from 'react'
import { ApplicationLayout } from './(app)/application-layout'

// 404ページのコンテンツコンポーネント
function NotFoundContent() {
  return (
      <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl font-bold select-none mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              URLを確認するか、サイドメニューから移動してください
            </p>
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
    <ApplicationLayout events={events} reviews={reviews}>
      <NotFoundContent />
    </ApplicationLayout>
  )
}