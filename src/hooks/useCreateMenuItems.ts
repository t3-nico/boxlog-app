'use client';

/**
 * 新規作成メニューの共通アイテム定義
 *
 * Sidebar CreateNewDropdown / Calendar EmptyAreaContextMenu / Mobile CreateActionSheet
 * の3箇所で使用されるメニュー項目を一元管理する。
 */

import { useCallback, useMemo } from 'react';

import { CalendarPlus, Clock, Tag } from 'lucide-react';

import { useTagModalNavigation } from '@/hooks/useTagModalNavigation';
import { usePlanInspectorStore } from '@/stores/usePlanInspectorStore';
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
 * @returns Plan / Record / --- / Tag のメニュー項目配列
 */
export function useCreateMenuItems(options?: UseCreateMenuItemsOptions): CreateMenuEntry[] {
  const t = useTranslations();
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);
  const { openTagCreateModal } = useTagModalNavigation();

  const handleCreatePlan = useCallback(() => {
    openInspectorWithDraft(options?.initialData, 'plan');
  }, [openInspectorWithDraft, options?.initialData]);

  const handleCreateRecord = useCallback(() => {
    openInspectorWithDraft(options?.initialData, 'record');
  }, [openInspectorWithDraft, options?.initialData]);

  const handleCreateTag = useCallback(() => {
    openTagCreateModal();
  }, [openTagCreateModal]);

  return useMemo(
    () => [
      {
        type: 'item' as const,
        id: 'plan',
        icon: CalendarPlus,
        label: t('common.createSheet.plan'),
        action: handleCreatePlan,
      },
      {
        type: 'item' as const,
        id: 'record',
        icon: Clock,
        label: t('common.createSheet.record'),
        action: handleCreateRecord,
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
    [t, handleCreatePlan, handleCreateRecord, handleCreateTag],
  );
}
