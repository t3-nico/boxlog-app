'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

import { Plus, Search } from 'lucide-react';

import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTagOperations } from '@/features/tags/hooks/use-tag-operations';
import { useTags } from '@/features/tags/hooks/use-tags';
import { useTranslations } from 'next-intl';

import { SettingsCard } from './SettingsCard';

const TagCreateModal = dynamic(
  () =>
    import('@/features/tags/components/tag-create-modal').then((mod) => ({
      default: mod.TagCreateModal,
    })),
  { ssr: false },
);

const TagEditModal = dynamic(
  () =>
    import('@/features/tags/components/tag-edit-modal').then((mod) => ({
      default: mod.TagEditModal,
    })),
  { ssr: false },
);

const TagTreeView = dynamic(
  () =>
    import('@/features/tags/components/tag-tree-view').then((mod) => ({
      default: mod.TagTreeView,
    })),
  { ssr: false },
);

export function TagsSettings() {
  const t = useTranslations();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // クライアントサイドでのみレンダリング
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // データ取得
  const { data: tags = [], isPending, error } = useTags(true);

  // タグ操作
  const {
    showCreateModal,
    showEditModal,
    selectedTag,
    handleCreateTag,
    handleSaveNewTag,
    handleEditTag,
    handleSaveTag,
    handleDeleteTag,
    handleRenameTag,
    handleCloseModals,
  } = useTagOperations(tags);

  // フィルタリング
  const filteredTags = tags.filter((tag) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tag.name.toLowerCase().includes(query) || tag.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // ハンドラー
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCreateClick = useCallback(() => {
    handleCreateTag();
  }, [handleCreateTag]);

  // SSR時は何も表示しない（Hydrationエラー回避）
  if (!isMounted) {
    return null;
  }

  // エラー状態
  if (error) {
    return (
      <div className="space-y-6">
        <SettingsCard title={t('settings.dialog.categories.tags') || 'タグ'}>
          <div className="border-destructive bg-destructive/12 rounded-lg border p-4">
            <p className="text-destructive text-sm">
              エラー: {error instanceof Error ? error.message : String(error)}
            </p>
            <Button variant="destructive" onClick={() => window.location.reload()} className="mt-4">
              再読み込み
            </Button>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* タグ管理カード */}
        <SettingsCard
          title="タグ管理"
          actions={
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              新規タグ
            </Button>
          }
        >
          {/* 検索 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="タグを検索..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
          </div>

          {/* タグツリービュー */}
          <div className="min-h-52">
            {isPending ? (
              <div className="flex h-52 items-center justify-center">
                <p className="text-muted-foreground text-sm">読み込み中...</p>
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center gap-3">
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? '該当するタグが見つかりません' : 'タグがありません'}
                </p>
                {!searchQuery && (
                  <Button variant="outline" onClick={handleCreateClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    最初のタグを作成
                  </Button>
                )}
              </div>
            ) : (
              <TagTreeView
                tags={filteredTags}
                onCreateTag={handleCreateTag}
                onEditTag={handleEditTag}
                onDeleteTag={handleDeleteTag}
                onRenameTag={handleRenameTag}
                isLoading={isPending}
              />
            )}
          </div>
        </SettingsCard>

        {/* ヒント */}
        <div className="bg-surface-container rounded-lg p-4">
          <p className="text-muted-foreground text-sm">
            💡 タグは最大3階層まで作成できます。親タグを右クリックして子タグを追加できます。
          </p>
        </div>

        {/* モーダル */}
        {isMounted && (
          <>
            <TagCreateModal
              isOpen={showCreateModal}
              onClose={handleCloseModals}
              onSave={handleSaveNewTag}
            />
            <TagEditModal
              isOpen={showEditModal}
              tag={selectedTag}
              onClose={handleCloseModals}
              onSave={handleSaveTag}
            />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
