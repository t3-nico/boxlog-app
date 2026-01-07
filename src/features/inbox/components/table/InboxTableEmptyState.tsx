'use client';

import { FileSearch, Filter, Inbox, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';

import { useInboxFilterStore } from '../../stores/useInboxFilterStore';

interface InboxTableEmptyStateProps {
  /** 列数（colSpan用） */
  columnCount: number;
  /** 全アイテム数（フィルター前） */
  totalItems: number;
}

/**
 * Inboxテーブル空状態コンポーネント
 *
 * 状況に応じて異なるメッセージとアクションを表示:
 * - 検索中で0件 → Clear search
 * - フィルター適用中で0件 → Clear filters
 * - 完全に0件 → Create plan
 */
export function InboxTableEmptyState({
  columnCount,
  totalItems: _totalItems,
}: InboxTableEmptyStateProps) {
  const t = useTranslations('inbox.emptyState');
  const { search, status, reset } = useInboxFilterStore();
  const { openInspector } = usePlanInspectorStore();

  const isFiltered = search !== '' || status.length > 0;
  const isSearching = search !== '';

  const handleCreate = () => {
    openInspector('new');
  };

  // 状態に応じた表示内容
  const getEmptyStateContent = () => {
    if (isSearching) {
      return {
        icon: FileSearch,
        title: t('noResults.title'),
        description: t('noResults.description'),
        action: (
          <Button onClick={reset} variant="outline">
            <X className="mr-2 size-4" />
            {t('noResults.action')}
          </Button>
        ),
      };
    }

    if (isFiltered) {
      return {
        icon: Filter,
        title: t('noMatching.title'),
        description: t('noMatching.description'),
        action: (
          <Button onClick={reset} variant="outline">
            <X className="mr-2 size-4" />
            {t('noMatching.action')}
          </Button>
        ),
      };
    }

    return {
      icon: Inbox,
      title: t('empty.title'),
      description: t('empty.description'),
      action: (
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          {t('empty.action')}
        </Button>
      ),
    };
  };

  const { icon, title, description, action } = getEmptyStateContent();

  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-[28rem]">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          actions={action}
          size="sm"
          centered
        />
      </TableCell>
    </TableRow>
  );
}
