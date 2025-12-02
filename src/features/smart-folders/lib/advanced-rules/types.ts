/**
 * 高度なスマートフォルダルール - 型定義
 */

import { SmartFolderRule, SmartFolderRuleOperator } from '../../types'

import { AdvancedRuleOperator } from './operators'

// 拡張ルールタイプ（operator と value フィールドをオーバーライド）
export interface AdvancedSmartFolderRule extends Omit<SmartFolderRule, 'operator' | 'value'> {
  // 演算子：基本演算子 + 拡張演算子
  operator: SmartFolderRuleOperator | AdvancedRuleOperator

  // 値：基本の値 + 配列や複雑な値も許可
  value: string | number | boolean | Date | null | [number, number] | unknown

  // 正規表現フラグ
  isRegex?: boolean
  regexFlags?: string

  // カスタムフィールド
  customField?: string

  // 時間範囲の詳細設定
  timeRange?: {
    startTime?: string // HH:MM format
    endTime?: string // HH:MM format
    timezone?: string
    excludeWeekends?: boolean
    excludeHolidays?: boolean
  }

  // 複合条件のグループ化
  groupId?: string
  groupLogic?: 'AND' | 'OR'

  // 重み付け（複数ルールの優先度）
  weight?: number

  // 条件の有効期間
  validFrom?: Date
  validUntil?: Date

  // 動的パラメータ
  parameters?: Record<string, unknown>
}

// カスタム関数のシグネチャ
export type CustomRuleFunction = (fieldValue: unknown, rule: AdvancedSmartFolderRule) => boolean

// 安全なカスタム関数の定義
export interface SafeCustomFunction {
  name: string
  description: string
  validator: (fieldValue: unknown, rule: AdvancedSmartFolderRule) => boolean
  // セキュリティレベル（開発モードのみ許可などの制御用）
  securityLevel: 'safe' | 'restricted' | 'dangerous'
}

// カスタムフィールド定義
export interface CustomFieldDefinition {
  id: string
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'array'
  description: string
  validator?: (value: unknown) => boolean
  extractor: (item: unknown) => unknown // アイテムからフィールド値を抽出する関数
}
