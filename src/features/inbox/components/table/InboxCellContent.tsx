'use client'

import { parseDatetimeString } from '@/features/calendar/utils/dateUtils'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { useplanTags } from '@/features/plans/hooks/usePlanTags'
import type { PlanStatus } from '@/features/plans/types/plan'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { InboxItem } from '../../hooks/useInboxData'
import { DateTimeUnifiedCell } from './DateTimeUnifiedCell'
import { StatusEditCell } from './StatusEditCell'
import { TagsCell } from './TagsCell'

interface InboxCellContentProps {
  /** 表示するInboxアイテム */
  item: InboxItem
  /** 列ID */
  columnId: string
  /** 列幅 */
  width?: number
}

/**
 * Inboxセル内容コンポーネント
 *
 * DataTableのrender関数で使用するセル内容レンダラー
 * selection列以外のすべての列をサポート
 */
export function InboxCellContent({ item, columnId, width }: InboxCellContentProps) {
  const { updatePlan } = usePlanMutations()
  const { addplanTag, removeplanTag } = useplanTags()

  // インライン編集ハンドラー
  const handleStatusChange = (status: PlanStatus) => {
    console.log('Update status:', item.id, status)
  }

  const handleTagsChange = async (tagIds: string[]) => {
    const currentTagIds = item.tags?.map((tag) => tag.id) ?? []
    const addedTagIds = tagIds.filter((id) => !currentTagIds.includes(id))
    const removedTagIds = currentTagIds.filter((id) => !tagIds.includes(id))

    for (const tagId of addedTagIds) {
      await addplanTag(item.id, tagId)
    }

    for (const tagId of removedTagIds) {
      await removeplanTag(item.id, tagId)
    }
  }

  switch (columnId) {
    case 'id':
      return <div className="truncate font-mono text-sm">{item.plan_number || '-'}</div>

    case 'title':
      return (
        <div className="group flex cursor-pointer items-center gap-2 overflow-hidden">
          <span className="min-w-0 truncate font-medium group-hover:underline">{item.title}</span>
          {item.plan_number && <span className="text-muted-foreground shrink-0 text-sm">#{item.plan_number}</span>}
        </div>
      )

    case 'status':
      return <StatusEditCell status={item.status} width={width} onStatusChange={handleStatusChange} />

    case 'tags':
      return <TagsCell tags={item.tags ?? []} width={width} onTagsChange={handleTagsChange} />

    case 'duration':
      return (
        <DateTimeUnifiedCell
          data={{
            date: item.start_time ? parseDatetimeString(item.start_time).toISOString().split('T')[0]! : null,
            startTime: item.start_time ? format(parseDatetimeString(item.start_time), 'HH:mm') : null,
            endTime: item.end_time ? format(parseDatetimeString(item.end_time), 'HH:mm') : null,
            reminder: null,
            recurrence: null,
          }}
          {...(width !== undefined && { width })}
          onChange={(data) => {
            const startTime = data.date && data.startTime ? `${data.date}T${data.startTime}:00Z` : null
            const endTime = data.date && data.endTime ? `${data.date}T${data.endTime}:00Z` : null

            updatePlan.mutate({
              id: item.id,
              data: {
                start_time: startTime || undefined,
                end_time: endTime || undefined,
              },
            })
          }}
        />
      )

    case 'created_at':
      return (
        <span className="text-muted-foreground text-sm">
          {format(new Date(item.created_at), 'yyyy/MM/dd', { locale: ja })}
        </span>
      )

    case 'updated_at':
      return (
        <span className="text-muted-foreground text-sm">
          {format(new Date(item.updated_at), 'yyyy/MM/dd', { locale: ja })}
        </span>
      )

    default:
      return null
  }
}
