'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, Clock, MoreVertical, Play, Square } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Session } from '../types/session'
import { SessionStatusBadge } from './session-status-badge'

interface SessionCardProps {
  session: Session
  onEdit?: (session: Session) => void
  onDelete?: (session: Session) => void
  onStart?: (session: Session) => void
  onStop?: (session: Session) => void
  onClick?: (session: Session) => void
}

export function SessionCard({ session, onEdit, onDelete, onStart, onStop, onClick }: SessionCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(session)
    }
  }

  const handleMenuAction = (action: () => void) => (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    action()
  }

  const handleActionClick = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    action()
  }

  const isInProgress = session.status === 'in_progress'
  const canStart = session.status === 'planned' && onStart
  const canStop = isInProgress && onStop

  return (
    <Card
      className="group hover:border-primary/50 relative cursor-pointer transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <p className="text-muted-foreground font-mono text-xs">{session.session_number}</p>
            <h3 className="text-foreground line-clamp-2 font-semibold">{session.title}</h3>
          </div>

          <div className="flex items-center gap-1">
            {/* 開始/停止ボタン */}
            {canStart && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleActionClick(() => onStart(session))}
              >
                <Play className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {canStop && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleActionClick(() => onStop(session))}
              >
                <Square className="h-4 w-4 text-red-600" />
              </Button>
            )}

            {/* メニュー */}
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
                {onEdit && <DropdownMenuItem onSelect={handleMenuAction(() => onEdit(session))}>編集</DropdownMenuItem>}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={handleMenuAction(() => onDelete(session))}
                      className="text-destructive focus:text-destructive"
                    >
                      削除
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ステータス */}
        <div>
          <SessionStatusBadge status={session.status} />
        </div>

        {/* 時間情報 */}
        <div className="space-y-2 text-sm">
          {/* 予定時間 */}
          {(session.planned_start ?? session.planned_end) && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                予定: {session.planned_start && format(new Date(session.planned_start), 'M/d HH:mm', { locale: ja })}
                {session.planned_end && ` - ${format(new Date(session.planned_end), 'HH:mm', { locale: ja })}`}
              </span>
            </div>
          )}

          {/* 実績時間 */}
          {session.actual_start && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                実績: {format(new Date(session.actual_start), 'M/d HH:mm', { locale: ja })}
                {session.actual_end && ` - ${format(new Date(session.actual_end), 'HH:mm', { locale: ja })}`}
              </span>
            </div>
          )}

          {/* 所要時間 */}
          {session.duration_minutes !== null && session.duration_minutes !== undefined && (
            <div className="text-foreground flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" />
              <span>
                {Math.floor(session.duration_minutes / 60)}時間{session.duration_minutes % 60}分
              </span>
            </div>
          )}
        </div>

        {/* メモ */}
        {session.notes && <p className="text-muted-foreground line-clamp-2 text-sm">{session.notes}</p>}
      </CardContent>
    </Card>
  )
}
