'use client'

import type { ReactNode } from 'react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { zIndex } from '@/config/ui/z-index'
import { useMediaQuery } from '@/hooks/useMediaQuery'

import { INSPECTOR_SIZE, useInspectorResize } from '../hooks'

/**
 * Inspector表示モード
 */
export type InspectorDisplayMode = 'sheet' | 'popover'

interface InspectorShellProps {
  /** Inspectorが開いているか */
  isOpen: boolean
  /** 閉じるハンドラー */
  onClose: () => void
  /** 表示モード */
  displayMode: InspectorDisplayMode
  /** アクセシビリティ用タイトル（sr-only） */
  title: string
  /** コンテンツ */
  children: ReactNode
  /** リサイズを有効にするか（Sheetモードのみ、デフォルト: true） */
  resizable?: boolean
  /** 初期幅 */
  initialWidth?: number
  /** モーダルモード（デフォルト: false） */
  modal?: boolean
}

/**
 * Inspector共通シェル
 *
 * Sheet（サイドパネル）またはDialog（ポップアップ）として表示
 * - リサイズ機能（Sheetモード）
 * - z-index管理（STYLE_GUIDE準拠）
 * - アクセシビリティ対応
 *
 * @example
 * ```tsx
 * <InspectorShell
 *   isOpen={isOpen}
 *   onClose={closeInspector}
 *   displayMode={displayMode}
 *   title="プランの詳細"
 * >
 *   <InspectorContent>...</InspectorContent>
 * </InspectorShell>
 * ```
 */
export function InspectorShell({
  isOpen,
  onClose,
  displayMode,
  title,
  children,
  resizable = true,
  initialWidth = INSPECTOR_SIZE.default,
  modal = false,
}: InspectorShellProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { inspectorWidth, isResizing, handleMouseDown } = useInspectorResize({
    initialWidth,
    enabled: displayMode === 'sheet' && resizable && !isMobile,
  })

  if (!isOpen) return null

  // モバイル: 下からのDrawer（ボトムシート）
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent
          className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0"
          style={{ zIndex: zIndex.modal }}
        >
          <DrawerTitle className="sr-only">{title}</DrawerTitle>
          {children}
        </DrawerContent>
      </Drawer>
    )
  }

  // PC: Sheet mode
  if (displayMode === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()} modal={modal}>
        <SheetContent
          className="gap-0 overflow-y-auto p-0"
          style={{
            width: `${inspectorWidth}px`,
            zIndex: zIndex.sheet,
          }}
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>

          {/* リサイズハンドル */}
          {resizable && (
            <div
              onMouseDown={handleMouseDown}
              className={`hover:bg-primary-state-hover absolute top-0 left-0 z-20 h-full w-1 cursor-ew-resize ${
                isResizing ? 'bg-primary' : ''
              }`}
              style={{ touchAction: 'none' }}
              role="separator"
              aria-orientation="vertical"
              aria-label="リサイズハンドル"
            />
          )}

          {children}
        </SheetContent>
      </Sheet>
    )
  }

  // PC: Dialog/Popover mode
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={modal}>
      <DialogContent
        className="flex h-[40rem] w-[95vw] max-w-[28rem] flex-col gap-0 overflow-hidden p-0"
        style={{ zIndex: zIndex.modal }}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
}
