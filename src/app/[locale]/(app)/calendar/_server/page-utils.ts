import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/i18n/routing';

/**
 * searchParams から日付を解析する
 */
export function parseDateParam(date: string | undefined): Date | undefined {
  if (!date) return undefined;
  const parsedDate = new Date(date);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }
  return undefined;
}

/**
 * カレンダービューの翻訳テキストを取得する
 */
export async function getCalendarTranslations(locale: Locale) {
  const t = await getTranslations({ locale });
  return {
    errorTitle: t('calendar.errors.loadFailed'),
    errorMessage: t('calendar.errors.displayFailed'),
    reloadButton: t('common.reload'),
  };
}
