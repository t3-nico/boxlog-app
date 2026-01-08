'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors';
import type { TagGroup } from '@/features/tags/types';
import { useTranslations } from 'next-intl';

interface TagGroupManageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** 編集対象のグループ。nullの場合は新規作成モード */
  group: TagGroup | null;
  onSave: (data: { name: string; color: string }) => Promise<void>;
}

/**
 * タググループ作成/編集ダイアログ
 *
 * - group=null: 新規作成モード
 * - group={...}: 編集モード
 */
export function TagGroupManageDialog({
  isOpen,
  onClose,
  group,
  onSave,
}: TagGroupManageDialogProps) {
  const t = useTranslations('tag');
  const isEditMode = group !== null;

  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_GROUP_COLOR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ダイアログが開いたら初期化
  useEffect(() => {
    if (isOpen) {
      if (group) {
        setName(group.name);
        setColor(group.color || DEFAULT_GROUP_COLOR);
      } else {
        setName('');
        setColor(DEFAULT_GROUP_COLOR);
      }
      setError('');
    }
  }, [isOpen, group]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!name.trim()) {
        setError(t('toast.groupNameRequired'));
        return;
      }

      setIsLoading(true);
      try {
        await onSave({
          name: name.trim(),
          color: color || DEFAULT_GROUP_COLOR,
        });
        onClose();
      } catch (err) {
        console.error('Tag group save failed:', err);
        setError(isEditMode ? t('toast.groupUpdateFailed') : t('toast.groupCreateFailed'));
      } finally {
        setIsLoading(false);
      }
    },
    [name, color, onSave, onClose, t, isEditMode],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('group.editTitle') : t('group.createTitle')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('group.editDescription') : t('group.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* グループ名 */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('group.nameRequired')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('group.namePlaceholder')}
                required
                autoFocus
              />
            </div>

            {/* カラー */}
            <div className="grid gap-2">
              <Label htmlFor="color">{t('form.color')}</Label>
              <ColorPalettePicker selectedColor={color} onColorSelect={setColor} />
            </div>

            {/* エラー表示 */}
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading
                ? isEditMode
                  ? t('actions.saving')
                  : t('actions.creating')
                : isEditMode
                  ? t('actions.save')
                  : t('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
