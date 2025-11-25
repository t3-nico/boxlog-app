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

export function TrashPageClient({ translations }: Props) {
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
            className="rounded-lg bg-red-600 p-4 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {translations.emptyTrash}
          </button>
        )
      }
    >
      <ErrorBoundary
        fallback={
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="text-center">
              <div className="mb-4 text-6xl text-red-600 dark:text-red-400">🗑️</div>
              <h3 className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">{translations.errorTitle}</h3>
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">{translations.errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
