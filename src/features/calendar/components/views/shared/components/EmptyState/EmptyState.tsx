/**
 * 空状態表示コンポーネント
 */

'use client'

import React, { memo } from 'react'

import type { EmptyStateProps } from '../../types/view.types'

export const EmptyState = memo<EmptyStateProps>(function EmptyState({
  title = 'No events',
  description = 'Click to create a new event',
  icon,
  actions,
  hint,
  className = ''
}) {
  // アイコンの処理：コンポーネント型の場合はJSX要素として展開
  const renderIcon = () => {
    if (!icon) {
      // デフォルトアイコン
      return (
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )
    }
    
    // アイコンがコンポーネント型の場合
    if (typeof icon === 'function') {
      const IconComponent = icon
      return (
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <IconComponent className="w-8 h-8 text-muted-foreground" />
        </div>
      )
    }
    
    // ReactNodeの場合はそのまま表示
    return icon
  }
  
  return (
    <div className={`flex flex-col items-center justify-center h-full p-8 text-center ${className}`}>
      {/* アイコン */}
      {renderIcon()}
      
      {/* タイトル */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      {/* 説明 */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {/* アクションボタン */}
      {actions && (
        <div className="mb-6">
          {actions}
        </div>
      )}
      
      {/* ヒント */}
      {hint && (
        <div className="mt-8 text-xs text-muted-foreground max-w-sm">
          <p>{hint}</p>
        </div>
      )}
    </div>
  )
})