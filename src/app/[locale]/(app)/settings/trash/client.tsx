'use client'

import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsLayout } from '@/features/settings/components'
import { TrashView } from '@/features/trash/components/TrashView'
import { useTrashStore } from '@/features/trash/stores/useTrashStore'

interface Props {
  translations: {
    title: string
    itemsCount: string
    emptyTrash: string
    errorTitle: string
    errorMessage: string
    reload: string
  }
}

export default function TrashPageClient({ translations }: Props) {
  const { emptyTrash, getStats } = useTrashStore()
  const stats = getStats()

  // 変数補間
  const description = translations.itemsCount.replace('{{count}}', stats.totalItems.toString())

  return (
    <SettingsLayout
      title={translations.title}
      description={description}
      actions={
        stats.totalItems > 0 && (
          <button
            type="button"
            onClick={emptyTrash}
            className="p-4 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            {translations.emptyTrash}
          </button>
        )
      }
    >
      <ErrorBoundary
        fallback={
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 p-8">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-4 text-6xl">🗑️</div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                {translations.errorTitle}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{translations.errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                {translations.reload}
              </button>
            </div>
          </div>
        }
      >
        <TrashView />
      </ErrorBoundary>
    </SettingsLayout>
  )
}
