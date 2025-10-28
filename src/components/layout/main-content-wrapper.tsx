'use client'

import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import React from 'react'

interface MainContentWrapperProps {
  children: React.ReactNode
}

/**
 * メインコンテンツラッパー
 *
 * main要素とTicketInspectorの並列配置を管理
 *
 * 設計方針:
 * - Inspector開いている時、メインコンテンツに右マージンを追加
 * - overflow設定を強制しない（各ページで自由に設定可能）
 * - シンプルなレイアウト構造
 */
export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const { isOpen: isInspectorOpen, width } = useTicketInspectorStore()

  return (
    <div
      className="flex min-h-0 flex-1 overflow-hidden transition-[margin] duration-200"
      style={isInspectorOpen ? { marginRight: `${width}px` } : undefined}
    >
      <main id="main-content" className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" role="main">
        {children}
      </main>
    </div>
  )
}
