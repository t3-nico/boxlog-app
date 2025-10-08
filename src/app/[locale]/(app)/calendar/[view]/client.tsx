'use client'

import dynamic from 'next/dynamic'

import { FeatureErrorBoundary } from '@/components/error-boundary'
import { CalendarSkeleton } from '@/features/calendar/components/CalendarSkeleton'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'

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

export default function CalendarViewClient({ view, initialDate, translations }: CalendarViewClientProps) {
  return (
    <FeatureErrorBoundary
      featureName="calendar"
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="max-w-md rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-700 dark:bg-red-900/20">
            <div className="text-center">
              <div className="mb-4 text-6xl text-red-600 dark:text-red-400">📅</div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                {translations.errorTitle}
              </h2>
              <p className="mb-4 text-sm text-neutral-800 dark:text-neutral-200">{translations.errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-blue-600 px-4 py-2 text-white transition-opacity hover:opacity-80 dark:bg-blue-500"
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
  )
}
