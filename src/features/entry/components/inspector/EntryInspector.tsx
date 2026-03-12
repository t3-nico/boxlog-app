'use client';

import { useTranslations } from 'next-intl';
import { Suspense, useCallback } from 'react';

import { InspectorContent } from './InspectorContent';
import { InspectorShell } from './InspectorShell';
import { useInspectorKeyboard } from './hooks';

import { useModalStore } from '@/stores/useModalStore';
import { useEntry } from '../../hooks/useEntry';
import { useEntryInspectorStore } from '../../stores/useEntryInspectorStore';
import type { EntryWithTags } from '../../types/entry';

import { useInspectorURLSync } from '../../hooks/useInspectorURLSync';
import { EntryInspectorContent } from './EntryInspectorContent';
import { useInspectorAutoSave, useInspectorNavigation } from './hooks';

/**
 * URL同期を担当する内部コンポーネント
 * useSearchParams()はSuspenseが必要なため分離
 */
function InspectorURLSyncHandler() {
  useInspectorURLSync();
  return null;
}

/**
 * Entry Inspector（全ページ共通）
 *
 * 共通Inspector基盤を使用
 * PC: Popover（フローティング）、モバイル: Drawer
 */
export function EntryInspector() {
  const t = useTranslations();
  const isOpen = useEntryInspectorStore((state) => state.isOpen);
  const planId = useEntryInspectorStore((state) => state.entryId);
  const closeInspector = useEntryInspectorStore((state) => state.closeInspector);

  const { data: planData, isLoading } = useEntry(planId!, {
    includeTags: true,
    enabled: !!planId,
  });
  const plan: EntryWithTags | null = (planData ?? null) as EntryWithTags | null;

  // 繰り返しダイアログが開いている間はInspectorを閉じない
  // 全フィールドはデバウンス即時保存のため、閉じる = ただの closeInspector()
  const handleClose = useCallback(() => {
    const modal = useModalStore.getState().modal;
    if (modal?.type === 'recurringEdit') return;
    closeInspector();
  }, [closeInspector]);

  // ナビゲーション
  const { hasPrevious, hasNext, goToPrevious, goToNext } = useInspectorNavigation(planId);

  useInspectorAutoSave({ planId, plan });

  // キーボードショートカット
  useInspectorKeyboard({
    isOpen,
    hasPrevious,
    hasNext,
    onClose: handleClose,
    onPrevious: goToPrevious,
    onNext: goToNext,
  });

  return (
    <>
      {/* URL同期（Suspenseでラップ） */}
      <Suspense fallback={null}>
        <InspectorURLSyncHandler />
      </Suspense>

      <InspectorShell
        isOpen={isOpen}
        onClose={handleClose}
        title={plan?.title || t('plan.inspector.noTitle')}
      >
        <InspectorContent
          isLoading={isLoading}
          hasData={!!plan}
          emptyMessage={t('plan.inspector.notFound')}
        >
          <EntryInspectorContent />
        </InspectorContent>
      </InspectorShell>
    </>
  );
}
