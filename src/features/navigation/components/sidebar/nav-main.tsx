'use client'

import { Mail, type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'
import type { TranslatedString } from '@/types/i18n-branded'

import { QuickCreateButton } from './quick-create-button'

export function NavMain({
  items,
}: {
  items: {
    title: TranslatedString
    url: string
    icon?: LucideIcon
  }[]
}) {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)

  return (
    <div className="flex flex-col gap-2">
      {/* Quick Create Section */}
      <div className="flex items-center gap-2">
        <QuickCreateButton />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" className="h-8 w-8 shrink-0" variant="outline">
              <Mail className="h-4 w-4" />
              <span className="sr-only">{t('sidebar.inbox')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('sidebar.inbox')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col">
        <div className="text-muted-foreground px-2 py-2 text-xs font-semibold">{t('sidebar.views')}</div>
        <div className="flex flex-col">
          {items.map((item) => {
            // パス比較: 両方のパスを正規化して比較
            const isActive = pathname === item.url || pathname?.startsWith(item.url + '/')
            return (
              <a
                key={item.title}
                href={item.url}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
