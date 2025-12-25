'use client';

import { InspectorShell, type InspectorDisplayMode } from '@/features/inspector';

import { useAIInspectorStore } from '../stores';

import { AIInspectorContent } from './AIInspectorContent';

/**
 * AI Inspector（全ページ共通）
 *
 * AI Chatパネルをサイドパネル（Sheet）またはポップアップ（Dialog）で表示
 * PlanInspectorやTagInspectorと同様のパターンで実装
 */
export function AIInspector() {
  const isOpen = useAIInspectorStore((state) => state.isOpen);
  const displayMode = useAIInspectorStore((state) => state.displayMode) as InspectorDisplayMode;
  const closeInspector = useAIInspectorStore((state) => state.closeInspector);

  return (
    <InspectorShell
      isOpen={isOpen}
      onClose={closeInspector}
      displayMode={displayMode}
      title="AIアシスタント"
      resizable={displayMode === 'sheet'}
      modal={false}
    >
      <AIInspectorContent />
    </InspectorShell>
  );
}
