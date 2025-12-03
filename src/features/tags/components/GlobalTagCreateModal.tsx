'use client'

import { useTagCreateModalStore } from '../stores/useTagCreateModalStore'
import { useTagOperations } from '../hooks/use-tag-operations'
import { TagCreateModal } from './tag-create-modal'

/**
 * グローバルに配置するタグ作成モーダル
 *
 * providers.tsxで配置し、どこからでもuseTagCreateModalStore.openModal()で開ける
 */
export function GlobalTagCreateModal() {
  const isOpen = useTagCreateModalStore((state) => state.isOpen)
  const closeModal = useTagCreateModalStore((state) => state.closeModal)
  const { createTag } = useTagOperations()

  return (
    <TagCreateModal
      isOpen={isOpen}
      onClose={closeModal}
      onSave={createTag}
    />
  )
}
