'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  FolderKanban,
  Lightbulb,
  ListTodo,
  MessageSquare,
  Rocket,
  Scale,
  ShieldOff,
  Star,
  Tag,
  Target,
  TrendingUp,
  User,
} from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useI18n } from '@/features/i18n/lib/hooks'
import { SidebarHeader } from '@/features/navigation/components/sidebar/SidebarHeader'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

/**
 * 統計ページ専用サイドバー
 *
 * ナビゲーションリンクを提供し、各統計セクションへのアクセスを容易にする
 */
export function StatsSidebar() {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  const baseUrl = `/${localeFromPath}/stats`

  // 現在のパスがアクティブかどうかを判定
  const isActive = (href: string) => {
    if (href === baseUrl) {
      return pathname === baseUrl
    }
    return pathname?.startsWith(href) ?? false
  }

  // ナビゲーションセクション定義
  const navSections: NavSection[] = [
    {
      title: t('stats.sidebar.dashboard'),
      items: [
        {
          href: baseUrl,
          label: t('stats.sidebar.overview'),
          icon: <BarChart3 className="size-4" />,
        },
      ],
      defaultOpen: true,
    },
    {
      title: t('stats.sidebar.analytics'),
      items: [
        {
          href: `${baseUrl}/tasks`,
          label: t('stats.sidebar.tasks'),
          icon: <CheckCircle2 className="size-4" />,
        },
        {
          href: `${baseUrl}/time`,
          label: t('stats.sidebar.time'),
          icon: <Clock className="size-4" />,
        },
        {
          href: `${baseUrl}/categories`,
          label: t('stats.sidebar.categories'),
          icon: <FolderKanban className="size-4" />,
        },
        {
          href: `${baseUrl}/tag-analysis`,
          label: t('stats.sidebar.tagAnalysis'),
          icon: <Tag className="size-4" />,
        },
        {
          href: `${baseUrl}/trends`,
          label: t('stats.sidebar.trends'),
          icon: <TrendingUp className="size-4" />,
        },
      ],
      defaultOpen: true,
    },
    {
      title: t('stats.sidebar.selfAnalysis'),
      items: [
        {
          href: `${baseUrl}/goals`,
          label: t('stats.goals'),
          icon: <Target className="size-4" />,
        },
        {
          href: `${baseUrl}/principles`,
          label: t('stats.principles'),
          icon: <Scale className="size-4" />,
        },
        {
          href: `${baseUrl}/value`,
          label: t('stats.value'),
          icon: <Star className="size-4" />,
        },
        {
          href: `${baseUrl}/life-vision`,
          label: t('stats.lifeVision'),
          icon: <Compass className="size-4" />,
        },
        {
          href: `${baseUrl}/identity`,
          label: t('stats.identity'),
          icon: <User className="size-4" />,
        },
        {
          href: `${baseUrl}/purpose`,
          label: t('stats.purpose'),
          icon: <Lightbulb className="size-4" />,
        },
        {
          href: `${baseUrl}/antivalues`,
          label: t('stats.antivalues'),
          icon: <ShieldOff className="size-4" />,
        },
      ],
      defaultOpen: false,
    },
    {
      title: t('stats.sidebar.reflect'),
      items: [
        {
          href: `${baseUrl}/reflect/today`,
          label: t('stats.sidebar.reflectToday'),
          icon: <MessageSquare className="size-4" />,
        },
        {
          href: `${baseUrl}/reflect/week`,
          label: t('stats.sidebar.reflectWeek'),
          icon: <MessageSquare className="size-4" />,
        },
        {
          href: `${baseUrl}/reflect/month`,
          label: t('stats.sidebar.reflectMonth'),
          icon: <MessageSquare className="size-4" />,
        },
        {
          href: `${baseUrl}/reflect/all`,
          label: t('stats.sidebar.reflectAll'),
          icon: <MessageSquare className="size-4" />,
        },
      ],
      defaultOpen: false,
    },
    {
      title: t('stats.sidebar.actions'),
      items: [
        {
          href: `${baseUrl}/act/try`,
          label: t('stats.sidebar.actionTry'),
          icon: <Rocket className="size-4" />,
        },
        {
          href: `${baseUrl}/act/next`,
          label: t('stats.sidebar.actionNext'),
          icon: <ListTodo className="size-4" />,
        },
      ],
      defaultOpen: false,
    },
  ]

  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Header */}
      <SidebarHeader title={t('sidebar.navigation.stats')} />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-4">
          {navSections.map((section) => (
            <Collapsible
              key={section.title}
              {...(section.defaultOpen !== undefined && { defaultOpen: section.defaultOpen })}
            >
              <CollapsibleTrigger className="text-muted-foreground hover:bg-foreground/8 flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase transition-colors">
                {section.title}
                <ChevronDown className="size-3 transition-transform duration-200 [[data-state=open]>svg]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-1 space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch={true}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive(item.href)
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-foreground/8'
                        )}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </nav>
    </div>
  )
}
