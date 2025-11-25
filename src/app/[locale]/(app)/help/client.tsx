'use client'

import dynamic from 'next/dynamic'

import { FeatureErrorBoundary } from '@/components/error-boundary'
import { HelpSkeleton } from '@/features/help/components/HelpSkeleton'

// Help機能を動的インポート（Bundle size最適化）
const MainSupportChat = dynamic(
  () => import('@/features/help/components/main-support-chat').then((mod) => ({ default: mod.MainSupportChat })),
  {
    loading: () => <HelpSkeleton />,
    ssr: false,
  }
)

interface Props {
  translations: {
    errorMessage: string
  }
}

export function HelpPageClient({ translations }: Props) {
  return (
    <FeatureErrorBoundary
      featureName="help"
      fallback={
        <div className="border-border bg-muted rounded border p-4">
          <p className="text-center text-neutral-800 dark:text-neutral-200">{translations.errorMessage}</p>
        </div>
      }
    >
      <div className="h-full">
        <MainSupportChat />
      </div>
    </FeatureErrorBoundary>
  )
}
