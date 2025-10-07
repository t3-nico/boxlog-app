'use client'

import React, { useCallback } from 'react'

import { useNavigationStore } from '@/features/navigation/stores/navigation.store'

/**
 * ResizeHandle - Sidebarリサイズハンドル
 *
 * 機能:
 * - マウスドラッグでSidebar幅を変更
 * - キーボード操作対応（矢印キー）
 * - 幅制限: 200px〜480px
 *
 * セマンティックトークン:
 * - bg-border: デフォルト状態
 * - hover:bg-primary: ホバー状態
 */
export function ResizeHandle() {
  const setSidebarWidth = useNavigationStore((state) => state.setSidebarWidth)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      const startX = e.clientX
      const startWidth = useNavigationStore.getState().sidebarWidth

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX
        const newWidth = startWidth + delta

        // 幅制限: 200px〜480px
        const constrainedWidth = Math.max(200, Math.min(480, newWidth))
        setSidebarWidth(constrainedWidth)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    },
    [setSidebarWidth]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentWidth = useNavigationStore.getState().sidebarWidth
      let newWidth = currentWidth

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          newWidth = Math.max(200, currentWidth - 10)
          break
        case 'ArrowRight':
          e.preventDefault()
          newWidth = Math.min(480, currentWidth + 10)
          break
        case 'Home':
          e.preventDefault()
          newWidth = 200 // 最小幅
          break
        case 'End':
          e.preventDefault()
          newWidth = 480 // 最大幅
          break
        default:
          return
      }

      setSidebarWidth(newWidth)
    },
    [setSidebarWidth]
  )

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuemin={200}
      aria-valuemax={480}
      aria-valuenow={useNavigationStore.getState().sidebarWidth}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className="group relative w-1 flex-shrink-0 cursor-ew-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* 実際の表示される線（中央に配置） */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-primary" />
    </div>
  )
}
