'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useLocale } from 'next-intl';

import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';

/**
 * サブスクリプション設定ページ
 *
 * 後方互換性のため、直接アクセス時はホームにリダイレクトしモーダルを開く
 */
export default function SubscriptionSettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const openModal = useSettingsModalStore((state) => state.openModal);

  useEffect(() => {
    openModal('subscription');
    router.replace(`/${locale}`);
  }, [locale, router, openModal]);

  return null;
}
