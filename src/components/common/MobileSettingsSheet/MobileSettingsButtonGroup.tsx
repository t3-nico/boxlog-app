'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface MobileSettingsOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface MobileSettingsButtonGroupProps<T> {
  /** 選択肢 */
  options: MobileSettingsOption<T>[];
  /** 現在の値 */
  value: T;
  /** 値変更時のコールバック */
  onValueChange: (value: T) => void;
  /** ボタンを横に広げるか */
  fullWidth?: boolean;
}

/**
 * モバイル設定シート用ボタングループコンポーネント
 *
 * 複数の選択肢から1つを選ぶボタングループ
 *
 * @example
 * ```tsx
 * <MobileSettingsButtonGroup
 *   options={[
 *     { value: 'board', label: 'Board', icon: <Columns3 /> },
 *     { value: 'table', label: 'Table', icon: <Table2 /> },
 *   ]}
 *   value={displayMode}
 *   onValueChange={setDisplayMode}
 *   fullWidth
 * />
 * ```
 */
export function MobileSettingsButtonGroup<T extends string | null>({
  options,
  value,
  onValueChange,
  fullWidth = false,
}: MobileSettingsButtonGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={String(option.value)}
          variant={value === option.value ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onValueChange(option.value)}
          className={fullWidth ? 'flex-1' : ''}
        >
          {option.icon && <span className="mr-2 [&>svg]:size-4">{option.icon}</span>}
          {option.label}
          {value === option.value && !option.icon && <Check className="ml-1 size-3" />}
        </Button>
      ))}
    </div>
  );
}
