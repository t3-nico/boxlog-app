'use client';

import { useCallback, useState } from 'react';

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
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);
  const { openTagCreateModal } = useTagModalNavigation();
  const [isOpen, setIsOpen] = useState(false);

  // Plan作成: PlanInspector をドラフトモードで開く（Planタブ）
  const handleCreatePlan = useCallback(() => {
    openInspectorWithDraft(undefined, 'plan');
  }, [openInspectorWithDraft]);

  // Record作成: PlanInspector をドラフトモードで開く（Recordタブ）
  const handleCreateRecord = useCallback(() => {
    openInspectorWithDraft(undefined, 'record');
  }, [openInspectorWithDraft]);

  // History機能: 将来実装予定（過去30件の履歴からクイック作成）
  const handleOpenHistory = () => {};

  // Templates機能: 将来実装予定（保存済みテンプレートから作成）
  const handleOpenTemplates = () => {};

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
        <DropdownMenuItem onClick={handleCreateRecord}>
          <Clock className="size-4" />
          {t('createSheet.record')}
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
