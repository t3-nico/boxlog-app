import { TagsPageClient } from '../tags-page-client'
import { TagDetailPageClient } from './tag-detail-page-client'

interface TagDetailPageProps {
  params: {
    locale: string
    tagNumber: string
  }
}

export default function TagDetailPage({ params }: TagDetailPageProps) {
  // g-1 形式の場合はグループページを表示
  if (params.tagNumber.startsWith('g-')) {
    const groupNumber = params.tagNumber.slice(2)
    return <TagsPageClient initialGroupNumber={groupNumber} />
  }

  // t-1 形式から数値を抽出
  const tagNumber = params.tagNumber.startsWith('t-') ? params.tagNumber.slice(2) : params.tagNumber

  return <TagDetailPageClient tagNumber={tagNumber} />
}
