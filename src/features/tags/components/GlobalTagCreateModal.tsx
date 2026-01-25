'use client';

import { useCreateTag, useTags } from '../hooks';
import { useTagCreateModalStore } from '../stores/useTagCreateModalStore';
import { TagCreateModal } from './tag-create-modal';

import type { CreateTagInput } from '@/features/tags/types';

/**
 * グローバルに配置するタグ作成モーダル
 *
 * providers.tsxで配置し、どこからでもuseTagCreateModalStore.openModal()で開ける
 */
export function GlobalTagCreateModal() {
  const isOpen = useTagCreateModalStore((state) => state.isOpen);
  const defaultParentId = useTagCreateModalStore((state) => state.defaultParentId);
  const closeModal = useTagCreateModalStore((state) => state.closeModal);
  const createTagMutation = useCreateTag();
  const { data: existingTags } = useTags();

  // 楽観的更新: mutateを使用（awaitしない）→ モーダルは即座に閉じる
  // ただし重複チェックはクライアント側で先に行い、エラーはモーダル内で表示
  const handleCreateTag = async (data: CreateTagInput) => {
    // クライアント側で重複チェック（大文字小文字を区別しない）
    const isDuplicate = existingTags?.some(
      (tag) => tag.name.toLowerCase() === data.name.trim().toLowerCase(),
    );
    if (isDuplicate) {
      // TagCreateModalのcatch句でエラーメッセージを表示
      throw new Error('duplicate');
    }

    // 重複なし → mutateで楽観的更新（awaitしない）
    createTagMutation.mutate({
      name: data.name,
      color: data.color,
      description: data.description ?? undefined,
      parentId: data.parentId ?? undefined,
    });
  };

  return (
    <TagCreateModal
      isOpen={isOpen}
      onClose={closeModal}
      onSave={handleCreateTag}
      defaultParentId={defaultParentId}
    />
  );
}
