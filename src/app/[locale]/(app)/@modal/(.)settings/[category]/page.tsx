'use client';

import { useParams } from 'next/navigation';

import { isValidCategory, SettingsDialog } from '@/features/settings';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MEDIA_QUERIES } from '@/lib/breakpoints';

/**
 * 設定ダイアログ（Intercepting Route）
 *
 * PC でのソフトナビゲーション時のみ Dialog として表示。
 * モバイルでは null を返し、実ページ（settings/[category]/page.tsx）に委譲。
 */
export default function SettingsModalInterceptPage() {
  const params = useParams<{ category: string }>();
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  // モバイルでは実ページに委譲
  if (isMobile) {
    return null;
  }

  const category = params?.category ?? 'profile';
  if (!isValidCategory(category)) {
    return null;
  }

  return <SettingsDialog category={category} />;
}
