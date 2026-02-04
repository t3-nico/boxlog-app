'use client';

import { useCallback, useState } from 'react';

import { TAG_NAME_MAX_LENGTH } from '@/features/tags/constants/colors';
import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Tag interface
interface Tag {
  id: string;
  name: string;
  color: string;
}

interface QuickTagCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTag: (tag: Omit<Tag, 'id'>) => void;
}

export const QuickTagCreateModal = ({ isOpen, onClose, onCreateTag }: QuickTagCreateModalProps) => {
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const t = useTranslations();

  // jsx-no-bind optimization: Event handlers
  const handleTagNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value);
  }, []);

  const createColorHandler = useCallback((color: string) => {
    return () => setSelectedColor(color);
  }, []);

  const presetColors = [
    '#ef4444', // red
    '#f59e0b', // yellow
    '#10b981', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6b7280', // gray
    '#f97316', // orange
  ];

  const handleCreateTag = useCallback(() => {
    if (tagName.trim()) {
      onCreateTag({
        name: tagName.trim(),
        color: selectedColor,
      });
      setTagName('');
      setSelectedColor('#3b82f6');
      onClose();
    }
  }, [tagName, selectedColor, onCreateTag, onClose]);

  const handleClose = useCallback(() => {
    setTagName('');
    setSelectedColor('#3b82f6');
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleCreateTag();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleCreateTag, handleClose],
  );

  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose],
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        role="button"
        tabIndex={0}
        className="bg-overlay fixed inset-0 z-50"
        onClick={handleClose}
        onKeyDown={handleOverlayKeyDown}
        aria-label={t('aria.closeModal')}
      />

      {/* Modal */}
      <div className="bg-popover fixed top-1/2 left-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 transform rounded-2xl shadow-xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b p-4">
          <h2 className="text-foreground text-lg font-bold">{t('tags.modal.createTitle')}</h2>
          <Button type="button" variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="text-muted-foreground h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          <div>
            <label
              htmlFor="tag-name-input"
              className="text-muted-foreground mb-2 block text-sm font-normal"
            >
              {t('tags.form.tagName')}
            </label>
            <Input
              id="tag-name-input"
              type="text"
              value={tagName}
              onChange={handleTagNameChange}
              placeholder={t('tags.form.namePlaceholder')}
              maxLength={TAG_NAME_MAX_LENGTH}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <div
              className="text-muted-foreground mb-2 block text-sm font-normal"
              id="color-selection-label"
            >
              {t('tags.form.color')}
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="color-selection-label"
            >
              {presetColors.map((color) => (
                <Button
                  key={color}
                  type="button"
                  variant="ghost"
                  onClick={createColorHandler(color)}
                  className={cn(
                    'h-10 w-10 rounded-2xl p-0 transition-all hover:scale-105 hover:bg-transparent',
                    selectedColor === color && 'ring-primary ring-2 ring-offset-2',
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-surface-container rounded-2xl p-4">
            <div className="text-muted-foreground mb-2 text-xs font-normal">
              {t('tags.form.preview')}:
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedColor }} />
              <span className="text-foreground text-sm">
                {tagName || t('tags.form.tagNamePlaceholder')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex justify-end gap-2 border-t p-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('common.actions.cancel')}
          </Button>
          <Button type="button" onClick={handleCreateTag} disabled={!tagName.trim()}>
            <Plus className="h-4 w-4" />
            {t('tags.page.createTag')}
          </Button>
        </div>
      </div>
    </>
  );
};
