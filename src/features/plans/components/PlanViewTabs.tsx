'use client';

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { AlertDialogConfirm } from '@/components/ui/alert-dialog-confirm';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { usePlanViewStore } from '../stores/usePlanViewStore';
import type { PlanView } from '../types/view';

/**
 * Plan View Tabs Component
 *
 * 複数のカスタマイズ可能なViewをタブで表示・切り替え
 *
 * @example
 * ```tsx
 * <PlanViewTabs />
 * ```
 */
export function PlanViewTabs() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;

  const { views, activeViewId, setActiveView, deleteView } = usePlanViewStore();
  const [editingView, setEditingView] = useState<PlanView | null>(null);
  const [deleteConfirmView, setDeleteConfirmView] = useState<PlanView | null>(null);

  const handleViewChange = (viewId: string) => {
    const view = views.find((v) => v.id === viewId);
    if (!view) return;

    setActiveView(viewId);
    router.push(`/${locale}/inbox?view=${viewId}`);
  };

  const handleOpenDeleteDialog = (viewId: string) => {
    const view = views.find((v) => v.id === viewId);
    if (view) {
      setDeleteConfirmView(view);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmView) {
      deleteView(deleteConfirmView.id);
      setDeleteConfirmView(null);
    }
  };

  return (
    <>
      <div className="flex h-10 items-center gap-4">
        {/* View タブ - pill形式 */}
        <Tabs value={activeViewId ?? 'default-all'} onValueChange={handleViewChange}>
          <TabsList className="bg-secondary border-border h-9 rounded-full border p-0.5">
            {views.map((view) => (
              <div key={view.id} className="group relative flex items-center">
                <TabsTrigger
                  value={view.id}
                  className="data-[state=inactive]:hover:bg-state-hover data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground h-7 rounded-full px-3 text-xs"
                >
                  {view.name}
                </TabsTrigger>

                {/* デフォルト以外は編集・削除メニュー表示 - タッチデバイスでは常に表示 */}
                {!view.id.startsWith('default-') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1/2 -right-2 h-10 w-10 -translate-y-1/2 p-0 opacity-100 sm:size-8 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">メニュー</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingView(view)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t('common.plan.view.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleOpenDeleteDialog(view.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.plan.view.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 編集ダイアログ */}
      {editingView && (
        <div>
          {/* 編集ダイアログをここに実装 */}
          <p>編集: {editingView.name}</p>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialogConfirm
        open={!!deleteConfirmView}
        onOpenChange={(open) => !open && setDeleteConfirmView(null)}
        onConfirm={handleDeleteConfirm}
        title={t('common.plan.view.deleteConfirmTitle', { name: deleteConfirmView?.name ?? '' })}
        description={t('common.plan.view.deleteConfirmDescription')}
        confirmText={t('common.plan.view.deleteConfirm')}
        cancelText={t('actions.cancel')}
        variant="destructive"
      />
    </>
  );
}
