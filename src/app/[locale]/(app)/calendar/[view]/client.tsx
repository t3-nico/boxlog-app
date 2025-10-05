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
          <div className="bg-red-50 dark:bg-red-900/20 p-6 border-red-300 dark:border-red-700 rounded-lg border max-w-md">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-4 text-6xl">📅</div>
              <h2 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 mb-2">
                {translations.errorTitle}
              </h2>
              <p className="text-neutral-800 dark:text-neutral-200 mb-4 text-sm">{translations.errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 dark:bg-blue-500 rounded px-4 py-2 text-white transition-opacity hover:opacity-80"
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
