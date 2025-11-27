'use client'

import { Archive, Inbox, Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/features/i18n/lib/hooks'
import { SidebarHeader } from '@/features/navigation/components/sidebar/SidebarHeader'

import { useInboxViewStore } from '../stores/useInboxViewStore'

interface InboxSidebarProps {
  isLoading?: boolean
  activeplansCount?: number
  archivedplansCount?: number
}

/**
 * Inbox用サイドバー
 *
 * すべてのPlanとアーカイブ、保存済みビューを提供
 */
export function InboxSidebar({ isLoading = false, activeplansCount = 0, archivedplansCount = 0 }: InboxSidebarProps) {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const { views, activeViewId, setActiveView } = useInboxViewStore()

  const currentViewId = useMemo(() => {
    return activeViewId
  }, [activeViewId])

  const handleViewClick = useCallback(
    (viewId: string) => {
      setActiveView(viewId)
      const locale = pathname?.split('/')[1] || 'ja'

      // URLパスマッピング
      const pathMap: Record<string, string> = {
        'default-all': 'all',
        'default-archive': 'archive',
      }

      const path = pathMap[viewId] || `view/${viewId}`
      router.push(`/${locale}/inbox/${path}`)
    },
    [setActiveView, router, pathname]
  )

  const handleCreateView = useCallback(() => {
    // TODO: 保存済みビュー作成ダイアログを開く
    console.log('Create new view')
  }, [])

  // デフォルトビューと保存済みビューを分離
  const defaultViews = useMemo(() => views.filter((v) => v.id.startsWith('default-')), [views])
  const savedViews = useMemo(() => views.filter((v) => !v.id.startsWith('default-')), [views])

  if (isLoading) {
    return (
      <aside className="bg-background text-foreground flex h-full w-full flex-col">
        <SidebarHeader title={t('sidebar.navigation.inbox')} />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Header - ページタイトル */}
      <SidebarHeader title={t('sidebar.navigation.inbox')} />

      {/* コンテンツ */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {/* デフォルトビュー */}
          {defaultViews.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => handleViewClick(view.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                currentViewId === view.id
                  ? 'bg-primary/12 text-foreground'
                  : 'text-muted-foreground hover:bg-foreground/8'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {view.id === 'default-all' ? (
                    <Inbox className="h-4 w-4 shrink-0" />
                  ) : (
                    <Archive className="h-4 w-4 shrink-0" />
                  )}
                  <span>{view.name}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {view.id === 'default-all' ? activeplansCount : archivedplansCount}
                </span>
              </div>
            </button>
          ))}

          {/* 保存済みビューセクション */}
          {savedViews.length > 0 && (
            <>
              <div className="text-muted-foreground mt-4 mb-1 flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold uppercase">保存済みビュー</span>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCreateView}
                        className="hover:bg-accent h-5 w-5 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4}>
                      <p>新しいビューを作成</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {savedViews.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => handleViewClick(view.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    currentViewId === view.id
                      ? 'bg-primary/12 text-foreground'
                      : 'text-muted-foreground hover:bg-foreground/8'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex-1 truncate">{view.name}</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </nav>
    </aside>
  )
}
