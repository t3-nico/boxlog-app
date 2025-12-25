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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TAG_DESCRIPTION_MAX_LENGTH, TAG_NAME_MAX_LENGTH } from '@/features/tags/constants/colors';
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups';
import type { Tag, TagGroup, UpdateTagInput } from '@/features/tags/types';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface TagEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateTagInput) => Promise<void>;
  tag: Tag | null;
}

export const TagEditModal = ({ isOpen, onClose, onSave, tag }: TagEditModalProps) => {
  const t = useTranslations();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // タググループ取得
  const { data: groups = [] as TagGroup[] } = useTagGroups();

  useEffect(() => {
    if (isOpen && tag) {
      setName(tag.name);
      setColor(tag.color || '#3B82F6');
      setDescription(tag.description || '');
      setGroupId(tag.group_id || '__none__');
      setError('');
    }
  }, [isOpen, tag]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!name.trim()) {
        setError(t('tag.validation.nameEmpty'));
        return;
      }

      setIsLoading(true);
      try {
        await onSave({
          name: name.trim(),
          color,
          description: description.trim() || undefined,
          group_id: groupId && groupId !== '__none__' ? groupId : null,
        });
        onClose();
      } catch (err) {
        console.error('Tag update failed:', err);
        // エラーメッセージから重複エラーを検出
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          errorMessage.includes('duplicate') ||
          errorMessage.includes('unique') ||
          errorMessage.includes('重複') ||
          errorMessage.includes('既に存在')
        ) {
          setError(t('tag.form.duplicateName'));
        } else {
          setError(t('tag.errors.updateFailed'));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [name, color, description, groupId, onSave, onClose, t],
  );

  if (!tag) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('tag.modal.editTitle')}</DialogTitle>
          <DialogDescription>{tag.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* タグ名 */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('tag.form.tagNameRequired')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('tag.form.examplePlaceholder')}
                maxLength={TAG_NAME_MAX_LENGTH}
                required
              />
            </div>

            {/* カラー */}
            <div className="grid gap-2">
              <Label htmlFor="color">{t('tag.form.color')}</Label>
              <ColorPalettePicker selectedColor={color} onColorSelect={setColor} />
            </div>

            {/* グループ */}
            <div className="grid gap-2">
              <Label htmlFor="group">{t('tag.form.group')}</Label>
              <Select value={groupId ?? undefined} onValueChange={(value) => setGroupId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tag.form.selectGroupPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('tag.sidebar.uncategorized')}</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 説明 */}
            <div className="grid gap-2">
              <Label htmlFor="description">{t('tag.form.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= TAG_DESCRIPTION_MAX_LENGTH) {
                    setDescription(e.target.value);
                  } else {
                    toast.info(`説明は${TAG_DESCRIPTION_MAX_LENGTH}文字までです`, {
                      id: 'description-limit',
                    });
                  }
                }}
                placeholder={t('tag.form.descriptionPlaceholder')}
                rows={3}
                maxLength={TAG_DESCRIPTION_MAX_LENGTH}
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('tag.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? t('tag.modal.updating') : t('tag.modal.update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
