'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

import { Bell, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FeatureErrorBoundary } from '@/components/error-boundary'
import { CalendarSkeleton } from '@/features/calendar/components/CalendarSkeleton'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useMobileHeader } from '@/features/navigation/hooks/useMobileHeader'
import { useNotificationDialogStore } from '@/features/notifications/stores/useNotificationDialogStore'

// Calendar機能を動的インポート（Bundle size最適化）
const CalendarController = dynamic(
  () => import('@/features/calendar').then((mod) => ({ default: mod.CalendarController })),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
)

interface CalendarViewClientProps {
  view: CalendarViewType
  initialDate: Date | null
  translations: {
    errorTitle: string
    errorMessage: string
    reloadButton: string
  }
}

export function CalendarViewClient({ view, initialDate, translations }: CalendarViewClientProps) {
  const pathname = usePathname()
  const locale = (pathname?.split('/')[1] ?? 'ja') as 'ja' | 'en'
  const { t } = useI18n(locale)
  const { open: openNotifications } = useNotificationDialogStore()

  // モバイルヘッダー設定
  useMobileHeader({
    title: t('navigation.calendar'),
    actions: (
      <>
        <Button variant="ghost" size="icon" className="size-10" aria-label={t('common.search')}>
          <Search className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          onClick={openNotifications}
          aria-label={t('notifications.title')}
        >
          <Bell className="size-5" />
        </Button>
      </>
    ),
  })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <FeatureErrorBoundary
        featureName="calendar"
        fallback={
          <div className="flex h-full items-center justify-center p-4">
            <div className="border-destructive/30 bg-destructive/10 max-w-md rounded-lg border p-6">
              <div className="text-center">
                <div className="mb-4 text-6xl">📅</div>
                <h2 className="text-destructive mb-2 text-2xl font-bold tracking-tight">{translations.errorTitle}</h2>
                <p className="text-foreground/80 mb-4 text-sm">{translations.errorMessage}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-primary-foreground rounded px-4 py-2 transition-opacity hover:opacity-80"
                >
                  {translations.reloadButton}
                </button>
              </div>
            </div>
          </div>
        }
      >
        <CalendarController initialViewType={view} initialDate={initialDate} />
      </FeatureErrorBoundary>
    </div>
  )
}
