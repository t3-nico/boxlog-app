'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useTags } from '@/features/tags/hooks/use-tags'
import type { TagWithChildren } from '@/types/tags'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TagDetailPageClientProps {
  tagNumber: string
}

export function TagDetailPageClient({ tagNumber }: TagDetailPageClientProps) {
  const { data: fetchedTags = [], isLoading } = useTags(true)
  const [tag, setTag] = useState<TagWithChildren | null>(null)
  const router = useRouter()

  useEffect(() => {
    // tag_numberからタグを探す（例: "1" または "t-1"）
    const tagNum = tagNumber.replace(/^t-/, '') // "t-1" → "1"
    const parsedTagNum = parseInt(tagNum, 10)

    if (isNaN(parsedTagNum)) {
      setTag(null)
      return
    }

    // すべてのタグから該当するタグを探す（Level 0のみ）
    const allTags = fetchedTags.filter((tag) => tag.level === 0)
    const foundTag = allTags.find((t) => t.tag_number === parsedTagNum)
    setTag(foundTag || null)
  }, [fetchedTags, tagNumber])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">タグが見つかりませんでした</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: tag.color || '#3B82F6' }} />
            <div>
              <h1 className="text-foreground text-2xl font-bold">{tag.name}</h1>
              {tag.description && <p className="text-muted-foreground mt-1 text-sm">{tag.description}</p>}
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">パス: {tag.path}</p>
        </div>

        {/* タグが付いたアイテム一覧 */}
        <div className="border-border rounded-lg border p-6">
          <h2 className="text-foreground mb-4 text-lg font-semibold">このタグが付いたアイテム</h2>
          <div className="border-border flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">まだアイテムがありません</p>
          </div>
          {/* TODO: タグが付いたチケット一覧を表示 */}
        </div>
      </div>
    </div>
  )
}
