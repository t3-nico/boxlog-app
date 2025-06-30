'use client'

import { Badge } from './badge'
import { Link } from './link'
import { LogEntry } from '@/hooks/useLogSearch'

export default function LogSearchResult({ log, onSelect }: { log: LogEntry; onSelect?: () => void }) {
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-base/6">
            <Link href={log.url ?? '#'} onClick={onSelect} className="text-zinc-950 dark:text-white">
              {log.title}
            </Link>
          </div>
          <p className="mt-1 text-sm/6 text-zinc-600 dark:text-zinc-400">{log.memo}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {log.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-xs/6 text-zinc-500 dark:text-zinc-400">{log.date}</div>
      </div>
    </li>
  )
}
