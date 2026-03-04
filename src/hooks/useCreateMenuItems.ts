'use client';

/**
 * 新規作成メニューの共通アイテム定義
 *
 * Sidebar CreateNewDropdown / Calendar EmptyAreaContextMenu / Mobile CreateActionSheet
 * の3箇所で使用されるメニュー項目を一元管理する。
 *
 * 即DB保存 + Inspector edit mode で開く。
 */

import { useCallback, useMemo } from 'react';

import { CalendarPlus, Tag } from 'lucide-react';

import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useTagModalNavigation } from '@/hooks/useTagModalNavigation';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';
import { useTranslations } from 'next-intl';

import type { LucideIcon } from 'lucide-react';

export interface CreateMenuItem {
  type: 'item';
  id: string;
  icon: LucideIcon;
  label: string;
  action: () => void;
}

export interface CreateMenuSeparator {
  type: 'separator';
}

export type CreateMenuEntry = CreateMenuItem | CreateMenuSeparator;

interface UseCreateMenuItemsOptions {
  /** Inspector に渡す初期データ（カレンダー右クリック時の時刻など） */
  initialData?: { start_time: string; end_time: string };
}

/**
 * 新規作成メニューのアイテム一覧を返すフック
 *
 * @returns Entry / --- / Tag のメニュー項目配列
 */
export function useCreateMenuItems(options?: UseCreateMenuItemsOptions): CreateMenuEntry[] {
  const t = useTranslations();
  const openInspector = useEntryInspectorStore((state) => state.openInspector);
  const { createEntry } = useEntryMutations();
  const { openTagCreateModal } = useTagModalNavigation();

  const handleCreateEntry = useCallback(async () => {
    const result = await createEntry.mutateAsync({
      title: '',
      start_time: options?.initialData?.start_time,
      end_time: options?.initialData?.end_time,
    });
    if (result?.id) {
      openInspector(result.id);
    }
  }, [createEntry, openInspector, options?.initialData]);

  const handleCreateTag = useCallback(() => {
    openTagCreateModal();
  }, [openTagCreateModal]);

  return useMemo(
    () => [
      {
        type: 'item' as const,
        id: 'entry',
        icon: CalendarPlus,
        label: t('common.createSheet.entry'),
        action: handleCreateEntry,
      },
      { type: 'separator' as const },
      {
        type: 'item' as const,
        id: 'tag',
        icon: Tag,
        label: t('common.createNew.tag'),
        action: handleCreateTag,
      },
    ],
    [t, handleCreateEntry, handleCreateTag],
  );
}
