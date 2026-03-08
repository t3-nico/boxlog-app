'use client';

/**
 * Inspector 詳細レイアウト
 *
 * - Row 0: タグ表示（カラードット + タグ名）
 * - Row 1: スケジュール選択
 * - Row 2: メモ（インラインテキストエリア）
 * - Row 3: オプションチップ群
 *
 * セクション間は余白で区切る（線なし）
 */

import type { ReactNode } from 'react';

export interface InspectorDetailsLayoutProps {
  /** Row 0: タグ表示（カラードット + タグ名） */
  tagRow?: ReactNode;
  /** Row 1: スケジュール + メモ等のコンテンツグループ */
  schedule: ReactNode;
  /** Row 2: オプションボタン群 */
  options?: ReactNode;
}

export function InspectorDetailsLayout({ tagRow, schedule, options }: InspectorDetailsLayoutProps) {
  return (
    <div className="md:pt-3">
      {/* Row 0: タグ */}
      {tagRow}

      {/* コンテンツグループ */}
      <div className="bg-surface-inset mx-4 mt-3 mb-4 rounded-xl">{schedule}</div>

      {/* オプション */}
      {options && (
        <div className="flex flex-wrap items-center gap-1.5 px-5 pt-2 pb-5">{options}</div>
      )}
    </div>
  );
}
