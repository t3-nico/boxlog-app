/**
 * ルールビルダー（高度版）
 */

import { SmartFolderRuleField } from '../../types'

import { AdvancedRuleOperator } from './operators'
import type { AdvancedSmartFolderRule } from './types'

export class AdvancedRuleBuilder {
  private rules: AdvancedSmartFolderRule[] = []
  private currentGroupId?: string

  /**
   * グループの開始
   */
  startGroup(groupId: string, _logic: 'AND' | 'OR' = 'AND'): this {
    this.currentGroupId = groupId
    return this
  }

  /**
   * グループの終了
   */
  endGroup(): this {
    delete this.currentGroupId
    return this
  }

  /**
   * 正規表現ルールの追加
   */
  regex(field: SmartFolderRuleField, pattern: string, flags?: string): this {
    const rule: AdvancedSmartFolderRule = {
      field,
      operator: AdvancedRuleOperator.REGEX_MATCH,
      value: pattern,
      logic: 'AND',
      isRegex: true,
      ...(flags !== undefined && { regexFlags: flags }),
      ...(this.currentGroupId !== undefined && { groupId: this.currentGroupId }),
    }
    this.addRule(rule)
    return this
  }

  /**
   * 範囲ルールの追加
   */
  between(field: SmartFolderRuleField, min: number, max: number): this {
    const rule: AdvancedSmartFolderRule = {
      field,
      operator: AdvancedRuleOperator.BETWEEN,
      value: [min, max],
      logic: 'AND',
      ...(this.currentGroupId !== undefined && { groupId: this.currentGroupId }),
    }
    this.addRule(rule)
    return this
  }

  /**
   * 時間範囲ルールの追加
   */
  timeRange(
    field: SmartFolderRuleField,
    startTime: string,
    endTime: string,
    options?: Partial<AdvancedSmartFolderRule['timeRange']>
  ): this {
    const rule: AdvancedSmartFolderRule = {
      field,
      operator: AdvancedRuleOperator.TIME_BETWEEN,
      value: null,
      logic: 'AND',
      timeRange: {
        startTime,
        endTime,
        ...options,
      },
      ...(this.currentGroupId !== undefined && { groupId: this.currentGroupId }),
    }
    this.addRule(rule)
    return this
  }

  /**
   * ルールの追加（パブリックメソッドに変更）
   */
  addRule(rule: AdvancedSmartFolderRule): this {
    this.rules.push(rule)
    return this
  }

  /**
   * ルールの構築
   */
  build(): AdvancedSmartFolderRule[] {
    return [...this.rules]
  }

  /**
   * ビルダーのリセット
   */
  reset(): this {
    this.rules = []
    delete this.currentGroupId
    return this
  }

  /**
   * 静的ビルダーの作成
   */
  static create(): AdvancedRuleBuilder {
    return new AdvancedRuleBuilder()
  }
}
