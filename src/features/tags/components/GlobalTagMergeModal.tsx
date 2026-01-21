'use client';

import { useTagMergeModalStore } from '../stores/useTagMergeModalStore';
import { TagMergeModal } from './tag-merge-modal';

/**
 * グローバルに配置するタグマージモーダル
 *
 * providers.tsxで配置し、どこからでもuseTagMergeModalStore.openModal()で開ける
 */
export function GlobalTagMergeModal() {
  const isOpen = useTagMergeModalStore((state) => state.isOpen);
  const sourceTag = useTagMergeModalStore((state) => state.sourceTag);
  const hasChildren = useTagMergeModalStore((state) => state.hasChildren);
  const closeModal = useTagMergeModalStore((state) => state.closeModal);

  if (!sourceTag) return null;

  return (
    <TagMergeModal
      open={isOpen}
      onClose={closeModal}
      sourceTag={sourceTag}
      hasChildren={hasChildren}
    />
  );
}
