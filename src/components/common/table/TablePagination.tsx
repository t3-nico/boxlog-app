'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TablePaginationProps {
  /** 総件数 */
  totalItems: number;
  /** 現在のページ（1始まり） */
  currentPage: number;
  /** 1ページあたりの表示件数 */
  pageSize: number;
  /** ページ変更時のコールバック */
  onPageChange: (page: number) => void;
}

/**
 * 共通テーブルページネーションコンポーネント
 *
 * **設計方針:**
 * - Gmailスタイル: `1-25 of 100  < >`
 * - デスクトップ専用（モバイルでは親コンポーネントで非表示にする）
 * - ページサイズは動的に計算されるため、選択UIは不要
 */
export function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
}: TablePaginationProps) {
  const t = useTranslations();

  // 総ページ数
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // 現在のページの範囲
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // ページ移動ハンドラー
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));

  return (
    <div className="flex items-center justify-between px-4 py-4">
      {/* 左側: アイテム範囲 */}
      <div className="text-muted-foreground text-sm">
        {totalItems > 0
          ? t('table.items', { start: startItem, end: endItem, total: totalItems })
          : t('table.items', { start: 0, end: 0, total: 0 })}
      </div>

      {/* 右側: 前後ナビゲーションのみ */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">{t('table.previousPage')}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">{t('table.nextPage')}</span>
        </Button>
      </div>
    </div>
  );
}
