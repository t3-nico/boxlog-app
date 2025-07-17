'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { ApplicationLayout } from './(app)/application-layout'

// 404ページのコンテンツコンポーネント（ThemeProvider内で使用）
function NotFoundContent() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
      <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon with theme-aware styling */}
          <div className="mb-8">
            <div className={`mx-auto w-28 h-28 rounded-full flex items-center justify-center mb-6 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
            }`}>
              {isDark ? (
                <Moon className="w-14 h-14 text-blue-400" />
              ) : (
                <Sun className="w-14 h-14 text-orange-500" />
              )}
            </div>
            <h1 className={`text-8xl font-bold select-none mb-2 ${
              isDark 
                ? 'bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent'
            }`}>
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              URLを確認するか、サイドメニューから移動してください
            </p>
          </div>

          {/* Theme indicator */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              {isDark ? (
                <>
                  <Moon className="w-3 h-3" />
                  ダークモード
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3" />
                  ライトモード
                </>
              )}
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