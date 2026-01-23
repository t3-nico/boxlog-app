'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useLocale } from 'next-intl';

import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';

/**
 * アカウント設定ページ
 *
 * 後方互換性のため、直接アクセス時はホームにリダイレクトしモーダルを開く
 */
export default function AccountSettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const openModal = useSettingsModalStore((state) => state.openModal);

  useEffect(() => {
    openModal('account');
    router.replace(`/${locale}`);
  }, [locale, router, openModal]);

  return null;
}
