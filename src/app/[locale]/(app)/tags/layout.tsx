import type { ReactNode } from 'react'

interface TagsLayoutProps {
  children: ReactNode
}

/**
 * Tags共通レイアウト
 *
 * TagsPageProviderはbase-layout-content.tsxで提供
 * モバイルメニューはTagsPageHeaderで提供
 */
export default function TagsLayout({ children }: TagsLayoutProps) {
  return <>{children}</>
}
