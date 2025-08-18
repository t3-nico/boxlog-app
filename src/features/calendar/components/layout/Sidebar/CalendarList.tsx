'use client'

import { memo, useState, useCallback } from 'react'
import { Calendar, Plus, MoreHorizontal, Eye, EyeOff, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/shadcn-ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Calendar as CalendarType } from '@/features/calendar/types/calendar.types'

export interface CalendarListProps {
  calendars: CalendarType[]
  selectedCalendarIds?: string[]
  onCalendarToggle?: (calendarId: string, visible: boolean) => void
  onCalendarSelect?: (calendarId: string) => void
  onCalendarCreate?: () => void
  onCalendarEdit?: (calendarId: string) => void
  onCalendarDelete?: (calendarId: string) => void
  className?: string
}

export const CalendarList = memo<CalendarListProps>(({
  calendars,
  selectedCalendarIds = [],
  onCalendarToggle,
  onCalendarSelect,
  onCalendarCreate,
  onCalendarEdit,
  onCalendarDelete,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['my-calendars'])
  )

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  const handleCalendarToggle = useCallback((calendarId: string, visible: boolean) => {
    onCalendarToggle?.(calendarId, visible)
  }, [onCalendarToggle])

  const handleCalendarClick = useCallback((calendarId: string) => {
    onCalendarSelect?.(calendarId)
  }, [onCalendarSelect])

  // カレンダーをグループ分け
  const myCalendars = calendars.filter(cal => !cal.isShared)
  const sharedCalendars = calendars.filter(cal => cal.isShared)

  const renderCalendarItem = (calendar: CalendarType) => {
    const isSelected = selectedCalendarIds.includes(calendar.id)
    
    return (
      <div 
        key={calendar.id}
        className={cn(
          "group flex items-center gap-2 px-2 py-1 rounded-md",
          "hover:bg-accent transition-colors",
          isSelected && "bg-accent"
        )}
      >
        {/* 表示/非表示チェックボックス */}
        <Checkbox
          checked={calendar.isVisible}
          onCheckedChange={(checked) => 
            handleCalendarToggle(calendar.id, !!checked)
          }
          className="flex-shrink-0"
          aria-label={`${calendar.name}を${calendar.isVisible ? '非表示' : '表示'}にする`}
        />
        
        {/* カレンダー色インジケーター */}
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 border border-border"
          style={{ backgroundColor: calendar.color }}
          aria-hidden="true"
        />
        
        {/* カレンダー名 */}
        <button
          type="button"
          onClick={() => handleCalendarClick(calendar.id)}
          className={cn(
            "flex-1 text-left text-sm truncate",
            "hover:text-foreground transition-colors",
            calendar.isVisible ? "text-foreground" : "text-muted-foreground",
            calendar.isDefault && "font-medium"
          )}
          title={calendar.name}
        >
          {calendar.name}
          {calendar.isDefault && (
            <span className="ml-1 text-xs text-muted-foreground">(デフォルト)</span>
          )}
        </button>
        
        {/* アクションメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 opacity-0 group-hover:opacity-100",
                "transition-opacity flex-shrink-0"
              )}
              aria-label={`${calendar.name}のメニュー`}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => handleCalendarToggle(calendar.id, !calendar.isVisible)}
              className="gap-2"
            >
              {calendar.isVisible ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  非表示にする
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  表示する
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onCalendarEdit?.(calendar.id)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              設定
            </DropdownMenuItem>
            {!calendar.isDefault && (
              <DropdownMenuItem 
                onClick={() => onCalendarDelete?.(calendar.id)}
                className="gap-2 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                削除
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className={cn("calendar-list space-y-4", className)}>
      {/* マイカレンダー */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection('my-calendars')}
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent-foreground"
          >
            <Calendar className="h-4 w-4" />
            マイカレンダー
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCalendarCreate}
            className="h-6 w-6 p-0"
            aria-label="新しいカレンダーを作成"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        {expandedSections.has('my-calendars') && (
          <div className="space-y-1 pl-1">
            {myCalendars.length > 0 ? (
              myCalendars.map(renderCalendarItem)
            ) : (
              <div className="text-xs text-muted-foreground px-2 py-1">
                カレンダーがありません
              </div>
            )}
          </div>
        )}
      </div>

      {/* 共有カレンダー */}
      {sharedCalendars.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('shared-calendars')}
            className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent-foreground"
          >
            <Calendar className="h-4 w-4" />
            共有カレンダー
          </button>
          
          {expandedSections.has('shared-calendars') && (
            <div className="space-y-1 pl-1">
              {sharedCalendars.map(renderCalendarItem)}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

CalendarList.displayName = 'CalendarList'