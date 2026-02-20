'use client';

/**
 * Inspector 3行レイアウト（共通コンポーネント）
 *
 * Plan/Record Inspector 共通の Toggl風3行構造:
 * 1行目: タイトル入力
 * 2行目: スケジュール（日付 + 時間 + Duration）
 * 3行目: オプションアイコン群（タグ、メモ、充実度など）
 */

import type { ReactNode } from 'react';

interface InspectorDetailsLayoutProps {
  /** Row 1: TitleInput / SuggestInput */
  title: ReactNode;
  /** Row 2: ScheduleRow */
  schedule: ReactNode;
  /** Row 3: アイコンボタン群（TagsIconButton, NoteIconButton 等） */
  options: ReactNode;
}

export function InspectorDetailsLayout({ title, schedule, options }: InspectorDetailsLayoutProps) {
  return (
    <>
      {/* Row 1: Title */}
      <div className="px-4 pt-4 pb-2">{title}</div>

      {/* Row 2: Schedule */}
      {schedule}

      {/* Row 3: Option Icons */}
      <div className="flex flex-wrap items-center gap-1 px-4 pt-2 pb-4">{options}</div>
    </>
  );
}
