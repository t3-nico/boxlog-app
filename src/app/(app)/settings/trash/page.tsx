'use client'

import { colors, rounded, spacing, typography } from '@/config/theme'
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
            className={`${spacing.padding.md} ${typography.body.sm} ${typography.weight.medium} ${colors.text.white} ${colors.background.danger} ${colors.hover.danger} ${rounded.component.button.lg} ${colors.transition.colors}`}
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
