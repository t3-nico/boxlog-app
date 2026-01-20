'use client';

import { CalendarPlus, Clock, FileText, History, Plus, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useTagCreateModalStore } from '@/features/tags/stores/useTagCreateModalStore';
import { useTranslations } from 'next-intl';

interface CreateNewDropdownProps {
  /** ボタンサイズ: 'default' = 40px, 'sm' = 32px */
  size?: 'default' | 'sm';
}

/**
 * 新規作成ドロップダウン
 *
 * Plan/Record/History/Templates/Tagsを選択して新規作成できるドロップダウンメニュー
 * - サイズはsize propsで制御（'default' = 40px, 'sm' = 32px）
 */
export function CreateNewDropdown({ size = 'default' }: CreateNewDropdownProps) {
  const t = useTranslations();
  const { createPlan } = usePlanMutations();
  const { openInspector } = usePlanInspectorStore();
  const { openModal: openTagCreateModal } = useTagCreateModalStore();

  const handleCreatePlan = async () => {
    try {
      const newPlan = await createPlan.mutateAsync({
        title: t('createNew.defaultPlanTitle'),
        status: 'open',
      });

      if (newPlan?.id) {
        openInspector(newPlan.id);
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleCreateRecord = async () => {
    // TODO: Record機能 - start_time=nowでプラン作成し、記録モードで開く
    try {
      const now = new Date().toISOString();
      const newPlan = await createPlan.mutateAsync({
        title: t('createNew.defaultPlanTitle'),
        status: 'open',
        start_time: now,
      });

      if (newPlan?.id) {
        openInspector(newPlan.id);
      }
    } catch (error) {
      console.error('Failed to create record:', error);
    }
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={size === 'sm' ? 'size-8' : 'size-10'}>
          <Plus className={size === 'sm' ? 'size-4' : 'size-5'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={4}>
        {/* Plan - 予定を作成 */}
        <DropdownMenuItem onClick={handleCreatePlan}>
          <CalendarPlus className="size-4" />
          {t('createSheet.plan')}
        </DropdownMenuItem>

        {/* Record - 実績を記録 */}
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
