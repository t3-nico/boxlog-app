'use client'

import { SettingsLayout } from '@/features/settings/components'
import { TrashView } from '@/features/trash/components/TrashView'
import { useTrashStore } from '@/features/trash/stores/useTrashStore'

const TrashPage = () => {
  const { emptyTrash, getFilteredItems, getStats } = useTrashStore()
  const _items = getFilteredItems()
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
      <TrashView />
    </SettingsLayout>
  )
}

export default TrashPage
