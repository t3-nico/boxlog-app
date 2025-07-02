import { SWRConfig } from 'swr'
import { getTags } from '@/data'
import TagSidebar from '@/components/tag-sidebar'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function CalendarLayout({ children }: { children: React.ReactNode }) {
  const tags = await getTags()
  return (
    <SWRConfig value={{ fallback: { '/api/tags': tags } }}>
      <div className="flex">
        <TagSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </SWRConfig>
  )
}
