import { TagsPageClient } from '../tags-page-client';
import { TagInspectorOpener } from './tag-inspector-opener';

interface TagDetailPageProps {
  params: Promise<{
    locale: string;
    tagId: string;
  }>;
}

export default async function TagDetailPage({ params }: TagDetailPageProps) {
  const { tagId } = await params;

  // g-{uuid} 形式の場合はグループページを表示
  if (tagId.startsWith('g-')) {
    const groupId = tagId.slice(2);
    return <TagsPageClient initialGroupId={groupId} />;
  }

  // タグID（UUID）でタグ一覧 + Inspector表示
  return (
    <>
      <TagsPageClient />
      <TagInspectorOpener tagId={tagId} />
    </>
  );
}
