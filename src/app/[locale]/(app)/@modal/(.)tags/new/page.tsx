'use client';

/**
 * タグ作成モーダル - Intercepting Route
 *
 * /tags/new への遷移をインターセプトし、モーダルとして表示
 * - ブラウザバックでモーダルが閉じる
 * - 現在のページの上にオーバーレイ表示
 *
 * 直接 /tags/new にアクセスした場合は、
 * /tags/new/page.tsx がフルページとして表示される
 */

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { TagCreateModal } from '@/features/tags/components/tag-create-modal';
import { useCreateTag } from '@/features/tags/hooks';
import type { CreateTagInput } from '@/features/tags/types';

export default function TagCreateInterceptedModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const createTagMutation = useCreateTag();

  // URLから親タグIDを取得（オプション）
  const defaultParentId = searchParams?.get('parentId') ?? null;

  const handleClose = () => {
    router.back();
  };

  const handleCreateTag = async (data: CreateTagInput) => {
    const result = await createTagMutation.mutateAsync({
      name: data.name,
      color: data.color,
      description: data.description ?? undefined,
      parentId: data.parentId ?? undefined,
    });
    toast.success(t('tags.toast.created', { name: result.name }));
    handleClose();
  };

  return (
    <TagCreateModal
      isOpen={true}
      onClose={handleClose}
      onSave={handleCreateTag}
      defaultParentId={defaultParentId}
    />
  );
}
