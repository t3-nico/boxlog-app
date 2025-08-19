/**
 * 空状態表示コンポーネント
 */

'use client'

import React, { memo } from 'react'
import type { EmptyStateProps } from '../../types/view.types'

export const EmptyState = memo<EmptyStateProps>(function EmptyState({
  message = 'イベントがありません',
  description = 'クリックして新しいイベントを作成しましょう',
  icon,
  action,
  className = ''
}) {
  const defaultIcon = (
    <div className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
      <svg
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
        className="w-full h-full"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  )
  
  return (
    <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${className}`}>
      {/* アイコン */}
      {icon || defaultIcon}
      
      {/* メッセージ */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {message}
      </h3>
      
      {/* 説明 */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {/* アクションボタン */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
})