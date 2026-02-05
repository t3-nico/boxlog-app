'use client';

import { Suspense } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { RecordTableView } from '@/features/records/components/RecordTableView';

/**
 * Recordコンテンツ with Suspense
 */
export function RecordContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" />
              <p className="text-muted-foreground text-sm">読み込み中...</p>
            </div>
          </div>
        }
      >
        <RecordTableView />
      </Suspense>
    </div>
  );
}
