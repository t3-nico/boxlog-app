'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSupportText } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { TAG_NAME_MAX_LENGTH } from '@/features/tags/constants/colors';
import { useTagGroups } from '@/features/tags/hooks/useTagGroups';
import type { CreateTagInput, TagGroup } from '@/features/tags/types';
import { logger } from '@/lib/logger';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TagCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTagInput) => Promise<void>;
  /** デフォルトの親タグID（子タグ作成時にプリセット） */
  defaultParentId?: string | null;
}

/**
 * タグ作成モーダル
 *
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 *
 * スタイルガイド準拠:
 * - 8pxグリッドシステム（p-6, gap-4, mb-6等）
 * - 角丸: rounded-xl（16px）for ダイアログ
 * - Card: bg-card（カード、ダイアログ用）
 */
export const TagCreateModal = ({
  isOpen,
  onClose,
  onSave,
  defaultParentId,
}: TagCreateModalProps) => {
  const t = useTranslations();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [parentId, setParentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

  // タググループ（親タグ）取得 - モーダルが開いている時だけフェッチ
  const { data: parentTags = [] as TagGroup[] } = useTagGroups({ enabled: isOpen });

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true);
  }, []);

  // モーダルが開いたらリセット（defaultParentIdがあればプリセット）
  useEffect(() => {
    if (isOpen) {
      setName('');
      setColor('#3B82F6');
      setParentId(defaultParentId ?? null);
      setError('');
      setIsParentDropdownOpen(false);
    }
  }, [isOpen, defaultParentId]);

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    if (!isParentDropdownOpen) return;

    const handleClickOutside = () => {
      setIsParentDropdownOpen(false);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isParentDropdownOpen]);

  const handleSubmit = useCallback(async () => {
    setError('');

    if (!name.trim()) {
      setError(t('tags.validation.nameEmpty'));
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        color,
        parentId: parentId,
      });
      onClose();
    } catch (err) {
      logger.error('Tag creation failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('unique') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('重複') ||
        errorMessage.includes('既に存在')
      ) {
        setError(t('tags.form.duplicateName'));
      } else {
        setError(t('tags.errors.createFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [name, color, parentId, onSave, onClose, t]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose();
      }
    },
    [isLoading, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading && name.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, isLoading, name],
  );

  const selectedParent = parentTags.find((p) => p.id === parentId);

  if (!mounted || !isOpen) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-create-dialog-title"
    >
      {/* ダイアログコンテンツ: bg-card, rounded-xl, p-6 */}
      <div
        className="animate-in zoom-in-95 fade-in bg-card text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 400px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 id="tag-create-dialog-title" className="mb-6 text-lg font-bold">
          {t('tags.modal.createTitle')}
        </h2>

        {/* Form */}
        <FieldGroup className="mb-6">
          {/* タグ名 */}
          <Field>
            <FieldLabel htmlFor="tag-name" required requiredLabel={t('common.form.required')}>
              {t('tags.form.tagName')}
            </FieldLabel>
            <div className="flex items-center justify-between">
              <FieldSupportText id="tag-name-support">
                {t('tags.form.examplePlaceholder')}
              </FieldSupportText>
              <span className="text-muted-foreground text-xs tabular-nums">
                {name.length}/{TAG_NAME_MAX_LENGTH}
              </span>
            </div>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // 入力変更時にエラーをクリア
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              maxLength={TAG_NAME_MAX_LENGTH}
              aria-invalid={!!error}
              aria-describedby={error ? 'tag-name-error tag-name-support' : 'tag-name-support'}
              autoFocus
            />
            {error && (
              <FieldError id="tag-name-error" announceImmediately>
                {error}
              </FieldError>
            )}
            {name.length >= TAG_NAME_MAX_LENGTH && (
              <FieldError noPrefix>{t('common.validation.limitReached')}</FieldError>
            )}
          </Field>

          {/* カラー */}
          <Field>
            <FieldLabel>{t('tags.form.color')}</FieldLabel>
            <ColorPalettePicker selectedColor={color} onColorSelect={setColor} />
          </Field>

          {/* 親タグ選択 */}
          <Field>
            <FieldLabel>{t('tags.form.group')}</FieldLabel>
            <FieldSupportText>{t('tags.form.groupSupportText')}</FieldSupportText>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsParentDropdownOpen(!isParentDropdownOpen);
                }}
                className="border-input bg-background hover:bg-state-hover flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm"
              >
                <span className={selectedParent ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedParent ? selectedParent.name : t('tags.sidebar.uncategorized')}
                </span>
                <ChevronDown className="text-muted-foreground size-4" />
              </button>

              {/* Dropdown menu */}
              {isParentDropdownOpen && (
                <div className="bg-card border-border absolute top-full z-10 mt-1 w-full rounded-md border py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setParentId(null);
                      setIsParentDropdownOpen(false);
                    }}
                    className="hover:bg-state-hover w-full px-3 py-2 text-left text-sm"
                  >
                    {t('tags.sidebar.uncategorized')}
                  </button>
                  {parentTags.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => {
                        setParentId(parent.id);
                        setIsParentDropdownOpen(false);
                      }}
                      className="hover:bg-state-hover flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                    >
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: parent.color ?? '#6B7280' }}
                      />
                      {parent.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
        </FieldGroup>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="hover:bg-state-hover"
          >
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t('actions.creating') : t('actions.create')}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
