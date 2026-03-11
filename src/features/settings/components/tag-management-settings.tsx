'use client';

import { useCallback, useState } from 'react';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTags } from '@/hooks/useTagsQuery';
import { TAG_COLOR_MAP, TAG_COLOR_NAMES, type TagColorName } from '@/lib/tag-colors';
import { cn } from '@/lib/utils';
import { api } from '@/platform/trpc';

import { SettingsCard } from '@/components/common/SettingsCard';

/**
 * タグ管理設定コンポーネント
 *
 * タグ一覧（色ドット + 名前 + 編集/削除）とグループ管理
 */
export function TagManagementSettings() {
  const t = useTranslations();
  const { data: tags, isPending } = useTags();
  const utils = api.useUtils();

  // 新規タグ作成
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<TagColorName>('blue');
  const [isCreating, setIsCreating] = useState(false);

  // 編集中タグ
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState<TagColorName>('blue');

  const createMutation = api.tags.create.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
    },
  });

  const updateMutation = api.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
    },
  });

  const deleteMutation = api.tags.delete.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
    },
  });

  const handleCreate = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    try {
      await createMutation.mutateAsync({ name: trimmed, color: newColor });
      toast.success(t('tags.toast.created', { name: trimmed }));
      setNewName('');
      setNewColor('blue');
      setIsCreating(false);
    } catch {
      toast.error(t('tags.toast.createFailed'));
    }
  }, [newName, newColor, createMutation, t]);

  const handleStartEdit = useCallback((id: string, name: string, color: string | null) => {
    setEditingId(id);
    setEditName(name);
    setEditColor((color as TagColorName) || 'blue');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (!trimmed) return;

    try {
      await updateMutation.mutateAsync({ id: editingId, name: trimmed, color: editColor });
      toast.success(t('tags.toast.updated', { name: trimmed }));
      setEditingId(null);
    } catch {
      toast.error(t('tags.toast.updateFailed'));
    }
  }, [editingId, editName, editColor, updateMutation, t]);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success(t('tags.toast.deleted', { name }));
      } catch {
        toast.error(t('tags.toast.updateFailed'));
      }
    },
    [deleteMutation, t],
  );

  if (isPending) {
    return (
      <SettingsCard>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </SettingsCard>
    );
  }

  const activeTags = tags?.filter((tag) => tag.is_active) ?? [];

  return (
    <div className="space-y-8">
      <SettingsCard
        title={t('settings.dialog.categories.tags')}
        actions={
          !isCreating ? (
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="mr-1 h-4 w-4" />
              {t('tags.page.createTag')}
            </Button>
          ) : undefined
        }
      >
        {/* New tag form */}
        {isCreating && (
          <div className="border-border mb-4 space-y-3 rounded-lg border p-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('tags.form.namePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />
            <ColorPicker value={newColor} onChange={setNewColor} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                {t('common.create')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}

        {/* Tag list */}
        {activeTags.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">{t('tags.page.noTags')}</p>
        ) : (
          <div className="divide-border divide-y">
            {activeTags.map((tag) => (
              <div key={tag.id} className="flex items-center gap-3 py-3">
                {editingId === tag.id ? (
                  <>
                    <div
                      className={cn('h-3 w-3 shrink-0 rounded-full', TAG_COLOR_MAP[editColor]?.dot)}
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                    />
                    <ColorPicker value={editColor} onChange={setEditColor} compact />
                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                      {t('common.save')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      {t('common.cancel')}
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className={cn(
                        'h-3 w-3 shrink-0 rounded-full',
                        TAG_COLOR_MAP[(tag.color as TagColorName) || 'blue']?.dot,
                      )}
                    />
                    <span className="flex-1 text-sm">{tag.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleStartEdit(tag.id, tag.name, tag.color)}
                      aria-label={t('tags.page.edit')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive h-8 w-8"
                      onClick={() => handleDelete(tag.id, tag.name)}
                      aria-label={t('tags.page.delete')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
  compact,
}: {
  value: TagColorName;
  onChange: (color: TagColorName) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn('flex gap-1.5', compact && 'gap-1')}>
      {TAG_COLOR_NAMES.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            'rounded-full transition-transform',
            compact ? 'h-5 w-5' : 'h-6 w-6',
            TAG_COLOR_MAP[color].dot,
            value === color && 'ring-ring ring-2 ring-offset-2',
          )}
          onClick={() => onChange(color)}
          aria-label={color}
        />
      ))}
    </div>
  );
}
