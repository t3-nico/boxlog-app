/**
 * Fieldset コンポーネント - app コンポーネント用
 * @see /src/components/ui/field.tsx を基にしたエイリアス
 */

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'

// Fieldset としてエクスポート（UIコンポーネントの FieldSet と同じ）
export const Fieldset = FieldSet
export const Legend = FieldLegend
export const Description = FieldDescription
export const Label = FieldLabel
export const ErrorMessage = FieldError

// 追加エクスポート（互換性のため）
export { Field, FieldContent, FieldGroup, FieldSeparator, FieldTitle }
