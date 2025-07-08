import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TagDetailClient } from './tag-detail-client'

interface TagDetailPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: TagDetailPageProps): Promise<Metadata> {
  // In a real app, you would fetch the tag data here to get the title
  return {
    title: `Tag Details - BoxLog`,
    description: 'View tag details and associated items'
  }
}

export default function TagDetailPage({ params }: TagDetailPageProps) {
  if (!params.id) {
    notFound()
  }

  return <TagDetailClient tagId={params.id} />
}