import React from 'react'

import { BaseLayoutContent } from './base-layout-content'
import { Providers } from './providers'

interface BaseLayoutProps {
  children: React.ReactNode
}

/**
 * アプリケーション全体の基盤レイアウト
 *
 * Next.js公式パターン: Server Componentとして実装し、
 * Client ComponentはProvidersとBaseLayoutContentに分離
 *
 * @see https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#moving-client-components-down-the-tree
 */
export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <Providers>
      <BaseLayoutContent>{children}</BaseLayoutContent>
    </Providers>
  )
}
