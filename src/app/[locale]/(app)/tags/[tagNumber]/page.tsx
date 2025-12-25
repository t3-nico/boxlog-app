import { TagsPageClient } from '../tags-page-client';
import { TagInspectorOpener } from './tag-inspector-opener';

interface TagDetailPageProps {
  params: Promise<{
    locale: string;
    tagNumber: string;
  }>;
}

export default async function TagDetailPage({ params }: TagDetailPageProps) {
  const { tagNumber } = await params;

  // g-1 形式の場合はグループページを表示
  if (tagNumber.startsWith('g-')) {
    const groupNumber = tagNumber.slice(2);
    return <TagsPageClient initialGroupNumber={groupNumber} />;
  }

  // t-1 形式から数値を抽出してタグ一覧 + Inspector表示
  const tagNum = tagNumber.startsWith('t-') ? tagNumber.slice(2) : tagNumber;

  return (
    <>
      <TagsPageClient />
      <TagInspectorOpener tagNumber={tagNum} />
    </>
  );
}
