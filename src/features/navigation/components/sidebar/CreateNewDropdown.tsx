'use client';

import { CalendarPlus, ListTodo, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useTranslations } from 'next-intl';

interface CreateNewDropdownProps {
  /** ボタンサイズ: 'default' = 40px, 'sm' = 32px */
  size?: 'default' | 'sm';
}

/**
 * 新規作成ドロップダウン
 *
 * Plan/Taskを選択して新規作成できるドロップダウンメニュー
 * - サイズはsize propsで制御（'default' = 40px, 'sm' = 32px）
 */
export function CreateNewDropdown({ size = 'default' }: CreateNewDropdownProps) {
  const t = useTranslations();
  const { createPlan } = usePlanMutations();
  const { openInspector } = usePlanInspectorStore();

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

  const handleCreateTask = () => {
    // TODO: Task機能が実装されたら有効化
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={size === 'sm' ? 'size-8' : 'size-10'}>
          <Plus className={size === 'sm' ? 'size-4' : 'size-5'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={4}>
        <DropdownMenuItem onClick={handleCreatePlan}>
          <CalendarPlus className="size-4" />
          {t('createNew.plan')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCreateTask} disabled>
          <ListTodo className="size-4" />
          {t('createNew.task')}
          <span className="text-muted-foreground ml-auto text-xs">{t('comingSoon')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
