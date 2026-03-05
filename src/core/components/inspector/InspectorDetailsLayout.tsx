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
  /** Row 1: スケジュール選択コンポーネント */
  schedule: ReactNode;
  /** Row 2: メモ（インラインテキストエリア） */
  note?: ReactNode;
  /** Row 3: オプションボタン群 */
  options: ReactNode;
}

export function InspectorDetailsLayout({
  tagRow,
  schedule,
  note,
  options,
}: InspectorDetailsLayoutProps) {
  return (
    <div>
      {/* Row 0: タグ */}
      {tagRow}

      {/* Row 1: スケジュール */}
      {schedule}

      {/* Row 2: メモ */}
      {note}

      {/* Row 3: オプション */}
      <div className="flex flex-wrap items-center gap-1 px-4 pt-3 pb-4">{options}</div>
    </div>
  );
}
