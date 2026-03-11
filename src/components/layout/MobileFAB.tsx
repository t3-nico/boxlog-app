'use client';

import { useCallback } from 'react';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  CreateActionSheet,
  useCreateActionSheet,
  type CreateActionType,
} from '@/components/common/CreateActionSheet';
import { Button } from '@/components/ui/button';
import { useEntryMutations } from '@/hooks/useEntryMutations';
import { useEntryInspectorStore } from '@/stores/useEntryInspectorStore';

/**
 * モバイル用FAB（Floating Action Button）+ CreateActionSheet
 *
 * エントリ作成のトリガー。iOS Safe Area対応済み。
 */
export function MobileFAB() {
  const t = useTranslations();
  const createActionSheet = useCreateActionSheet();
  const { createEntry } = useEntryMutations();

  const handleCreateAction = useCallback(
    async (_type: CreateActionType) => {
      const result = await createEntry.mutateAsync({ title: '' });
      if (result?.id) {
        useEntryInspectorStore.getState().openInspector(result.id);
      }
    },
    [createEntry],
  );

  return (
    <>
      <Button
        icon
        aria-label={t('common.createNewEvent')}
        className="fixed right-4 z-50 size-14 rounded-2xl shadow-lg"
        style={{
          // iOS Safe Area対応: 余白(16px) + Safe Area
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
        onClick={createActionSheet.open}
      >
        <Plus className="size-6" />
      </Button>
      <CreateActionSheet
        open={createActionSheet.isOpen}
        onOpenChange={createActionSheet.setIsOpen}
        onSelect={handleCreateAction}
      />
    </>
  );
}
