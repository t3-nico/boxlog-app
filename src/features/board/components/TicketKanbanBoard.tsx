'use client'

import type { InboxItem } from '@/features/inbox/hooks/useInboxData'

interface TicketKanbanBoardProps {
  items: InboxItem[]
}

/**
 * Ticket/Session用Kanbanボード
 *
 * InboxItemをステータスごとに3カラムに分類して表示
 */
export function TicketKanbanBoard({ items }: TicketKanbanBoardProps) {
  // Ticketデータをカラムごとに分類
  const columns = {
    todo: items.filter((item) => item.status === 'open'),
    inProgress: items.filter((item) => item.status === 'in_progress'),
    done: items.filter((item) => item.status === 'completed' || item.status === 'cancelled'),
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {/* To Do カラム */}
      <KanbanColumn title="To Do" count={columns.todo.length} variant="default">
        {columns.todo.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* In Progress カラム */}
      <KanbanColumn title="In Progress" count={columns.inProgress.length} variant="progress">
        {columns.inProgress.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>

      {/* Done カラム */}
      <KanbanColumn title="Done" count={columns.done.length} variant="done">
        {columns.done.map((item) => (
          <TicketCard key={item.id} item={item} />
        ))}
      </KanbanColumn>
    </div>
  )
}

interface KanbanColumnProps {
  title: string
  count: number
  variant: 'default' | 'progress' | 'done'
  children: React.ReactNode
}

function KanbanColumn({ title, count, variant, children }: KanbanColumnProps) {
  const bgColor = {
    default: 'bg-muted/50',
    progress: 'bg-blue-50 dark:bg-blue-950/20',
    done: 'bg-green-50 dark:bg-green-950/20',
  }[variant]

  return (
    <div className="flex min-w-[300px] flex-col rounded-lg">
      <div className={`${bgColor} rounded-t-lg p-4`}>
        <h3 className="text-foreground font-semibold">
          {title} <span className="text-muted-foreground">({count})</span>
        </h3>
      </div>
      <div className={`${bgColor} flex-1 space-y-2 overflow-y-auto rounded-b-lg p-4`}>{children}</div>
    </div>
  )
}

function TicketCard({ item }: { item: InboxItem }) {
  const priorityStyles: Record<string, string> = {
    high: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  }

  const priorityClass = item.priority ? priorityStyles[item.priority] || priorityStyles.low : ''

  return (
    <div className="bg-card hover:bg-accent group cursor-pointer rounded-lg border p-3 shadow-sm transition-all hover:shadow-md">
      <div className="text-foreground mb-1 text-sm font-medium">{item.title}</div>
      <div className="text-muted-foreground mb-2 text-xs">
        {item.type === 'ticket' && item.ticket_number ? `#${item.ticket_number}` : item.type}
      </div>
      {item.priority && (
        <span className={`inline-block rounded px-2 py-1 text-xs ${priorityClass}`}>{item.priority}</span>
      )}
    </div>
  )
}
