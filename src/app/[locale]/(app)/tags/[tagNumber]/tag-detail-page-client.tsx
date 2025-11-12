'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { TagsPageHeader } from '@/features/tags/components/TagsPageHeader'
import { useTags } from '@/features/tags/hooks/use-tags'

interface TagDetailPageClientProps {
  tagNumber: string
}

export function TagDetailPageClient({ tagNumber }: TagDetailPageClientProps) {
  const { data: tags = [], isLoading } = useTags(true)
  const router = useRouter()

  const tag = tags.find((t) => t.tag_number === Number(tagNumber))

  useEffect(() => {
    if (!isLoading && !tag) {
      // タグが見つからない場合はタグ一覧にリダイレクト
      router.push('/tags')
    }
  }, [isLoading, tag, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!tag) {
    return null
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <TagsPageHeader title={tag.name} />

      {/* コンテンツ */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-6 w-6 rounded-full" style={{ backgroundColor: tag.color || '#3B82F6' }} />
              <p className="text-muted-foreground">t-{tag.tag_number}</p>
            </div>
          </div>

          {tag.description && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold">説明</h2>
              <p className="text-muted-foreground">{tag.description}</p>
            </div>
          )}

          <div className="border-border rounded-lg border p-6">
            <p className="text-muted-foreground text-center">タグの詳細ページは開発中です</p>
          </div>
        </div>
      </div>
    </div>
  )
}
