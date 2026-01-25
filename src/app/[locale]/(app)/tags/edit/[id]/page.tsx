'use client';

/**
 * タグ編集ページ - フルページ表示
 *
 * 直接 /tags/edit/[id] にアクセスした場合のフォールバック
 * Intercepting Route がない場合（直リンク、リロード）に表示される
 *
 * 編集完了後は /calendar へリダイレクト
 */

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { tagIconCategories, tagIconMapping, TagIconName } from '@/features/tags/constants/icons';
import { useUpdateTag } from '@/features/tags/hooks';
import { api } from '@/lib/trpc';

export default function TagEditPage() {
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
    router.push('/calendar');
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
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('common.error')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('tags.error.notFound')}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleClose}>{t('common.actions.goBack')}</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{t('tags.actions.editTag')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={updateTagMutation.isPending}>
                {t('common.actions.save')}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
