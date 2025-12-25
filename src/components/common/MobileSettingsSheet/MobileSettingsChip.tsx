'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface MobileSettingsChipProps {
  /** チップのID */
  id: string;
  /** チップのラベル */
  label: string;
  /** 選択状態 */
  checked: boolean;
  /** 選択変更時のコールバック */
  onCheckedChange: (checked: boolean) => void;
}

/**
 * モバイル設定シート用チップコンポーネント
 *
 * タップで選択/解除できるチップ型のトグルボタン
 *
 * @example
 * ```tsx
 * <MobileSettingsChip
 *   id="status-todo"
 *   label="Todo"
 *   checked={status.includes('todo')}
 *   onCheckedChange={(checked) => toggleStatus('todo')}
 * />
 * ```
 */
export function MobileSettingsChip({
  id,
  label,
  checked,
  onCheckedChange,
}: MobileSettingsChipProps) {
  return (
    <Label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
        checked
          ? 'border-primary bg-primary-container text-on-primary-container'
          : 'border-border hover:bg-state-hover'
      }`}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(!!checked)}
        className="sr-only"
      />
      {label}
      {checked && <Check className="size-3" />}
    </Label>
  );
}
