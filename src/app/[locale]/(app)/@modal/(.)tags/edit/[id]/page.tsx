'use client';

/**
 * タグ編集モーダル - Intercepting Route
 *
 * /tags/edit/[id] への遷移をインターセプトし、モーダルとして表示
 * - ブラウザバックでモーダルが閉じる
 * - 現在のページの上にオーバーレイ表示
 *
 * 直接 /tags/edit/[id] にアクセスした場合は、
 * /tags/edit/[id]/page.tsx がフルページとして表示される
 */

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { tagIconCategories, tagIconMapping, TagIconName } from '@/features/tags/constants/icons';
import { useUpdateTag } from '@/features/tags/hooks/useTags';
import { api } from '@/lib/trpc';

export default function TagEditInterceptedModal() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const tagId = params?.id as string | undefined;

  const {
    data: tag,
    isLoading,
    error,
  } = api.tags.getById.useQuery({ id: tagId! }, { enabled: !!tagId });
  const updateTagMutation = useUpdateTag();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#6b7280');
  const [icon, setIcon] = useState<TagIconName>('TagIcon');

  // タグデータをフォームに反映
  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color || '#6b7280');
      setIcon((tag.icon as TagIconName) || 'TagIcon');
    }
  }, [tag]);

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag || !tagId) return;

    try {
      await updateTagMutation.mutateAsync({
        id: tagId,
        name,
        color,
        // Note: icon field is not supported by the API yet
      });
      toast.success(t('tags.toast.updated', { name }));
      handleClose();
    } catch {
      toast.error(t('tags.toast.updateFailed'));
    }
  };

  if (error) {
    return (
      <Dialog open onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('common.error')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t('tags.error.notFound')}</p>
          <DialogFooter>
            <Button onClick={handleClose}>{t('common.actions.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('tags.actions.editTag')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="tag-name-input"
                  className="text-foreground mb-2 block text-sm font-normal"
                >
                  {t('tags.form.tagName')}
                </label>
                <Input
                  id="tag-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('tags.form.namePlaceholder')}
                  required
                />
              </div>
              <div>
                <div id="color-label" className="text-foreground mb-2 block text-sm font-normal">
                  {t('tags.form.color')}
                </div>

                {/* プリセットカラー */}
                <div
                  className="grid grid-cols-8 gap-2"
                  role="radiogroup"
                  aria-labelledby="color-label"
                >
                  {[
                    '#ef4444',
                    '#f97316',
                    '#f59e0b',
                    '#eab308',
                    '#84cc16',
                    '#22c55e',
                    '#10b981',
                    '#14b8a6',
                    '#06b6d4',
                    '#0ea5e9',
                    '#3b82f6',
                    '#6366f1',
                    '#8b5cf6',
                    '#a855f7',
                    '#d946ef',
                    '#ec4899',
                  ].map((presetColor) => (
                    <Button
                      key={presetColor}
                      type="button"
                      variant="ghost"
                      onClick={() => setColor(presetColor)}
                      className={`h-8 w-8 rounded-md border-2 p-0 transition-all ${
                        color === presetColor
                          ? 'border-border scale-110'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: presetColor }}
                      title={presetColor}
                      aria-label={`Select color ${presetColor}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div id="icon-label" className="text-foreground mb-2 block text-sm font-normal">
                  {t('tags.labels.icon')}
                </div>

                {/* 現在選択されているアイコンのプレビュー */}
                <div
                  className="border-border bg-surface-container mb-3 flex items-center gap-3 rounded-xl border p-3"
                  style={{ '--tag-color': color } as React.CSSProperties}
                >
                  {(() => {
                    const IconComponent = tagIconMapping[icon];
                    return (
                      <IconComponent
                        className="tag-icon h-5 w-5"
                        style={{ color, '--tag-color': color } as React.CSSProperties}
                      />
                    );
                  })()}
                  <span className="text-foreground text-sm font-normal">{icon}</span>
                </div>

                {/* アイコン選択 */}
                <div
                  className="border-border max-h-64 overflow-y-auto rounded-xl border"
                  aria-labelledby="icon-label"
                >
                  {Object.entries(tagIconCategories).map(([category, icons]) => (
                    <div key={category} className="border-border border-b p-3 last:border-b-0">
                      <p className="text-muted-foreground mb-2 text-xs font-normal">{category}</p>
                      <div className="grid grid-cols-6 gap-2">
                        {icons.map((iconName) => {
                          const IconComponent = tagIconMapping[iconName as TagIconName];
                          return (
                            <Button
                              key={iconName}
                              type="button"
                              variant="ghost"
                              onClick={() => setIcon(iconName as TagIconName)}
                              className={`rounded-md p-2 ${
                                icon === iconName
                                  ? 'border-primary bg-primary-state-selected border-2'
                                  : 'border-border bg-secondary text-secondary-foreground border'
                              }`}
                              title={iconName}
                            >
                              <IconComponent className="text-muted-foreground tag-icon mx-auto h-5 w-5" />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={updateTagMutation.isPending}>
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
