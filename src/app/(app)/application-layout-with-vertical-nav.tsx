'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeProvider } from '@/contexts/theme-context'
import { useAuthContext } from '@/features/auth'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { getPageTitle, getCurrentViewIcon } from '@/config/views'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useBoxStore } from '@/lib/box-store'
import { TagManagementModal } from '@/features/tags/components/tag-management-modal'
import { QuickTagCreateModal } from '@/features/tags/components/quick-tag-create-modal'
import { CalendarSettingsMenu } from '@/features/calendar/components/calendar-grid/CalendarSettingsMenu'
import { Button as ShadButton } from '@/components/ui/button'
import {
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/sidebar'
import { AiChatSidebar as AIChatSidebar, CodebaseAiChat as CodebaseAIChat } from '@/features/aichat'
import { VerticalNavMenu } from '@/components/layout/VerticalNavMenu'
import { CommonSidebarSections } from '@/components/sidebar/CommonSidebarSections'
import { CommonBottomSections } from '@/components/sidebar/CommonBottomSections'
import { CalendarSidebarSections } from '@/features/calendar/components/sidebar'
import { BoardSidebarSections } from '@/features/board/components/sidebar'
import { TableSidebarSections } from '@/features/table/components/sidebar'
import { StatsSidebarSections } from '@/features/stats/components/sidebar'
import { AddPopup, useAddPopup } from '@/features/calendar/components/add-popup'
import {
  SparklesIcon,
  BotMessageSquare,
  PlusCircle as PlusCircleIcon,
  User as UserIcon,
  SlidersVertical as AdjustmentsVerticalIcon,
  CreditCard as CreditCardIcon,
  Link as LinkIcon,
  Bell as BellIcon,
  Download as ArrowDownTrayIcon,
  Info as InformationCircleIcon,
  Tag as TagIcon,
  ClipboardList as ClipboardDocumentListIcon,
  ChevronLeft as ChevronLeftIcon,
  PanelLeft,
  PanelRight,
  Trash2 as TrashIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Settings as Cog6ToothIcon,
} from 'lucide-react'

export function ApplicationLayoutWithVerticalNav({
  events,
  reviews,
  children,
  hideHeader = false,
}: {
  events?: any
  reviews?: any
  children: React.ReactNode
  hideHeader?: boolean
}) {
  let pathname = usePathname()
  const searchParams = useSearchParams()
  let inSettings = pathname.startsWith('/settings')
  let inReview = pathname.startsWith('/review')
  let is404Page = pathname === '/404' || pathname.includes('not-found') || pathname === '/_not-found'
  const { user, signOut } = useAuthContext()
  const router = useRouter()
  const { isOpen, openPopup, closePopup } = useAddPopup()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  
  // カレンダータグ機能のstate（階層化対応）
  const [calendarTags, setCalendarTags] = useState([
    { id: '1', name: 'Work', color: '#3b82f6', parentId: null, isExpanded: true },
    { id: '2', name: 'Meeting', color: '#8b5cf6', parentId: '1', isExpanded: true },
    { id: '3', name: 'Development', color: '#10b981', parentId: '1', isExpanded: false },
    { id: '4', name: 'Personal', color: '#f59e0b', parentId: null, isExpanded: true },
    { id: '5', name: 'Learning', color: '#06b6d4', parentId: '4' },
    { id: '6', name: 'Important', color: '#ef4444', parentId: null },
  ])
  const [selectedCalendarTags, setSelectedCalendarTags] = useState<string[]>([])
  const [calendarTagFilterMode, setCalendarTagFilterMode] = useState<'AND' | 'OR'>('OR')
  const [showTagManagement, setShowTagManagement] = useState(false)
  const [showQuickTagCreate, setShowQuickTagCreate] = useState(false)
  
  // ページタイプの判定
  const isCalendarPage = pathname.startsWith('/calendar')
  const isBoardPage = pathname.startsWith('/board')
  const isTablePage = pathname.startsWith('/table') 
  const isStatsPage = pathname.startsWith('/stats')
  
  // Settings menu state for header
  const [showHeaderSettingsMenu, setShowHeaderSettingsMenu] = useState(false)
  const headerSettingsRef = useRef<HTMLButtonElement>(null)
  
  // URLから日付を取得してselectedDateを同期
  useEffect(() => {
    if (isCalendarPage) {
      const dateParam = searchParams.get('date')
      if (dateParam) {
        const parsedDate = new Date(dateParam)
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate)
        }
      } else {
        setSelectedDate(new Date())
      }
    }
  }, [pathname, isCalendarPage, searchParams])
  
  // 日付選択時のハンドラー
  const handleDateSelect = (date: Date | undefined) => {
    if (!date && selectedDate) {
      return
    }
    
    setSelectedDate(date)
    if (date && isCalendarPage) {
      const formatDate = (d: Date) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      const dateParam = formatDate(date)
      
      const currentView = pathname.split('/calendar/')[1]?.split('?')[0] || 'day'
      const newUrl = `/calendar/${currentView}?date=${dateParam}`
      
      if (newUrl !== `${pathname}${window.location.search}`) {
        router.push(newUrl)
      }
    }
  }
  
  // AI Chat Sidebar state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [isCodebaseAIChatOpen, setIsCodebaseAIChatOpen] = useState(false)
  
  // Right sidebar visibility state
  const [isRightSidebarHidden, setIsRightSidebarHidden] = useState(false)
  
  // Sidebar state from store
  const { collapsed, setCollapsed } = useSidebarStore()
  
  // SmartFolder and Tag filtering
  const { setSmartFolderFilter, setTagFilter, filters } = useBoxStore()
  
  const handleSelectSmartFolder = (folderId: string) => {
    setSmartFolderFilter(folderId)
  }

  const handleSelectTag = (tagId: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tagId) 
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId]
    setTagFilter(newTags)
  }

  // カレンダータグ管理ハンドラー
  const handleCalendarTagSelect = (tagId: string) => {
    setSelectedCalendarTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleCreateCalendarTag = (tag: { name: string; color: string; parentId?: string | null }) => {
    const newTag = {
      id: Date.now().toString(),
      parentId: null,
      isExpanded: true,
      ...tag
    }
    setCalendarTags(prev => [...prev, newTag])
  }

  const handleUpdateCalendarTag = (id: string, updates: { name?: string; color?: string; parentId?: string | null }) => {
    setCalendarTags(prev => prev.map(tag =>
      tag.id === id ? { ...tag, ...updates } : tag
    ))
  }

  const handleDeleteCalendarTag = (id: string) => {
    setCalendarTags(prev => prev
      .filter(tag => tag.id !== id)
      .map(tag => tag.parentId === id ? { ...tag, parentId: null } : tag)
    )
    setSelectedCalendarTags(prev => prev.filter(tagId => tagId !== id))
  }

  const handleToggleTagExpand = (tagId: string) => {
    setCalendarTags(prev => prev.map(tag =>
      tag.id === tagId ? { ...tag, isExpanded: !tag.isExpanded } : tag
    ))
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex h-screen">
          {/* L1: Vertical Navigation Menu */}
          <VerticalNavMenu />
          
          {/* L2: Left Sidebar - Hidden when collapsed */}
          {!collapsed && (
            <div className="w-64 bg-background border-r border-border">
              <div className="h-full flex flex-col p-4">
                {!inSettings && (
                  <>
                    {/* ページタイトル */}
                    <div className="flex-shrink-0 mb-4">
                      <div className="px-2 flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-foreground">
                          {getPageTitle(pathname)}
                        </h1>
                        <button
                          onClick={() => setCollapsed(true)}
                          className="p-1 rounded-md hover:bg-accent/50 transition-colors"
                          title="Close sidebar"
                        >
                          <PanelLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Createボタン - 一番上に固定 */}
                    <div className="flex-shrink-0 mb-6">
                      <SidebarSection>
                        <div className="relative">
                          <ShadButton
                            onClick={(e) => {
                              e.preventDefault()
                              openPopup('event')
                            }}
                            variant="default"
                            className="w-[136px] h-[56px] py-4 px-4 flex items-center gap-2 font-semibold"
                          >
                            <span className="truncate">Create</span>
                            <PlusCircleIcon className="size-5 shrink-0 text-primary-foreground" />
                          </ShadButton>
                        </div>
                      </SidebarSection>
                    </div>

                    {/* 中央コンテンツエリア - 上に寄せて配置 */}
                    <div className="flex-1 flex flex-col gap-6 min-h-0">
                      {/* 全ページ共通部分 */}
                      <CommonSidebarSections collapsed={collapsed} />

                      {/* ページ別専用部分 */}
                      <div className="space-y-6">
                        {isCalendarPage && (
                          <CalendarSidebarSections
                            collapsed={collapsed}
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                            tags={calendarTags}
                            selectedTags={selectedCalendarTags}
                            tagFilterMode={calendarTagFilterMode}
                            onTagSelect={handleCalendarTagSelect}
                            onToggleExpand={() => handleToggleTagExpand('')}
                            onFilterModeChange={setCalendarTagFilterMode}
                            onManageTags={() => setShowTagManagement(true)}
                            onCreateTag={() => setShowQuickTagCreate(true)}
                          />
                        )}

                        {isBoardPage && (
                          <BoardSidebarSections
                            collapsed={collapsed}
                            onSelectTag={handleSelectTag}
                            selectedTagIds={filters.tags || []}
                          />
                        )}

                        {isTablePage && (
                          <TableSidebarSections
                            collapsed={collapsed}
                            onSelectTag={handleSelectTag}
                            selectedTagIds={filters.tags || []}
                          />
                        )}

                        {isStatsPage && (
                          <StatsSidebarSections
                            collapsed={collapsed}
                            onSelectTag={handleSelectTag}
                            selectedTagIds={filters.tags || []}
                          />
                        )}
                      </div>
                    </div>

                    {/* スケジュールカード - 一番下に固定 */}
                    <div className="flex-shrink-0 mt-6">
                      <CommonBottomSections collapsed={collapsed} />
                    </div>
                  </>
                )}

                {inSettings && (
                  <>
                    <SidebarSection>
                      <SidebarItem
                        href="/"
                        indicator={false}
                      >
                        <ChevronLeftIcon data-slot="icon" />
                        <SidebarLabel>Back to app</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>

                    <SidebarSection>
                      <SidebarHeading>General</SidebarHeading>
                      <SidebarItem
                        href="/settings/account"
                        current={pathname.startsWith('/settings/account')}
                        indicator={false}
                      >
                        <UserIcon data-slot="icon" />
                        <SidebarLabel>Account</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/settings/preferences"
                        current={pathname.startsWith('/settings/preferences')}
                        indicator={false}
                      >
                        <AdjustmentsVerticalIcon data-slot="icon" />
                        <SidebarLabel>Preferences</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/settings/notifications"
                        current={pathname.startsWith('/settings/notifications')}
                        indicator={false}
                      >
                        <BellIcon data-slot="icon" />
                        <SidebarLabel>Notifications</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/settings/calendar"
                        current={pathname.startsWith('/settings/calendar')}
                        indicator={false}
                      >
                        <CalendarIcon data-slot="icon" />
                        <SidebarLabel>Calendar</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>

                    <SidebarSection className="mt-8">
                      <SidebarHeading>Customization</SidebarHeading>
                      <SidebarItem
                        href="/settings/tags"
                        current={pathname.startsWith('/settings/tags')}
                        indicator={false}
                      >
                        <TagIcon data-slot="icon" />
                        <SidebarLabel>Tags</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/settings/templates"
                        current={pathname.startsWith('/settings/templates')}
                        indicator={false}
                      >
                        <ClipboardDocumentListIcon data-slot="icon" />
                        <SidebarLabel>Task Templates</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>

                    <SidebarSection className="mt-8">
                      <SidebarHeading>Integration</SidebarHeading>
                      <SidebarItem
                        href="/settings/integration"
                        current={pathname.startsWith('/settings/integration')}
                        indicator={false}
                      >
                        <LinkIcon data-slot="icon" />
                        <SidebarLabel>Calendar & Integration</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>

                    <SidebarSection className="mt-8">
                      <SidebarHeading>Data</SidebarHeading>
                      <SidebarItem
                        href="/settings/plan-billing"
                        current={pathname.startsWith('/settings/plan-billing')}
                        indicator={false}
                      >
                        <CreditCardIcon data-slot="icon" />
                        <SidebarLabel>Plan & Billing</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/settings/data-export"
                        current={pathname.startsWith('/settings/data-export')}
                        indicator={false}
                      >
                        <ArrowDownTrayIcon data-slot="icon" />
                        <SidebarLabel>Data & Export</SidebarLabel>
                      </SidebarItem>
                      <SidebarItem
                        href="/settings/trash"
                        current={pathname.startsWith('/settings/trash')}
                        indicator={false}
                      >
                        <TrashIcon data-slot="icon" />
                        <SidebarLabel>Trash</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>

                    <SidebarSection className="mt-8">
                      <SidebarHeading>Personal</SidebarHeading>
                      <SidebarItem
                        href="/settings/chronotype"
                        current={pathname.startsWith('/settings/chronotype')}
                        indicator={false}
                      >
                        <ClockIcon data-slot="icon" />
                        <SidebarLabel>Chronotype</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>

                    <SidebarSection className="mt-8">
                      <SidebarHeading>About</SidebarHeading>
                      <SidebarItem
                        href="/settings/legal"
                        current={pathname.startsWith('/settings/legal')}
                        indicator={false}
                      >
                        <InformationCircleIcon data-slot="icon" />
                        <SidebarLabel>About / Legal</SidebarLabel>
                      </SidebarItem>
                    </SidebarSection>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="flex-1 relative z-10" style={{
            marginRight: (isAIChatOpen || isCodebaseAIChatOpen) ? '320px' : (isRightSidebarHidden ? '0px' : '48px'),
            transition: 'margin-right 150ms ease',
            height: '100vh'
          }}>
            {/* L2 Toggle Button - Only show when collapsed */}
            {!inSettings && collapsed && (
              <div className="absolute top-4 left-4 z-20">
                <button
                  onClick={() => setCollapsed(false)}
                  className="p-2 rounded-md hover:bg-accent/50 transition-colors bg-background border border-border shadow-sm"
                  title="Open sidebar"
                >
                  <PanelRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            )}


            <ScrollArea className="h-full">
              <div className="h-full w-full">
                {children}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right Icon Bar - Hide when any AI Chat is open */}
          {!isAIChatOpen && !isCodebaseAIChatOpen && !isRightSidebarHidden && (
            <div className="w-12 bg-background border-l border-border flex flex-col items-center py-4 gap-2 z-40">
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="p-2 rounded-lg transition-colors hover:bg-accent/50 text-gray-600 dark:text-gray-400"
                title="AI Assistant"
              >
                <SparklesIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsCodebaseAIChatOpen(true)}
                className="p-2 rounded-lg transition-colors hover:bg-accent/50 text-gray-600 dark:text-gray-400"
                title="Codebase AI"
              >
                <BotMessageSquare className="w-5 h-5" />
              </button>
            </div>
          )}
          
          {/* Fixed toggle button at bottom right */}
          {!isAIChatOpen && !isCodebaseAIChatOpen && (
            <button
              onClick={() => setIsRightSidebarHidden(!isRightSidebarHidden)}
              className={`fixed right-2 bottom-4 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 z-40 ${
                isRightSidebarHidden 
                  ? 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={isRightSidebarHidden ? "Show sidebar" : "Hide sidebar"}
            >
              {isRightSidebarHidden ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelRight className="w-5 h-5" />
              )}
            </button>
          )}
          
          {/* Right Chat Sidebars */}
          <AIChatSidebar 
            isOpen={isAIChatOpen} 
            onClose={() => setIsAIChatOpen(false)} 
          />
          <CodebaseAIChat 
            isOpen={isCodebaseAIChatOpen} 
            onClose={() => setIsCodebaseAIChatOpen(false)} 
          />
        </div>
        
        {/* Floating Components */}
        <AddPopup 
          open={isOpen} 
          onOpenChange={(open) => open ? openPopup() : closePopup()}
          defaultTab="event"
        />
        
        {/* カレンダータグ管理モーダル */}
        <TagManagementModal
          isOpen={showTagManagement}
          onClose={() => setShowTagManagement(false)}
          tags={calendarTags}
          onCreateTag={handleCreateCalendarTag}
          onUpdateTag={handleUpdateCalendarTag}
          onDeleteTag={handleDeleteCalendarTag}
        />
        
        {/* クイックタグ作成モーダル */}
        <QuickTagCreateModal
          isOpen={showQuickTagCreate}
          onClose={() => setShowQuickTagCreate(false)}
          onCreateTag={handleCreateCalendarTag}
        />
      </ToastProvider>
    </ThemeProvider>
  )
}