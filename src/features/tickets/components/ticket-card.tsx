'use client'

import { Clock, MoreVertical, Target } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Ticket } from '../types/ticket'
import { PriorityBadge } from './priority-badge'
import { TicketStatusBadge } from './ticket-status-badge'

interface TicketCardProps {
  ticket: Ticket
  onEdit?: (ticket: Ticket) => void
  onDelete?: (ticket: Ticket) => void
  onClick?: (ticket: Ticket) => void
  tags?: Array<{ id: string; name: string; color: string }>
}

export function TicketCard({ ticket, onEdit, onDelete, onClick, tags = [] }: TicketCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(ticket)
    }
  }

  const handleMenuAction = (action: () => void) => (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    action()
  }

  return (
    <Card
      className="group hover:border-primary/50 relative cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <p className="text-muted-foreground font-mono text-xs">{ticket.ticket_number}</p>
            <h3 className="text-foreground line-clamp-2 font-semibold">{ticket.title}</h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onSelect={handleMenuAction(() => onEdit(ticket))}>編集</DropdownMenuItem>}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleMenuAction(() => onDelete(ticket))}
                    className="text-destructive focus:text-destructive"
                  >
                    削除
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ステータスと優先度 */}
        <div className="flex flex-wrap gap-2">
          <TicketStatusBadge status={ticket.status} />
          {ticket.priority && <PriorityBadge priority={ticket.priority} />}
        </div>

        {/* 時間情報 */}
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          {ticket.planned_hours !== undefined && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{ticket.planned_hours}h 予定</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{ticket.actual_hours}h 実績</span>
          </div>
        </div>

        {/* タグ */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* 説明（省略形） */}
        {ticket.description && <p className="text-muted-foreground line-clamp-2 text-sm">{ticket.description}</p>}
      </CardContent>
    </Card>
  )
}
