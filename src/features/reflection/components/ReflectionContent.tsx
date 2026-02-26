'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { MarkdownContent } from '@/components/common/MarkdownContent';
import { formatDurationMinutes } from '@/lib/date/format';

import type { Reflection } from '../types';

import { ReflectionUserNote } from './ReflectionUserNote';

interface ReflectionContentProps {
  /** Reflectionデータ */
  reflection: Reflection;
  /** ユーザーメモの変更コールバック */
  onUserNoteChange?: ((value: string) => void) | undefined;
}

/**
 * 生成済みReflection（AI日報）の表示
 *
 * - AIタイトル
 * - アクティビティリスト（事実の要約）
 * - AIの所感（Markdown）
 * - AIの問いかけ
 * - ユーザーメモ入力欄
 */
export function ReflectionContent({ reflection, onUserNoteChange }: ReflectionContentProps) {
  const t = useTranslations('calendar.reflection');

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* AIタイトル */}
      <h2 className="text-foreground text-lg leading-snug font-medium">{reflection.title}</h2>

      {/* アクティビティセクション */}
      {reflection.activities.length > 0 && (
        <section>
          <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            {t('sections.activities')}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {reflection.activities.map((activity, i) => (
              <li key={i} className="text-foreground flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={
                      activity.type === 'record'
                        ? 'bg-record size-2 rounded-full'
                        : 'bg-plan size-2 rounded-full'
                    }
                  />
                  {activity.label}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {activity.duration != null && formatDurationMinutes(activity.duration)}
                  {activity.count != null && `${activity.count} tasks`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* AIの所感 */}
      {reflection.insights && (
        <section>
          <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            {t('sections.insights')}
          </h3>
          <MarkdownContent content={reflection.insights} />
        </section>
      )}

      {/* AIの問いかけ */}
      {reflection.question && (
        <div className="bg-surface-container rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MessageCircle className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <p className="text-foreground text-sm leading-relaxed">{reflection.question}</p>
          </div>
        </div>
      )}

      {/* ユーザーメモ */}
      <section>
        <h3 className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
          {t('sections.note')}
        </h3>
        <ReflectionUserNote
          value={reflection.userNote}
          onChange={onUserNoteChange ?? (() => {})}
          readOnly={!onUserNoteChange}
        />
      </section>
    </div>
  );
}
