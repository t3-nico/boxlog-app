'use client'

import { memo, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { cn } from '@/lib/utils'
import { MiniCalendar } from './MiniCalendar'
import { CalendarList } from './CalendarList'
import { TagFilter } from './TagFilter'
import { QuickActions } from './QuickActions'
import type { Calendar, TagItem } from '@/features/calendar/types/calendar.types'

export interface SidebarProps {
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  
  // MiniCalendar props
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  highlightedDates?: Date[]
  
  // CalendarList props
  calendars?: Calendar[]
  selectedCalendarIds?: string[]
  onCalendarToggle?: (calendarId: string, visible: boolean) => void
  onCalendarSelect?: (calendarId: string) => void
  onCalendarCreate?: () => void
  onCalendarEdit?: (calendarId: string) => void
  onCalendarDelete?: (calendarId: string) => void
  
  // TagFilter props
  tags?: TagItem[]
  selectedTagIds?: string[]
  onTagToggle?: (tagId: string, selected: boolean) => void
  onTagCreate?: (name: string, color?: string) => void
  onTagClearAll?: () => void
  
  // QuickActions props
  onCreateEvent?: () => void
  onCreateTask?: () => void
  onCreateLog?: () => void
  onOpenSettings?: () => void
  onExport?: () => void
  onImport?: () => void
  onSyncCalendars?: () => void
  onGoToToday?: () => void
  
  // Display options
  showMiniCalendar?: boolean
  showCalendarList?: boolean
  showTagFilter?: boolean
  showQuickActions?: boolean
  defaultExpanded?: string[] // セクションのデフォルト展開状態
}

export const Sidebar = memo<SidebarProps>(({
  className,
  collapsed = false,
  onCollapsedChange,
  
  // MiniCalendar
  selectedDate,
  onDateSelect,
  highlightedDates = [],
  
  // CalendarList
  calendars = [],
  selectedCalendarIds = [],
  onCalendarToggle,
  onCalendarSelect,
  onCalendarCreate,
  onCalendarEdit,
  onCalendarDelete,
  
  // TagFilter
  tags = [],
  selectedTagIds = [],
  onTagToggle,
  onTagCreate,
  onTagClearAll,
  
  // QuickActions
  onCreateEvent,
  onCreateTask,
  onCreateLog,
  onOpenSettings,
  onExport,
  onImport,
  onSyncCalendars,
  onGoToToday,
  
  // Display options
  showMiniCalendar = true,
  showCalendarList = true,
  showTagFilter = true,
  showQuickActions = true,
  defaultExpanded = ['mini-calendar', 'quick-actions', 'calendar-list']
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(defaultExpanded)
  )

  const toggleCollapsed = useCallback(() => {
    onCollapsedChange?.(!collapsed)
  }, [collapsed, onCollapsedChange])

  const toggleSection = useCallback((sectionId: string) => {
    if (collapsed) return
    
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [collapsed])

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId)

  if (collapsed) {
    return (
      <aside 
        className={cn(
          "calendar-sidebar bg-background border-r min-h-full transition-all duration-300",
          "w-12 flex-shrink-0 overflow-hidden",
          className
        )}
        role="complementary"
        aria-label="カレンダーサイドバー（折りたたみ）"
      >
        <div className="p-2 space-y-2">
          {/* 展開ボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="w-8 h-8 p-0"
            aria-label="サイドバーを展開"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* 折りたたみ時のクイックアクション */}
          {showQuickActions && (
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateEvent}
                className="w-8 h-8 p-0"
                title="イベント作成"
              >
                📅
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCreateTask}
                className="w-8 h-8 p-0"
                title="タスク作成"
              >
                ➕
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGoToToday}
                className="w-8 h-8 p-0"
                title="今日に移動"
              >
                🏠
              </Button>
            </div>
          )}
        </div>
      </aside>
    )
  }

  return (
    <aside 
      className={cn(
        "calendar-sidebar bg-background border-r min-h-full transition-all duration-300",
        "w-80 flex-shrink-0 overflow-hidden flex flex-col",
        className
      )}
      role="complementary"
      aria-label="カレンダーサイドバー"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Menu className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">カレンダー</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="h-7 w-7 p-0"
          aria-label="サイドバーを折りたたむ"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* スクロール可能なコンテンツエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* クイックアクション */}
        {showQuickActions && (
          <QuickActions
            onCreateEvent={onCreateEvent}
            onCreateTask={onCreateTask}
            onCreateLog={onCreateLog}
            onOpenSettings={onOpenSettings}
            onExport={onExport}
            onImport={onImport}
            onSyncCalendars={onSyncCalendars}
            onGoToToday={onGoToToday}
            variant="expanded"
          />
        )}

        {/* ミニカレンダー */}
        {showMiniCalendar && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => toggleSection('mini-calendar')}
              className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-accent-foreground transition-colors"
            >
              <span>カレンダー</span>
              {isExpanded('mini-calendar') ? (
                <ChevronLeft className="h-3 w-3 transform rotate-90" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {isExpanded('mini-calendar') && (
              <MiniCalendar 
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
                highlightedDates={highlightedDates}
                firstDayOfWeek={1}
                showWeekNumbers={false}
              />
            )}
          </div>
        )}

        {/* カレンダーリスト */}
        {showCalendarList && calendars.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => toggleSection('calendar-list')}
              className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-accent-foreground transition-colors"
            >
              <span>マイカレンダー</span>
              {isExpanded('calendar-list') ? (
                <ChevronLeft className="h-3 w-3 transform rotate-90" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {isExpanded('calendar-list') && (
              <CalendarList
                calendars={calendars}
                selectedCalendarIds={selectedCalendarIds}
                onCalendarToggle={onCalendarToggle}
                onCalendarSelect={onCalendarSelect}
                onCalendarCreate={onCalendarCreate}
                onCalendarEdit={onCalendarEdit}
                onCalendarDelete={onCalendarDelete}
              />
            )}
          </div>
        )}

        {/* タグフィルター */}
        {showTagFilter && tags.length > 0 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => toggleSection('tag-filter')}
              className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-accent-foreground transition-colors"
            >
              <span>タグフィルター</span>
              {isExpanded('tag-filter') ? (
                <ChevronLeft className="h-3 w-3 transform rotate-90" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {isExpanded('tag-filter') && (
              <TagFilter
                tags={tags}
                selectedTagIds={selectedTagIds}
                onTagToggle={onTagToggle}
                onTagCreate={onTagCreate}
                onClearAll={onTagClearAll}
                showCounts={true}
                maxVisibleTags={8}
              />
            )}
          </div>
        )}
      </div>

      {/* フッター（オプション） */}
      <div className="border-t p-3">
        <div className="text-xs text-muted-foreground text-center">
          BoxLog Calendar
        </div>
      </div>
    </aside>
  )
})

Sidebar.displayName = 'Sidebar'