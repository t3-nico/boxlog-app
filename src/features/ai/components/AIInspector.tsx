'use client';

import { InspectorShell } from '@/features/inspector';

import { useAIInspectorStore } from '../stores';

import { AIInspectorContent } from './AIInspectorContent';

/**
 * AI Inspector（全ページ共通）
 *
 * AI Chatパネル: PC: Popover（フローティング）、モバイル: Drawer
 */
export function AIInspector() {
  const isOpen = useAIInspectorStore((state) => state.isOpen);
  const closeInspector = useAIInspectorStore((state) => state.closeInspector);

  return (
    <InspectorShell isOpen={isOpen} onClose={closeInspector} title="AIアシスタント">
      <AIInspectorContent />
    </InspectorShell>
  );
}
