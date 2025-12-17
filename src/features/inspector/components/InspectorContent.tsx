'use client'

import type { ReactNode } from 'react'

interface InspectorContentProps {
  /** ローディング中かどうか */
  isLoading?: boolean
  /** データが存在しない場合のメッセージ */
  emptyMessage?: string
  /** データが存在するか */
  hasData?: boolean
  /** コンテンツ */
  children: ReactNode
  /** ローディングコンポーネント（カスタム） */
  loadingComponent?: ReactNode
  /** 空状態コンポーネント（カスタム） */
  emptyComponent?: ReactNode
}

/**
 * Inspectorコンテンツラッパー
 *
 * ローディング状態と空状態を統一的に処理
 *
 * @example
 * ```tsx
 * <InspectorContent
 *   isLoading={isLoading}
 *   hasData={!!plan}
 *   emptyMessage="プランが見つかりません"
 * >
 *   <PlanDetails plan={plan} />
 * </InspectorContent>
 * ```
 */
export function InspectorContent({
  isLoading = false,
  emptyMessage = 'データが見つかりません',
  hasData = true,
  children,
  loadingComponent,
  emptyComponent,
}: InspectorContentProps) {
  // ローディング状態
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
      </div>
    )
  }

  // 空状態
  if (!hasData) {
    if (emptyComponent) {
      return <>{emptyComponent}</>
    }
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // 通常コンテンツ
  return <>{children}</>
}
