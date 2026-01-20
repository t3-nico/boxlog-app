'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useCreateTag } from '../hooks/useTags';
import { useTagCreateModalStore } from '../stores/useTagCreateModalStore';
import { TagCreateModal } from './tag-create-modal';

import type { CreateTagInput } from '@/features/tags/types';

/**
 * グローバルに配置するタグ作成モーダル
 *
 * providers.tsxで配置し、どこからでもuseTagCreateModalStore.openModal()で開ける
 */
export function GlobalTagCreateModal() {
  const t = useTranslations();
  const isOpen = useTagCreateModalStore((state) => state.isOpen);
  const defaultParentId = useTagCreateModalStore((state) => state.defaultParentId);
  const closeModal = useTagCreateModalStore((state) => state.closeModal);
  const createTagMutation = useCreateTag();

  const handleCreateTag = async (data: CreateTagInput) => {
    const result = await createTagMutation.mutateAsync({
      name: data.name,
      color: data.color,
      description: data.description ?? undefined,
      parentId: data.parentId ?? undefined,
    });
    toast.success(t('tags.toast.created', { name: result.name }));
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
