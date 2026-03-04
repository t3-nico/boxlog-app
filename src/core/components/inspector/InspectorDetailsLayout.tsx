'use client';

/**
 * Inspector 詳細レイアウト
 *
 * - Row 0: タグ表示（カラードット + タグ名）
 * - Row 1: スケジュール選択
 * - Row 2: オプションボタン群（ノート、充実度、繰り返し等）
 *
 * Slotベースで柔軟にコンテンツを挿入可能
 */

import type { ReactNode } from 'react';

export interface InspectorDetailsLayoutProps {
  /** Row 0: タグ表示（カラードット + タグ名） */
  tagRow?: ReactNode;
  /** Row 1: スケジュール選択コンポーネント */
  schedule: ReactNode;
  /** Row 2: オプションボタン群 */
  options: ReactNode;
}

/**
 * Inspector詳細レイアウト
 *
 * @example
 * ```tsx
 * <InspectorDetailsLayout
 *   tagRow={<InspectorTagRow tagId={tagId} onTagChange={setTagId} />}
 *   schedule={<TimeComparisonSection ... />}
 *   options={
 *     <>
 *       <NoteIconButton />
 *       <FulfillmentButton />
 *     </>
 *   }
 * />
 * ```
 */
export function InspectorDetailsLayout({ tagRow, schedule, options }: InspectorDetailsLayoutProps) {
  return (
    <div>
      {/* Row 0: タグ */}
      {tagRow}

      {/* Row 1: スケジュール */}
      {schedule}

      {/* Row 2: オプション */}
      <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">{options}</div>
    </div>
  );
}
