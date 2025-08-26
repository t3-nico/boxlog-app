'use client'

import { SettingsLayout } from '@/features/settings/components'
import { TrashView } from '@/features/trash/components/TrashView'
import { useTrashStore } from '@/features/trash/stores/useTrashStore'

export default function TrashPage() {
  const { emptyTrash, getFilteredItems, getStats } = useTrashStore()
  const items = getFilteredItems()
  const stats = getStats()

  return (
    <SettingsLayout
      title="ゴミ箱"
      description={`${stats.totalItems}件のアイテム。30日後に自動削除されます。`}
      actions={
        stats.totalItems > 0 && (
          <button
            onClick={emptyTrash}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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