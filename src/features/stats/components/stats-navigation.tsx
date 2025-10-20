'use client'

import { BarChart3, Clock, FolderKanban, ListChecks, Tag, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'overview', label: '概要', icon: BarChart3 },
  { id: 'tasks', label: 'タスク統計', icon: ListChecks },
  { id: 'time', label: '時間分析', icon: Clock },
  { id: 'categories', label: 'カテゴリ別', icon: FolderKanban },
  { id: 'tags', label: 'タグ別', icon: Tag },
  { id: 'trends', label: 'トレンド', icon: TrendingUp },
]

/**
 * Stats専用ナビゲーションサイドバー
 *
 * アンカーリンクでページ内セクションへジャンプ
 */
export function StatsNavigation() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'ja'

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-2">
          {/* Section Header */}
          <div className="text-muted-foreground px-2 py-2 text-xs font-semibold">統計</div>

          {/* Navigation Items */}
          <div className="flex flex-col">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleScrollToSection(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    'hover:bg-sidebar-accent/50'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Sub Pages */}
          <div className="mt-2 flex flex-col">
            <Link
              href={`/${locale}/stats/goals`}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                'hover:bg-sidebar-accent/50'
              )}
            >
              目標管理
            </Link>
            <Link
              href={`/${locale}/stats/reflect/today`}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                'hover:bg-sidebar-accent/50'
              )}
            >
              振り返り
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
