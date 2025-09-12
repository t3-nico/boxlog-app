import { useEffect } from 'react'

import type { DragState, DragHandlers } from './useDragAndDrop'

/**
 * グローバルドラッグカーソル管理フック
 * 全カレンダービューでドラッグ・リサイズ時のカーソル統一
 * 
 * @param dragState ドラッグ状態
 * @param handlers マウスイベントハンドラー
 */
export function useGlobalDragCursor(
  dragState: DragState,
  handlers: DragHandlers
) {
  useEffect(() => {
    if (dragState.isDragging || dragState.isResizing) {
      // グローバルマウスイベントリスナーを追加
      document.addEventListener('mousemove', handlers.handleMouseMove)
      document.addEventListener('mouseup', handlers.handleMouseUp)
      
      // リサイズ中は全画面でカーソルを強制的に固定
      if (dragState.isResizing) {
        document.body.style.setProperty('cursor', 'ns-resize', 'important')
        document.body.style.setProperty('user-select', 'none', 'important')
        document.documentElement.style.setProperty('cursor', 'ns-resize', 'important')
        
        // 全ての要素にカーソルを適用
        const style = document.createElement('style')
        style.id = 'resize-cursor-override'
        style.textContent = '* { cursor: ns-resize !important; }'
        document.head.appendChild(style)
      } else if (dragState.isDragging) {
        // ドラッグ中はgrabbing カーソル - より強力な適用
        document.body.style.setProperty('cursor', 'grabbing', 'important')
        document.body.style.setProperty('user-select', 'none', 'important')
        document.documentElement.style.setProperty('cursor', 'grabbing', 'important')
        
        // 全ての要素にカーソルを適用（Tailwindクラス優先度対策）
        const style = document.createElement('style')
        style.id = 'drag-cursor-override'
        style.textContent = '* { cursor: grabbing !important; }'
        document.head.appendChild(style)
      }
      
      // クリーンアップ関数
      return () => {
        // マウスイベントリスナーを削除
        document.removeEventListener('mousemove', handlers.handleMouseMove)
        document.removeEventListener('mouseup', handlers.handleMouseUp)
        
        // カーソルを完全にリセット
        document.body.style.removeProperty('cursor')
        document.body.style.removeProperty('user-select')
        document.documentElement.style.removeProperty('cursor')
        
        // CSSオーバーライドを削除
        const resizeStyleEl = document.getElementById('resize-cursor-override')
        if (resizeStyleEl) {
          resizeStyleEl.remove()
        }
        const dragStyleEl = document.getElementById('drag-cursor-override')
        if (dragStyleEl) {
          dragStyleEl.remove()
        }
      }
    }
  }, [
    dragState.isDragging, 
    dragState.isResizing, 
    handlers.handleMouseMove, 
    handlers.handleMouseUp
  ])
}