import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from '@/constants/time';

import type { PlanStatus } from '../types/plan';

/**
 * プラン番号のフォーマット
 * @example formatplanNumber("TKT-20241030-001") => "#TKT-001"
 */
export function formatplanNumber(planNumber: string): string {
  // TKT-20241030-001 → #TKT-001
  const parts = planNumber.split('-');
  if (parts.length === 3) {
    return `#${parts[0]}-${parts[2]}`;
  }
  return `#${planNumber}`;
}

/**
 * プランステータスの表示名
 */
export function formatplanStatus(status: PlanStatus): string {
  const statusMap: Record<PlanStatus, string> = {
    open: 'Open',
    done: 'Done',
  };
  return statusMap[status];
}

/**
 * 日付のフォーマット
 * @param dateString - ISO 8601形式の日時文字列
 * @param locale - 'en' | 'ja' (デフォルト: 'en')
 * @example formatplanDate("2025-01-15", "ja") => "2025年1月15日"
 * @example formatplanDate("2025-01-15", "en") => "Jan 15, 2025"
 */
export function formatplanDate(
  dateString: string | null | undefined,
  locale: string = 'en',
): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: locale === 'ja' ? 'numeric' : 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * 日時のフォーマット（ISO 8601 → YYYY/MM/DD HH:mm）
 */
export function formatplanDateTime(dateTimeString: string | null | undefined): string {
  if (!dateTimeString) return '-';

  try {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return dateTimeString;
  }
}

// 相対時間の翻訳マップ
const relativeTimeTranslations = {
  en: {
    justNow: 'just now',
    minutesAgo: (count: number) => `${count} min ago`,
    hoursAgo: (count: number) => `${count}h ago`,
    daysAgo: (count: number) => `${count}d ago`,
  },
  ja: {
    justNow: 'たった今',
    minutesAgo: (count: number) => `${count}分前`,
    hoursAgo: (count: number) => `${count}時間前`,
    daysAgo: (count: number) => `${count}日前`,
  },
} as const;

type SupportedLocale = keyof typeof relativeTimeTranslations;

/**
 * 相対時間のフォーマット（created_at, updated_at用）
 * @param dateString - ISO 8601形式の日時文字列
 * @param locale - 'en' | 'ja' (デフォルト: 'en')
 * @example formatRelativeTime("2024-01-01T00:00:00Z", "ja") => "2分前"
 */
export function formatRelativeTime(
  dateString: string | null | undefined,
  locale: string = 'en',
): string {
  if (!dateString) return '-';

  const t = relativeTimeTranslations[locale as SupportedLocale] ?? relativeTimeTranslations.en;

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / MS_PER_MINUTE);
    const diffHours = Math.floor(diffMs / MS_PER_HOUR);
    const diffDays = Math.floor(diffMs / MS_PER_DAY);

    if (diffMinutes < 1) return t.justNow;
    if (diffMinutes < 60) return t.minutesAgo(diffMinutes);
    if (diffHours < 24) return t.hoursAgo(diffHours);
    if (diffDays < 30) return t.daysAgo(diffDays);

    // 30日以上はlocaleに応じた日付フォーマット
    return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
