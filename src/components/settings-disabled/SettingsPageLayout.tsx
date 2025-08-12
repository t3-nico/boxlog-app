/**
 * 設定ページの共通レイアウトコンポーネント
 * 
 * 全ての設定ページで共通のコンテナスタイルとヘッダーを提供
 */

import React from 'react'

interface SettingsPageLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function SettingsPageLayout({ 
  title, 
  subtitle,
  children, 
  className = '' 
}: SettingsPageLayoutProps) {
  return (
    <div className={`mx-auto max-w-4xl space-y-8 p-8 ${className}`}>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}