'use client';

/**
 * タグ作成ページ - フルページ版
 *
 * /tags/new に直接アクセスした場合に表示される
 * （インターセプトされなかった場合のフォールバック）
 *
 * 作成完了後はカレンダーページにリダイレクト
 */

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { TagCreateModal } from '@/features/tags/components/tag-create-modal';
import { useCreateTag } from '@/features/tags/hooks';
import type { CreateTagInput } from '@/features/tags/types';

export default function TagCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const createTagMutation = useCreateTag();

  // URLから親タグIDを取得（オプション）
  const defaultParentId = searchParams?.get('parentId') ?? null;

  const handleClose = () => {
    // 直接アクセスの場合はカレンダーに戻る
    router.push('/calendar');
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
    <div className="flex h-full items-center justify-center">
      <TagCreateModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleCreateTag}
        defaultParentId={defaultParentId}
      />
    </div>
  );
}
