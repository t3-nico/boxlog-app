'use client'

import { ErrorBoundary } from '@/components/error-boundary'
import { useI18n } from '@/features/i18n/lib/hooks'
import { SettingsLayout } from '@/features/settings/components'
import { TrashView } from '@/features/trash/components/TrashView'
import { useTrashStore } from '@/features/trash/stores/useTrashStore'

const TrashPage = () => {
  const { t } = useI18n()
  const { emptyTrash, getStats } = useTrashStore()
  const stats = getStats()

  return (
    <SettingsLayout
      title={t('settings.trash.title')}
      description={t('settings.trash.itemsCount', { count: stats.totalItems })}
      actions={
        stats.totalItems > 0 && (
          <button
            type="button"
            onClick={emptyTrash}
            className="rounded-lg bg-red-600 p-4 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {t('settings.trash.empty')}
          </button>
        )
      }
    >
      <ErrorBoundary
        fallback={
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="text-center">
              <div className="mb-4 text-6xl text-red-600 dark:text-red-400">🗑️</div>
              <h3 className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">
                {t('settings.trash.displayError')}
              </h3>
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">{t('settings.trash.reloadMessage')}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {t('settings.trash.reloadButton')}
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

export default TrashPage
