/**
 * PostgreSQL日時形式診断ツール
 * Supabaseから取得した生データの形式を確認し、ブラウザ間の挙動差を検出
 */

export const debugDateFormat = (label: string, dateValue: any) => {
  // Debug logging removed for production
  if (dateValue === null || dateValue === undefined) {
    return;
  }
};

/**
 * PostgreSQL日時形式の検証パターン
 */
export const postgresDatePatterns = {
  // ISO 8601 with timezone
  isoWithTz: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
  
  // ISO 8601 with Z
  isoWithZ: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
  
  // ISO 8601 without timezone
  isoNoTz: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  
  // PostgreSQL timestamp format
  pgTimestamp: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}([+-]\d{2})?$/,
  
  // Date only
  dateOnly: /^\d{4}-\d{2}-\d{2}$/
};

/**
 * どのパターンにマッチするか判定
 */
export const identifyDateFormat = (dateStr: string): string => {
  for (const [name, pattern] of Object.entries(postgresDatePatterns)) {
    if (pattern.test(dateStr)) {
      return name;
    }
  }
  return 'unknown';
};