'use client';

import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_TAG_COLOR } from '@/features/tags/constants/colors';
import { useUpdateTag } from '@/features/tags/hooks';

interface UseFilterItemEditProps {
  tagId: string | undefined;
  initialColor: string | undefined;
}

interface UseFilterItemEditReturn {
  displayColor: string;
  handleColorChange: (color: string) => Promise<void>;
}

/**
 * タグ編集用フック（色変更専用）
 *
 * 名前・ノート編集はダイアログベースに移行したため、
 * このフックは色変更の楽観的更新のみを担当する。
 */
export function useFilterItemEdit({
  tagId,
  initialColor,
}: UseFilterItemEditProps): UseFilterItemEditReturn {
  const updateTagMutation = useUpdateTag();

  // Color optimistic update state
  const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
  const displayColor = optimisticColor ?? initialColor ?? DEFAULT_TAG_COLOR;

  // Clear optimistic color when server color matches
  useEffect(() => {
    if (initialColor && optimisticColor && initialColor === optimisticColor) {
      setOptimisticColor(null);
    }
  }, [initialColor, optimisticColor]);

  // Color change with optimistic update
  const handleColorChange = useCallback(
    async (color: string) => {
      if (!tagId) return;
      setOptimisticColor(color);
      try {
        await updateTagMutation.mutateAsync({
          id: tagId,
          data: { color },
        });
      } catch {
        setOptimisticColor(null);
      }
    },
    [tagId, updateTagMutation],
  );

  return {
    displayColor,
    handleColorChange,
  };
}
