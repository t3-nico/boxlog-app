// @ts-nocheck TODO(#621): Inspector削除後の一時的な型エラー回避
'use client'

// import { Inspector } from '@/features/inspector'
import React from 'react'

interface MainContentWrapperProps {
  children: React.ReactNode
}

/**
 * メインコンテンツラッパー
 *
 * main要素とInspectorを管理し、各ページが独自にoverflow設定を制御できるようにする
 *
 * 設計方針:
 * - overflow設定を強制しない（各ページで自由に設定可能）
 * - Inspectorとの並列配置を管理
 * - シンプルなレイアウト構造
 */
export function MainContentWrapper({ children }: MainContentWrapperProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <main id="main-content" className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" role="main">
        {children}
      </main>
      {/* TODO(#621): Inspector削除後、Tickets/Sessions統合後に再実装 */}
      {/* <Inspector /> */}
    </div>
  )
}
