'use client';

import { useCallback, useState } from 'react';

import { format } from 'date-fns';
import { CalendarPlus, Clock, FileText, History, Plus, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverTooltip } from '@/components/ui/tooltip';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useTagModalNavigation } from '@/features/tags/hooks/useTagModalNavigation';
import { api } from '@/lib/trpc';
import { useTranslations } from 'next-intl';

interface CreateNewDropdownProps {
  /** ボタンサイズ: 'default' = 40px, 'sm' = 32px */
  size?: 'default' | 'sm';
  /** ツールチップのテキスト */
  tooltipContent?: string;
  /** ツールチップの表示位置 */
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * 新規作成ドロップダウン
 *
 * Plan/Record/History/Templates/Tagsを選択して新規作成できるドロップダウンメニュー
 * - サイズはsize propsで制御（'default' = 40px, 'sm' = 32px）
 */
export function CreateNewDropdown({
  size = 'default',
  tooltipContent,
  tooltipSide = 'bottom',
}: CreateNewDropdownProps) {
  const t = useTranslations();
  const { openInspectorWithDraft } = usePlanInspectorStore();
  const { openTagCreateModal } = useTagModalNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  // 次の15分単位の時刻を取得
  const getNextQuarterHour = useCallback((date: Date): Date => {
    const result = new Date(date);
    const minutes = result.getMinutes();
    const nextQuarter = Math.ceil(minutes / 15) * 15;
    result.setMinutes(nextQuarter, 0, 0);
    if (nextQuarter >= 60) {
      result.setHours(result.getHours() + 1);
      result.setMinutes(0);
    }
    return result;
  }, []);

  // 時間が重複しているかチェック
  const checkOverlap = useCallback(
    (start: Date, end: Date): boolean => {
      const plans = utils.plans.list.getData();
      if (!plans || plans.length === 0) return false;

      return plans.some((p) => {
        if (!p.start_time || !p.end_time) return false;
        const pStart = new Date(p.start_time);
        const pEnd = new Date(p.end_time);
        // 同じ日のみチェック
        if (pStart.toDateString() !== start.toDateString()) return false;
        return pStart < end && pEnd > start;
      });
    },
    [utils.plans.list],
  );

  // 空き時間を探す（最大2時間先まで）
  const findAvailableSlot = useCallback(
    (baseTime: Date): { start: Date; end: Date } => {
      let start = getNextQuarterHour(baseTime);
      let end = new Date(start.getTime() + 60 * 60 * 1000); // 1時間後

      // 最大8回（2時間分）試行
      for (let i = 0; i < 8; i++) {
        if (!checkOverlap(start, end)) {
          return { start, end };
        }
        // 15分ずらす
        start = new Date(start.getTime() + 15 * 60 * 1000);
        end = new Date(end.getTime() + 15 * 60 * 1000);
      }

      // 見つからなければ最初の候補を返す
      return {
        start: getNextQuarterHour(baseTime),
        end: new Date(getNextQuarterHour(baseTime).getTime() + 60 * 60 * 1000),
      };
    },
    [getNextQuarterHour, checkOverlap],
  );

  // ドラフトモードでInspectorを開く（DB保存は入力時に遅延実行）
  const handleCreatePlan = useCallback(() => {
    const now = new Date();
    const { start, end } = findAvailableSlot(now);

    // カレンダーに選択範囲を表示
    window.dispatchEvent(
      new CustomEvent('calendar-show-selection', {
        detail: {
          date: start,
          startHour: start.getHours(),
          startMinute: start.getMinutes(),
          endHour: end.getHours(),
          endMinute: end.getMinutes(),
        },
      }),
    );

    openInspectorWithDraft({
      title: '',
      due_date: format(start, 'yyyy-MM-dd'),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });
  }, [findAvailableSlot, openInspectorWithDraft]);

  const handleCreateRecord = () => {
    // TODO: Record機能 - start_time=nowでプラン作成し、記録モードで開く
    const now = new Date().toISOString();
    openInspectorWithDraft({
      title: '',
      start_time: now,
    });
  };

  const handleOpenHistory = () => {
    // TODO: History機能 - 過去30件の履歴サブメニューを開く
  };

  const handleOpenTemplates = () => {
    // TODO: Templates機能 - テンプレート一覧サブメニューを開く
  };

  const handleCreateTag = () => {
    openTagCreateModal();
  };

  const trigger = (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={size === 'sm' ? 'size-8' : 'size-10'}
        aria-label={t('sidebar.quickCreate')}
      >
        <Plus className={size === 'sm' ? 'size-4' : 'size-5'} />
      </Button>
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {tooltipContent ? (
        <HoverTooltip content={tooltipContent} side={tooltipSide} disabled={isOpen}>
          {trigger}
        </HoverTooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent side="right" align="start" sideOffset={4}>
        {/* Plan - 予定を作成 */}
        <DropdownMenuItem onClick={handleCreatePlan}>
          <CalendarPlus className="size-4" />
          {t('createSheet.plan')}
        </DropdownMenuItem>

        {/* Record - 記録 */}
        <DropdownMenuItem onClick={handleCreateRecord} disabled>
          <Clock className="size-4" />
          {t('createSheet.record')}
          <span className="text-muted-foreground ml-auto text-xs">{t('comingSoon')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* History - 履歴から作成 */}
        <DropdownMenuItem onClick={handleOpenHistory} disabled>
          <History className="size-4" />
          {t('createSheet.history')}
          <span className="text-muted-foreground ml-auto text-xs">{t('comingSoon')}</span>
        </DropdownMenuItem>

        {/* Templates - テンプレートから作成 */}
        <DropdownMenuItem onClick={handleOpenTemplates} disabled>
          <FileText className="size-4" />
          {t('createSheet.template')}
          <span className="text-muted-foreground ml-auto text-xs">{t('comingSoon')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Tags - タグ作成 */}
        <DropdownMenuItem onClick={handleCreateTag}>
          <Tag className="size-4" />
          {t('createNew.tag')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
