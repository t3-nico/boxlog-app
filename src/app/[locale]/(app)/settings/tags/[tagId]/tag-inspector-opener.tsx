'use client';

import { useTagInspectorStore } from '@/features/tags/stores/useTagInspectorStore';
import { useEffect } from 'react';

interface TagInspectorOpenerProps {
  tagId: string;
}

/**
 * URLからタグIDを受け取り、対応するタグのInspectorを自動的に開くコンポーネント
 */
export function TagInspectorOpener({ tagId }: TagInspectorOpenerProps) {
  const { openInspector, isOpen } = useTagInspectorStore();

  useEffect(() => {
    if (tagId && !isOpen) {
      openInspector(tagId);
    }
  }, [tagId, openInspector, isOpen]);

  return null;
}
