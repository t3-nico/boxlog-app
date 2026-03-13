'use client';

import { Toaster } from '@/components/ui/toast';
import {
  EntryDeleteConfirmDialog,
  EntryInspector,
  RecurringEditConfirmDialog,
} from '@/features/entry/components';
import { SettingsDialog } from '@/features/settings';
import { TourController } from '@/features/tour';

/**
 * グローバルオーバーレイ群
 *
 * アプリ全体で共有されるダイアログ・トースト。
 * layout.tsx から分離し、追加/削除を一箇所で管理する。
 */
export function GlobalOverlays() {
  return (
    <>
      <SettingsDialog />
      <EntryInspector />
      <EntryDeleteConfirmDialog />
      <RecurringEditConfirmDialog />
      <TourController />
      <Toaster />
    </>
  );
}
