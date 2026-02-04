'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';

interface MobileSettingsRadioOption<T> {
  value: T;
  label: string;
}

interface MobileSettingsRadioGroupProps<T extends string> {
  /** 選択肢 */
  options: MobileSettingsRadioOption<T>[];
  /** 現在の値 */
  value: T;
  /** 値変更時のコールバック */
  onValueChange: (value: T) => void;
  /** IDプレフィックス */
  idPrefix: string;
  /** 表示バリアント: chip（横並びチップ）, list（縦並びリスト） */
  variant?: 'chip' | 'list';
}

/**
 * モバイル設定シート用ラジオグループコンポーネント
 *
 * 複数の選択肢から1つを選ぶラジオボタングループ
 *
 * @example
 * ```tsx
 * // Chip形式（デフォルト）
 * <MobileSettingsRadioGroup
 *   options={[{ value: 'all', label: 'すべて' }]}
 *   value={dueDate}
 *   onValueChange={setDueDate}
 *   idPrefix="mobile-due-date"
 * />
 *
 * // List形式（Apple Settings風）
 * <MobileSettingsRadioGroup
 *   variant="list"
 *   options={[{ value: 'all', label: 'すべて' }]}
 *   value={dueDate}
 *   onValueChange={setDueDate}
 *   idPrefix="mobile-due-date"
 * />
 * ```
 */
export function MobileSettingsRadioGroup<T extends string>({
  options,
  value,
  onValueChange,
  idPrefix,
  variant = 'chip',
}: MobileSettingsRadioGroupProps<T>) {
  if (variant === 'list') {
    return (
      <RadioGroup value={value} onValueChange={(v) => onValueChange(v as T)}>
        <div className="border-border bg-card rounded-lg border">
          {options.map((option, index) => (
            <Label
              key={option.value}
              htmlFor={`${idPrefix}-${option.value}`}
              className={`hover:bg-state-hover flex cursor-pointer items-center justify-between px-4 py-2 text-sm transition-colors ${
                index !== options.length - 1 ? 'border-border border-b' : ''
              }`}
            >
              <span>{option.label}</span>
              <RadioGroupItem
                value={option.value}
                id={`${idPrefix}-${option.value}`}
                className="sr-only"
              />
              {value === option.value && <Check className="text-primary size-4" />}
            </Label>
          ))}
        </div>
      </RadioGroup>
    );
  }

  return (
    <RadioGroup value={value} onValueChange={(v) => onValueChange(v as T)}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${idPrefix}-${option.value}`}
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
              value === option.value
                ? 'border-primary bg-state-active text-state-active-foreground'
                : 'border-border hover:bg-state-hover'
            }`}
          >
            <RadioGroupItem
              value={option.value}
              id={`${idPrefix}-${option.value}`}
              className="sr-only"
            />
            {option.label}
          </Label>
        ))}
      </div>
    </RadioGroup>
  );
}
