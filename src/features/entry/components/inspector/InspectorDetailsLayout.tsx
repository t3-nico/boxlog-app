'use client';

/**
 * Inspector 詳細レイアウト
 *
 * padding 一元管理:
 * - Mobile: px-4 pt-3
 * - PC (md+): px-6 pt-5
 *
 * 子コンポーネントは独自の水平 padding を持たない。
 */

import type { ReactNode } from 'react';

export interface InspectorDetailsLayoutProps {
  /** Row 0: タグ表示（カラードット + タグ名） */
  tagRow?: ReactNode;
  /** タグ行とスケジュールカードの間に表示するアラート（時間重複エラー等） */
  alert?: ReactNode;
  /** Row 1: スケジュール + メモ等のコンテンツグループ */
  schedule: ReactNode;
  /** Row 2: オプションボタン群 */
  options?: ReactNode;
}

export function InspectorDetailsLayout({
  tagRow,
  alert,
  schedule,
  options,
}: InspectorDetailsLayoutProps) {
  return (
    <div className="px-4 pt-3 pb-4 md:px-6 md:pt-5 md:pb-6">
      {/* Row 0: タグ */}
      {tagRow}

      {/* アラート（時間重複エラー等） */}
      {alert && <div className="mt-2">{alert}</div>}

      {/* スケジュールカード */}
      <div className="bg-surface-inset mt-3 rounded-xl">{schedule}</div>

      {/* オプション */}
      {options && <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-5">{options}</div>}
    </div>
  );
}
