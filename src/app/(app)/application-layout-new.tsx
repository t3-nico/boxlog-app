'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { Avatar } from '@/components/avatar'
import { ToastProvider } from '@/components/ui/toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeProvider } from '@/contexts/theme-context'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { ViewSwitcher } from '@/components/ui/view-switcher'
import { getPageTitle, getCurrentViewIcon } from '@/config/views'
import { useBoxStore } from '@/lib/box-store'
import { useSidebarStore, sidebarSelectors } from '@/stores/sidebarStore'
import { TagManagementModal } from '@/features/tags/components/tag-management-modal'
import { QuickTagCreateModal } from '@/features/tags/components/quick-tag-create-modal'
import { sidebarConfig } from '@/config/sidebarConfig'
import { useCommandPalette } from '@/components/providers'
import { CalendarSettingsMenu } from '@/features/calendar/components/calendar-grid/CalendarSettingsMenu'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import * as Headless from '@headlessui/react'
import { Button } from '@/components/button'
import { Button as ShadButton } from '@/components/ui/button'
import { NavbarItem } from '@/components/navbar'
import {
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/sidebar'
import { AIChatSidebar } from '@/components/ai-chat-sidebar'
import { CodebaseAIChat } from '@/components/codebase-ai-chat'
import { CommonSidebarSections } from '@/components/sidebar/CommonSidebarSections'
import { CommonBottomSections } from '@/components/sidebar/CommonBottomSections'
import { CalendarSidebarSections } from '@/features/calendar/components/sidebar'
import { BoardSidebarSections } from '@/features/board/components/sidebar'
import { TableSidebarSections } from '@/features/table/components/sidebar'
import { StatsSidebarSections } from '@/features/stats/components/sidebar'
import { AddPopup, useAddPopup } from '@/features/calendar/components/add-popup'
import { getEvents, getReviews } from '@/data'
import {
  LogOut as ArrowRightStartOnRectangleIcon,
  ChevronDown as ChevronDownIcon,
  Settings as Cog8ToothIcon,
  Lightbulb as LightBulbIcon,
  HelpCircle as QuestionMarkCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
  Code2,
  BotMessageSquare,
} from 'lucide-react'
import {
  Calendar as CalendarIcon,
  Box as CubeIcon,
  FileText as DocumentTextIcon,
  Search as MagnifyingGlassIcon,
  Plus as PlusIcon,
  PlusCircle as PlusCircleIcon,
  Settings as Cog6ToothIcon,
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
  ChevronRight as ChevronRightIcon,
  PanelLeft,
  PanelRight,
  Trash2 as TrashIcon,
  Clock as ClockIcon,
  TableProperties as TableCellsIcon,
  BarChart3 as ChartBarIcon,
  SquareKanban as Squares2X2Icon,
} from 'lucide-react'

export function ApplicationLayoutNew({
  events,
  reviews,
  children,
  hideHeader = false,
}: {
  events: Awaited<ReturnType<typeof getEvents>>
  reviews: Awaited<ReturnType<typeof getReviews>>
  children: React.ReactNode
  hideHeader?: boolean
}) {
  let pathname = usePathname()
  const searchParams = useSearchParams()
  let inSettings = pathname.startsWith('/settings')
  let inReview = pathname.startsWith('/review')
  let is404Page = pathname === '/404' || pathname.includes('not-found') || pathname === '/_not-found'
  const { user, signOut } = useAuthContext()
  const { open: openCommandPalette } = useCommandPalette()
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
  
  // ページ状態の監視
  
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
        // dateパラメータがない場合は今日の日付
        setSelectedDate(new Date())
      }
    }
  }, [pathname, isCalendarPage, searchParams])
  
  // Close header settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerSettingsRef.current && !headerSettingsRef.current.contains(event.target as Node)) {
        setShowHeaderSettingsMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  
  // 日付選択時のハンドラー
  const handleDateSelect = (date: Date | undefined) => {
    // 既に選択されている日付を再クリックした場合は選択状態を維持
    if (!date && selectedDate) {
      return
    }
    
    setSelectedDate(date)
    if (date && isCalendarPage) {
      // カレンダーページの場合、選択した日付にナビゲート
      const formatDate = (d: Date) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      const dateParam = formatDate(date)
      
      // 現在のビューを取得（/calendar/day, /calendar/week等）
      const currentView = pathname.split('/calendar/')[1]?.split('?')[0] || 'day'
      const newUrl = `/calendar/${currentView}?date=${dateParam}`
      
      
      // ページの再レンダリングを強制するため、現在のURLと異なる場合のみナビゲート
      if (newUrl !== `${pathname}${window.location.search}`) {
        router.push(newUrl)
      }
    }
  }
  
  // AI Chat Sidebar state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [isCodebaseAIChatOpen, setIsCodebaseAIChatOpen] = useState(false)
  
  // Right sidebar visibility state (like Google Calendar)
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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
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
    // 子タグの親IDをnullに更新
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

  // 動的ページタイトルとアイコンを取得
  const pageTitle = !inSettings ? getPageTitle(pathname) : 'BoxLog'
  const PageIcon = !inSettings ? getCurrentViewIcon(pathname) : null

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex flex-col h-screen">
        {/* Fixed Header - Full width at top */}
        <header className="fixed top-0 left-0 right-0 z-20 bg-background border-b border-border h-16">
          <div className="flex items-center justify-between px-4 h-full">
            {/* Left side - Logo and menu */}
            <div className="flex items-center gap-2">
              {/* Sidebar toggle button */}
              {!inSettings && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-2 rounded-md hover:bg-accent/50 transition-colors"
                  title={collapsed ? "Open sidebar" : "Close sidebar"}
                >
                  {collapsed ? (
                    <PanelRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <PanelLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              )}
              {!inSettings && (
                <Headless.Menu as="div" className="relative">
                  <Headless.MenuButton className="flex cursor-pointer select-none items-center gap-3 rounded-lg px-2 py-2 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5 data-[slot=icon]:*:size-6 data-[slot=icon]:*:shrink-0 data-[slot=icon]:*:text-zinc-500 sm:data-[slot=icon]:*:size-5 data-[hover]:bg-zinc-950/5 data-[slot=icon]:*:data-[hover]:text-zinc-950 data-[active]:bg-zinc-950/5 data-[slot=icon]:*:data-[active]:text-zinc-950 data-[slot=current]:*:data-[slot=icon]:text-zinc-950 dark:text-white dark:data-[slot=icon]:*:text-zinc-400 dark:data-[hover]:bg-white/5 data-[slot=icon]:*:data-[hover]:text-white dark:data-[active]:bg-white/5 data-[slot=icon]:*:data-[active]:text-white dark:data-[slot=current]:*:data-[slot=icon]:text-white forced-colors:data-[slot=current]:*:data-[slot=icon]:text-[Highlight]">
                    {user?.user_metadata?.avatar_url ? (
                      <Avatar src={user.user_metadata.avatar_url} className="w-5 h-5 border border-gray-300 dark:border-gray-600" />
                    ) : user?.user_metadata?.profile_icon ? (
                      <div className="w-5 h-5 text-sm flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600">
                        {user.user_metadata.profile_icon}
                      </div>
                    ) : (
                      <Avatar 
                        src={undefined}
                        className="w-5 h-5 border border-gray-300 dark:border-gray-600"
                        initials={(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                      />
                    )}
                    <SidebarLabel>
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </SidebarLabel>
                    <ChevronDownIcon data-slot="icon" />
                  </Headless.MenuButton>
                  <Headless.MenuItems className="absolute left-0 mt-2 w-80 lg:w-64 origin-top-left rounded-xl bg-white/75 backdrop-blur-xl dark:bg-zinc-800/75 shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 p-2 z-[99999]">
                    <Headless.MenuItem>
                      {({ focus }) => (
                        <a
                          href="/settings"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <Cog8ToothIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          <span className="text-zinc-950 dark:text-white">Settings</span>
                        </a>
                      )}
                    </Headless.MenuItem>
                    <div className="my-1 h-px bg-zinc-950/10 dark:bg-white/10" />
                    <Headless.MenuItem>
                      {({ focus }) => (
                        <a
                          href="#"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <ShieldCheckIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          <span className="text-zinc-950 dark:text-white">Privacy policy</span>
                        </a>
                      )}
                    </Headless.MenuItem>
                    <Headless.MenuItem>
                      {({ focus }) => (
                        <a
                          href="#"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <LightBulbIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          <span className="text-zinc-950 dark:text-white">Share feedback</span>
                        </a>
                      )}
                    </Headless.MenuItem>
                    <Headless.MenuItem>
                      {({ focus }) => (
                        <a
                          href="#"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <QuestionMarkCircleIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          <span className="text-zinc-950 dark:text-white">Support</span>
                        </a>
                      )}
                    </Headless.MenuItem>
                    <Headless.MenuItem>
                      {({ focus }) => (
                        <a
                          href="#"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <SparklesIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          <span className="text-zinc-950 dark:text-white">Changelog</span>
                        </a>
                      )}
                    </Headless.MenuItem>
                    <div className="my-1 h-px bg-zinc-950/10 dark:bg-white/10" />
                    <Headless.MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={handleSignOut}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            focus ? 'bg-zinc-950/5 dark:bg-white/5' : ''
                          }`}
                        >
                          <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          <span className="text-zinc-950 dark:text-white">Logout</span>
                        </button>
                      )}
                    </Headless.MenuItem>
                  </Headless.MenuItems>
                </Headless.Menu>
              )}
              
              {inSettings && (
                <SidebarItem href="/" indicator={false}>
                  <ChevronLeftIcon data-slot="icon" />
                  <SidebarLabel>Back to app</SidebarLabel>
                </SidebarItem>
              )}
              
              {/* View Switcher - moved to left side */}
              {!inSettings && <div className="ml-16"><ViewSwitcher /></div>}
            </div>
            
            {/* Right side - Notifications, theme toggle, AI icon */}
            <div className="flex items-center gap-2">
              {!inSettings && (
                <>
                  <Dropdown>
                    <DropdownButton as={NavbarItem} aria-label="Notifications">
                      <BellIcon className="h-5 w-5" data-slot="icon" />
                    </DropdownButton>
                    <DropdownMenu className="min-w-80 max-w-96" anchor="bottom end">
                      <div className="p-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-2 rounded-full">
                                System
                              </span>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-2 rounded-full">
                                Unread
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">System Maintenance Notice</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Scheduled maintenance on July 12, 2025 from 2:00-4:00 AM.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">2025-07-08</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <a
                            href="/notifications"
                            className="block w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View all notifications
                          </a>
                        </div>
                      </div>
                    </DropdownMenu>
                  </Dropdown>
                  
                  {!hideHeader && !is404Page && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            openCommandPalette()
                          }}
                          className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          title="Search (⌘K)"
                        >
                          <MagnifyingGlassIcon className="size-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => window.open('#', '_blank')}
                          className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          title="Help"
                        >
                          <QuestionMarkCircleIcon className="size-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          ref={headerSettingsRef}
                          onClick={() => {
                            console.log('⚙️ Settings icon clicked, isCalendarPage:', isCalendarPage)
                            if (isCalendarPage) {
                              console.log('📅 Opening calendar settings menu, current state:', showHeaderSettingsMenu)
                              setShowHeaderSettingsMenu(!showHeaderSettingsMenu)
                            } else {
                              console.log('🔄 Navigating to /settings')
                              router.push('/settings')
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          title={isCalendarPage ? "Calendar Settings" : "Settings"}
                        >
                          <Cog6ToothIcon className="size-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </>
                    )}
                </>
              )}
            </div>
          </div>
        </header>
        
        {/* Header Settings Menu */}
        {isCalendarPage && (
          <CalendarSettingsMenu
            isOpen={showHeaderSettingsMenu}
            onClose={() => setShowHeaderSettingsMenu(false)}
            anchorEl={headerSettingsRef.current}
            onPrintClick={() => {
              console.log('Print calendar from header')
              setShowHeaderSettingsMenu(false)
            }}
            onTrashClick={() => {
              console.log('🗑️ Open trash from header - onTrashClick called')
              setShowHeaderSettingsMenu(false)
              // /settings/trashページに遷移
              console.log('🔄 Navigating to /settings/trash')
              router.push('/settings/trash')
            }}
            trashedCount={0} // TODO: 削除済みイベント数を渡す
          />
        )}
        
        {/* Body - Layout container */}
        <div className="flex-1" style={{paddingTop: '64px'}}>
          {/* Left Sidebar - Hidden when collapsed */}
          {!collapsed && (
            <div className="w-64 fixed left-0 bg-background border-r border-border z-10" style={{top: '64px', bottom: '0', transition: 'width 150ms ease'}}>
              <div className="h-full flex flex-col p-4">
                {!inSettings && (
                  <>
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
          <div className="bg-background relative z-10" style={{
            marginLeft: collapsed ? '0px' : '256px',
            marginRight: (isAIChatOpen || isCodebaseAIChatOpen) ? '320px' : (isRightSidebarHidden ? '0px' : '48px'),
            transition: 'margin-left 150ms ease, margin-right 150ms ease',
            height: 'calc(100vh - 64px)',
            padding: '0 !important'
          }}>
            <ScrollArea className="h-full" style={{ padding: '0px', margin: '0px' }}>
              <div style={{ padding: '0px', margin: '0px', height: '100%', width: '100%' }}>
                <div style={{ padding: '0px', margin: '0px', height: '100%', width: '100%' }}>
                  {children}
                </div>
              </div>
            </ScrollArea>
          </div>
          
          {/* Right Icon Bar - Hide when any AI Chat is open */}
          {!isAIChatOpen && !isCodebaseAIChatOpen && !isRightSidebarHidden && (
            <div className="w-12 fixed right-0 bg-background border-l border-border flex flex-col items-center py-4 gap-2 z-40" style={{top: '64px', bottom: '0'}}>
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
          
          {/* Fixed toggle button at bottom right - always visible when not in AI chat */}
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
          
          {/* Right Chat Sidebars (conditionally shown) */}
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
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}