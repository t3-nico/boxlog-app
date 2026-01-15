'use client';

import { Button } from '@/components/ui/button';
import { ColorPalettePicker } from '@/components/ui/color-palette-picker';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DEFAULT_GROUP_COLOR } from '@/config/ui/colors';
import { TAG_GROUP_NAME_MAX_LENGTH } from '@/features/tags/constants/colors';
import { useCreateTagGroup } from '@/features/tags/hooks/useTagGroups';
import { Check, Folder, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface TagListGroupCreateRowHandle {
  /** 作成モードを開始 */
  startCreate: () => void;
  /** 作成モードをキャンセル */
  cancelCreate: () => void;
  /** 作成中かどうか */
  isCreating: boolean;
}

interface TagListGroupCreateRowProps {
  /** 作成完了時のコールバック */
  onCreated?: () => void;
}

/**
 * グループインライン作成行コンポーネント（リスト用）
 *
 * リスト最下部に表示される新規グループ作成フォーム
 * - refを使用して外部から作成開始/キャンセルを制御可能
 * - Enterで保存、Escapeでキャンセル
 * - 外側クリックでキャンセル
 */
export const TagListGroupCreateRow = forwardRef<
  TagListGroupCreateRowHandle,
  TagListGroupCreateRowProps
>(({ onCreated }, ref) => {
  const t = useTranslations('tag');
  const createGroupMutation = useCreateTagGroup();

  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState<string>(DEFAULT_GROUP_COLOR);
  const rowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 外部からの制御用ハンドル
  useImperativeHandle(ref, () => ({
    startCreate: () => {
      setIsCreating(true);
      setNewGroupName('');
      setNewGroupColor(DEFAULT_GROUP_COLOR);
    },
    cancelCreate: () => {
      setIsCreating(false);
      setNewGroupName('');
      setNewGroupColor(DEFAULT_GROUP_COLOR);
    },
    isCreating,
  }));

  // 作成開始時にinputにフォーカス
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  // 保存処理
  const handleSave = useCallback(async () => {
    if (newGroupName.trim() === '') {
      setIsCreating(false);
      return;
    }

    try {
      await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        color: newGroupColor,
      });
      toast.success(t('toast.groupCreated', { name: newGroupName }));
      setIsCreating(false);
      setNewGroupName('');
      setNewGroupColor(DEFAULT_GROUP_COLOR);
      onCreated?.();
    } catch {
      toast.error(t('toast.groupCreateFailed'));
    }
  }, [newGroupName, newGroupColor, createGroupMutation, t, onCreated]);

  // キャンセル処理
  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setNewGroupName('');
    setNewGroupColor(DEFAULT_GROUP_COLOR);
  }, []);

  // 外側クリック検出
  useEffect(() => {
    if (!isCreating) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreating, handleCancel]);

  // 作成前: プレースホルダー行
  if (!isCreating) {
    return (
      <div
        ref={rowRef}
        role="button"
        tabIndex={0}
        className="hover:bg-state-hover flex cursor-pointer items-center gap-2 rounded-md px-3 py-2"
        onClick={() => setIsCreating(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCreating(true);
          }
        }}
      >
        <Plus className="text-muted-foreground size-4" />
        <span className="text-muted-foreground text-sm">{t('group.createInline')}</span>
      </div>
    );
  }

  // 作成中: 入力フォーム
  return (
    <div
      ref={rowRef}
      className="bg-surface-container/30 flex items-center gap-2 rounded-md px-3 py-2"
    >
      {/* カラーピッカー */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label={t('group.changeColor')}
          >
            <Folder className="size-4" style={{ color: newGroupColor }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <ColorPalettePicker selectedColor={newGroupColor} onColorSelect={setNewGroupColor} />
        </PopoverContent>
      </Popover>

      {/* 名前入力 */}
      <Input
        ref={inputRef}
        value={newGroupName}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length >= TAG_GROUP_NAME_MAX_LENGTH) {
            toast.info(t('group.nameLimitReached', { max: TAG_GROUP_NAME_MAX_LENGTH }), {
              id: 'group-name-limit',
            });
          }
          setNewGroupName(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
          } else if (e.key === 'Escape') {
            handleCancel();
          }
        }}
        placeholder={t('group.namePlaceholder')}
        maxLength={TAG_GROUP_NAME_MAX_LENGTH}
        className="h-7 max-w-xs flex-1 text-sm"
      />

      {/* 保存ボタン */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={handleSave}
        disabled={!newGroupName.trim() || createGroupMutation.isPending}
        aria-label={t('group.save')}
      >
        <Check className="size-4" />
      </Button>

      {/* キャンセルボタン */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={handleCancel}
        aria-label={t('group.cancel')}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
});

TagListGroupCreateRow.displayName = 'TagListGroupCreateRow';
