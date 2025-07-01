'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/badge'
import clsx from 'clsx'

export type Tag = {
  id: number | string
  name: string
  color: string
  children?: Tag[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function TagNode({ tag, level = 0 }: { tag: Tag; level?: number }) {
  const [open, setOpen] = useState(true)
  const hasChildren = !!tag.children && tag.children.length > 0

  return (
    <li className={clsx(level > 0 && 'ml-4')}>
      <div
        className="flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer hover:ring-2 hover:ring-primary/40"
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren && (
          <ChevronDown className={clsx('h-4 w-4 transition-transform', open ? 'rotate-0' : '-rotate-90')} />
        )}
        <Badge color={tag.color}>
          {tag.name}
        </Badge>
        <span className="ml-auto text-xs text-zinc-500">0</span>
      </div>
      {hasChildren && open && (
        <ul className="mt-1">
          {tag.children!.map((child) => (
            <TagNode key={child.id} tag={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function TagSidebar() {
  const { data } = useSWR<Tag[]>("/api/tags", fetcher, { suspense: true })

  return (
    <aside className="w-60 bg-muted/50 h-[100vh] overflow-y-auto p-2">
      <ul>{data?.map((tag) => <TagNode key={tag.id} tag={tag} />)}</ul>
    </aside>
  )
}
