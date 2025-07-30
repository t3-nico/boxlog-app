/**
 * PostgreSQL日時形式正規化ユーティリティ
 * あらゆるPostgreSQL日時形式を安全にJavaScript Dateオブジェクトに変換
 */

import { parseISO } from 'date-fns';
import { debugDateFormat } from './debugDateFormat';

/**
 * PostgreSQLの日時文字列を正規化してDateオブジェクトを返す
 * @param dateValue - PostgreSQLから取得した日時値
 * @param fieldName - デバッグ用のフィールド名
 * @returns 正規化されたDateオブジェクト、または無効な場合はnull
 */
export const normalizePostgresDate = (dateValue: any, fieldName: string = 'date'): Date | null => {
  // nullまたはundefinedの場合
  if (dateValue === null || dateValue === undefined) {
    console.log(`⚠️ ${fieldName} is null or undefined`);
    return null;
  }
  
  // すでにDateオブジェクトの場合
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // 文字列でない場合
  if (typeof dateValue !== 'string') {
    console.error(`❌ ${fieldName} is not a string:`, dateValue);
    return null;
  }
  
  // デバッグ情報を出力
  if (process.env.NODE_ENV === 'development') {
    debugDateFormat(`normalizePostgresDate: ${fieldName}`, dateValue);
  }
  
  try {
    // 正規化処理
    let normalizedDate: Date;
    
    // ケース1: スペース区切りのPostgreSQL形式 "YYYY-MM-DD HH:MM:SS+TZ"
    if (dateValue.includes(' ') && !dateValue.includes('T')) {
      // スペースをTに置換
      const isoString = dateValue.replace(' ', 'T');
      normalizedDate = new Date(isoString);
    }
    // ケース2: タイムゾーンなしのISO形式 "YYYY-MM-DDTHH:MM:SS"
    else if (dateValue.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/) && !dateValue.includes('Z') && !dateValue.includes('+')) {
      // PostgreSQLがUTCで保存しているが、タイムゾーン情報がない場合
      // 明示的にUTCとして扱う（Zを追加）
      normalizedDate = new Date(dateValue + 'Z');
      console.log('📍 Treating as UTC (adding Z):', {
        input: dateValue,
        utc: normalizedDate.toISOString(),
        local: normalizedDate.toLocaleString('ja-JP')
      });
    }
    // ケース3: 標準的なISO 8601形式
    else {
      // date-fnsのparseISOを使用（より堅牢）
      normalizedDate = parseISO(dateValue);
    }
    
    // 有効性チェック
    if (isNaN(normalizedDate.getTime())) {
      console.error(`❌ Invalid date after normalization: ${dateValue}`);
      return null;
    }
    
    console.log(`✅ Successfully normalized ${fieldName}:`, {
      original: dateValue,
      normalized: normalizedDate.toISOString(),
      local: normalizedDate.toLocaleString('ja-JP')
    });
    
    return normalizedDate;
  } catch (error: any) {
    console.error(`❌ Failed to normalize ${fieldName}:`, {
      value: dateValue,
      error: error.message
    });
    return null;
  }
};

/**
 * エンティティ全体の日時フィールドを正規化
 */
export const normalizeEntityDates = <T extends Record<string, any>>(
  entity: T,
  dateFields: string[] = ['planned_start', 'planned_end', 'created_at', 'updated_at']
): T => {
  const normalized = { ...entity };
  
  for (const field of dateFields) {
    if (field in normalized && normalized[field] !== null) {
      const normalizedDate = normalizePostgresDate(normalized[field], field);
      normalized[field] = normalizedDate;
    }
  }
  
  return normalized;
};

/**
 * Supabaseレスポンス全体を正規化
 */
export const normalizeSupabaseResponse = <T extends Record<string, any>>(
  data: T | T[],
  dateFields?: string[]
): T | T[] => {
  if (Array.isArray(data)) {
    return data.map(item => normalizeEntityDates(item, dateFields));
  }
  return normalizeEntityDates(data, dateFields);
};