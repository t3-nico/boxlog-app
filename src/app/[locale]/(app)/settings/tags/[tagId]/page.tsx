import { TagsPageClient } from '@/features/tags/components/TagsPageClient';

import { GroupFilterSetter } from './group-filter-setter';
import { TagInspectorOpener } from './tag-inspector-opener';

interface TagDetailPageProps {
  params: Promise<{
    locale: string;
    tagId: string;
  }>;
}

export default async function SettingsTagDetailPage({ params }: TagDetailPageProps) {
  const { tagId } = await params;

  // g-{uuid} 形式の場合はグループページを表示
  if (tagId.startsWith('g-')) {
    const groupId = tagId.slice(2);
    return (
      <>
        <GroupFilterSetter groupId={groupId} />
        <TagsPageClient />
      </>
    );
  }

  // タグID（UUID）でタグ一覧 + Inspector表示
  return (
    <>
      <TagsPageClient />
      <TagInspectorOpener tagId={tagId} />
    </>
  );
}
