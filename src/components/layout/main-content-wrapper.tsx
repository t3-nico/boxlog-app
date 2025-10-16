'use client'

import { Inspector } from '@/features/inspector'
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
    <div className="flex flex-1">
      <main id="main-content" className="relative flex-1" role="main">
        {children}
      </main>
      <Inspector />
    </div>
  )
}
