/**
 * 拡張演算子定義
 */

export enum AdvancedRuleOperator {
  // 正規表現
  REGEX_MATCH = 'regex_match',
  REGEX_NOT_MATCH = 'regex_not_match',

  // 数値範囲
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between',

  // 日付/時間の高度な比較
  WITHIN_HOURS = 'within_hours',
  WITHIN_DAYS = 'within_days',
  WITHIN_WEEKS = 'within_weeks',
  WITHIN_MONTHS = 'within_months',

  // 時間帯
  TIME_BETWEEN = 'time_between',
  TIME_NOT_BETWEEN = 'time_not_between',

  // 曜日
  DAY_OF_WEEK = 'day_of_week',
  NOT_DAY_OF_WEEK = 'not_day_of_week',

  // 配列/リスト操作
  ARRAY_LENGTH = 'array_length',
  ARRAY_CONTAINS_ALL = 'array_contains_all',
  ARRAY_CONTAINS_ANY = 'array_contains_any',
  ARRAY_CONTAINS_NONE = 'array_contains_none',

  // カスタム関数
  CUSTOM_FUNCTION = 'custom_function',
}
