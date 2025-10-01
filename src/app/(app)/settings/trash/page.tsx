'use client'

import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsLayout } from '@/features/settings/components'
import { TrashView } from '@/features/trash/components/TrashView'
import { useTrashStore } from '@/features/trash/stores/useTrashStore'

const TrashPage = () => {
  const { emptyTrash, getStats } = useTrashStore()
  const stats = getStats()

  return (
    <SettingsLayout
      title="ゴミ箱"
      description={`${stats.totalItems}件のアイテム。30日後に自動削除されます。`}
      actions={
        stats.totalItems > 0 && (
          <button
            type="button"
            onClick={emptyTrash}
            className="p-4 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            ゴミ箱を空にする
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
                ゴミ箱の表示に失敗しました
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                ページをリロードしてください。
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                リロード
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
