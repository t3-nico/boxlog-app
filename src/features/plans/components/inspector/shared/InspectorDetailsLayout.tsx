'use client';

/**
 * Inspector 詳細レイアウト（3行構造）
 *
 * Plan/Record Inspector共通の3行レイアウトを提供
 * - Row 1: タイトル入力
 * - Row 2: スケジュール選択
 * - Row 3: オプションボタン群（タグ、ノート、その他）
 *
 * Slotベースで柔軟にコンテンツを挿入可能
 */

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface InspectorDetailsLayoutProps {
  /** Row 1: タイトル入力コンポーネント */
  title: ReactNode;
  /** Row 2: スケジュール選択コンポーネント */
  schedule: ReactNode;
  /** Row 3: オプションボタン群 */
  options: ReactNode;
  /** Row 1追加コンテンツ（タイトル横のアクセント線など） */
  titlePrefix?: ReactNode;
  /** Row 1のカスタムクラス */
  titleClassName?: string;
}

/**
 * Inspector詳細レイアウト
 *
 * @example
 * ```tsx
 * <InspectorDetailsLayout
 *   title={<TitleInput value={title} onChange={setTitle} />}
 *   schedule={<ScheduleRow ... />}
 *   options={
 *     <>
 *       <TagsIconButton />
 *       <NoteIconButton />
 *       <FulfillmentButton />
 *     </>
 *   }
 * />
 * ```
 */
export function InspectorDetailsLayout({
  title,
  schedule,
  options,
  titlePrefix,
  titleClassName,
}: InspectorDetailsLayoutProps) {
  return (
    <div>
      {/* Row 1: タイトル */}
      <div
        className={cn('px-4 pt-4 pb-2', titlePrefix && 'flex items-center gap-2', titleClassName)}
      >
        {titlePrefix}
        {title}
      </div>

      {/* Row 2: スケジュール */}
      {schedule}

      {/* Row 3: オプション */}
      <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">{options}</div>
    </div>
  );
}
