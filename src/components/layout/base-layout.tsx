import React from 'react'

import { BaseLayoutContent } from './base-layout-content'

interface BaseLayoutProps {
  children: React.ReactNode
}

/**
 * アプリケーション全体の基盤レイアウト
 *
 * Next.js公式パターン: Server Componentとして実装し、
 * Client ComponentはBaseLayoutContentに分離
 *
 * 注: Providersは app/layout.tsx で既にラップされているため、
 * ここでは重複してラップしない
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#moving-client-components-down-the-tree
 */
export function BaseLayout({ children }: BaseLayoutProps) {
  return <BaseLayoutContent>{children}</BaseLayoutContent>
}
