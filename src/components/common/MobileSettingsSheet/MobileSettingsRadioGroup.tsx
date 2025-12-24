'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface MobileSettingsRadioOption<T> {
  value: T
  label: string
}

interface MobileSettingsRadioGroupProps<T extends string> {
  /** 選択肢 */
  options: MobileSettingsRadioOption<T>[]
  /** 現在の値 */
  value: T
  /** 値変更時のコールバック */
  onValueChange: (value: T) => void
  /** IDプレフィックス */
  idPrefix: string
}

/**
 * モバイル設定シート用ラジオグループコンポーネント
 *
 * 複数の選択肢から1つを選ぶラジオボタングループ（チップ型）
 *
 * @example
 * ```tsx
 * <MobileSettingsRadioGroup
 *   options={[
 *     { value: 'all', label: 'すべて' },
 *     { value: 'today', label: '今日' },
 *   ]}
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
}: MobileSettingsRadioGroupProps<T>) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onValueChange(v as T)}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${idPrefix}-${option.value}`}
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
              value === option.value
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-border hover:bg-state-hover'
            }`}
          >
            <RadioGroupItem value={option.value} id={`${idPrefix}-${option.value}`} className="sr-only" />
            {option.label}
          </Label>
        ))}
      </div>
    </RadioGroup>
  )
}
