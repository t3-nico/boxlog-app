'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useGlobalSearch } from '@/features/search';

/**
 * ヘッダー共通ユーティリティ（検索）
 *
 * 各ページヘッダーの右側に配置する共通コンポーネント。
 * PC のみ表示（呼び出し側で `hidden md:flex` 等を制御）。
 */
export function HeaderUtilities() {
  const t = useTranslations();
  const { open: openSearch } = useGlobalSearch();

  return (
    <HoverTooltip content={t('sidebar.navigation.search')} side="bottom">
      <Button
        variant="ghost"
        icon
        className="size-8"
        onClick={() => openSearch()}
        aria-label={t('sidebar.navigation.search')}
      >
        <Search className="size-4" />
      </Button>
    </HoverTooltip>
  );
}
