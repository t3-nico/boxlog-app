'use client'

import React from 'react'
import Link from 'next/link'
import { FileQuestion, Calendar, Table, SquareKanban, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export default function NotFoundPage() {
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
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            ページが見つかりません
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            URLを確認するか、サイドメニューから移動してください
          </p>
        </div>

        {/* Quick Navigation with theme-aware cards */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              よく使う機能
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/calendar"
                className={`flex items-center gap-2 p-4 rounded-xl transition-all duration-200 group ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-blue-600'
                    : 'bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow'
                }`}
              >
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  カレンダー
                </span>
              </Link>
              
              <Link 
                href="/table"
                className={`flex items-center gap-2 p-4 rounded-xl transition-all duration-200 group ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-green-600'
                    : 'bg-white border border-gray-200 hover:bg-green-50 hover:border-green-300 shadow-sm hover:shadow'
                }`}
              >
                <Table className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                  テーブル
                </span>
              </Link>
              
              <Link 
                href="/board"
                className={`flex items-center gap-2 p-4 rounded-xl transition-all duration-200 group ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-purple-600'
                    : 'bg-white border border-gray-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow'
                }`}
              >
                <SquareKanban className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  ボード
                </span>
              </Link>
              
              <Link 
                href="/settings"
                className={`flex items-center gap-2 p-4 rounded-xl transition-all duration-200 group ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                    : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow'
                }`}
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-400">
                  設定
                </span>
              </Link>
            </div>
          </div>
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