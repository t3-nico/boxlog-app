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

const HelpPage = () => {
  // BoxLogサポートアシスタントをメインエリアで表示
  return (
    <FeatureErrorBoundary
      featureName="help"
      fallback={
        <div className="bg-neutral-200 dark:bg-neutral-700 p-4 rounded border border-neutral-300 dark:border-neutral-600">
          <p className="text-neutral-800 dark:text-neutral-200 text-center">ヘルプの読み込み中にエラーが発生しました</p>
        </div>
      }
    >
      <div className="h-full">
        <MainSupportChat />
      </div>
    </FeatureErrorBoundary>
  )
}

export default HelpPage
