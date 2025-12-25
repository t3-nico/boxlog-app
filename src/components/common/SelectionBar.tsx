'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface SelectionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: ReactNode;
}

/**
 * 共通選択バー（Googleドライブ風）
 *
 * TagsページとInboxページで共通で使用する選択バーコンポーネント
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - パディング: 上下8px（py-2）、左右16px（px-4）- 背景なし
 * - 背景コンテナ: 32px（h-8）- bg-surface-container + rounded-md、横幅いっぱい
 * - 8pxグリッドシステム準拠（他のnavと統一）
 *
 * 構成:
 * - 左側: 選択解除ボタン（×）
 * - 選択数表示（例: 「3件選択中」）
 * - アクションボタン群（親コンポーネントから渡される）
 *
 * @example
 * ```tsx
 * <SelectionBar
 *   selectedCount={3}
 *   onClearSelection={() => clearSelection()}
 *   actions={<YourActionsComponent />}
 * />
 * ```
 */
export function SelectionBar({ selectedCount, onClearSelection, actions }: SelectionBarProps) {
  const t = useTranslations();

  if (selectedCount === 0) return null;

  return (
    <div className="flex h-12 shrink-0 items-center px-4 py-2">
      {/* 背景コンテナ（32px、角丸） */}
      <div className="bg-surface-container flex h-8 flex-1 items-center gap-2 rounded-md pl-1">
        {/* 選択解除ボタン（左端） */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClearSelection}
          aria-label={t('aria.clearSelection')}
        >
          <X className="h-3.5 w-3.5" />
        </Button>

        {/* 選択数表示 */}
        <span className="text-sm font-medium">
          {t('common.selectedCount', { count: selectedCount })}
        </span>

        {/* アクションボタン */}
        <div className="flex items-center gap-1">{actions}</div>
      </div>
    </div>
  );
}
