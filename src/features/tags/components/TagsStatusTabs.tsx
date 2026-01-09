'use client';

import { useMemo } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTags } from '@/features/tags/hooks/useTags';
import { type TagStatus, useTagStatusStore } from '@/features/tags/stores/useTagStatusStore';
import { useTranslations } from 'next-intl';

/**
 * タグステータス切り替えタブ
 *
 * All / Archive の切り替えUI
 * Inbox の Open/Done タブと同様のパターン
 *
 * カウントは内部でuseTagsから取得
 */
export function TagsStatusTabs() {
  const t = useTranslations('tag');
  const status = useTagStatusStore((state) => state.status);
  const setStatus = useTagStatusStore((state) => state.setStatus);

  // タグデータからカウントを計算
  const { data: tags = [] } = useTags();
  const { activeCount, archiveCount } = useMemo(() => {
    let active = 0;
    let archive = 0;
    for (const tag of tags) {
      if (tag.is_active) {
        active++;
      } else {
        archive++;
      }
    }
    return { activeCount: active, archiveCount: archive };
  }, [tags]);

  return (
    <Tabs value={status} onValueChange={(value) => setStatus(value as TagStatus)}>
      <TabsList className="bg-secondary h-8 rounded-lg p-0.5">
        <TabsTrigger
          value="all"
          className="data-[state=inactive]:hover:bg-state-hover data-[state=active]:bg-background data-[state=active]:text-foreground h-7 gap-1.5 rounded-md px-3 text-xs"
        >
          {t('status.all')}
          <span className="bg-background flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums">
            {activeCount}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="archive"
          className="data-[state=inactive]:hover:bg-state-hover data-[state=active]:bg-background data-[state=active]:text-foreground h-7 gap-1.5 rounded-md px-3 text-xs"
        >
          {t('status.archive')}
          <span className="bg-background flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums">
            {archiveCount}
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
