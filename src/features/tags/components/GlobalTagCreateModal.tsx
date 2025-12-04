'use client'

import { useCreateTag } from '../hooks/use-tags'
import { useTagCreateModalStore } from '../stores/useTagCreateModalStore'
import { TagCreateModal } from './tag-create-modal'

import type { CreateTagInput } from '@/types/tags'

/**
 * グローバルに配置するタグ作成モーダル
 *
 * providers.tsxで配置し、どこからでもuseTagCreateModalStore.openModal()で開ける
 */
export function GlobalTagCreateModal() {
  const isOpen = useTagCreateModalStore((state) => state.isOpen)
  const closeModal = useTagCreateModalStore((state) => state.closeModal)
  const createTagMutation = useCreateTag()

  const handleCreateTag = async (data: CreateTagInput) => {
    await createTagMutation.mutateAsync(data)
  }

  return <TagCreateModal isOpen={isOpen} onClose={closeModal} onSave={handleCreateTag} />
}
