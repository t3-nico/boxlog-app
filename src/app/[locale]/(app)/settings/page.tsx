'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useLocale } from 'next-intl';

import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';

/**
 * 設定ページ（インデックス）
 *
 * 後方互換性のため、直接アクセス時はホームページにリダイレクトし、
 * 設定モーダルを開く。
 */
export default function SettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const openModal = useSettingsModalStore((state) => state.openModal);

  useEffect(() => {
    // モーダルを開いてホームにリダイレクト
    openModal('general');
    router.replace(`/${locale}`);
  }, [locale, router, openModal]);

  return null;
}
