'use client'

import React from 'react'
import { CommonSidebarSections } from '../shared'
import { CreateButton } from './create-button'
import { BoardSidebarSections } from '@/features/board/components/sidebar'
import { TableSidebarSections } from '@/features/table/components/sidebar'
import { StatsSidebarSections } from '@/features/stats/components/sidebar'
import { HelpSidebarSections } from '@/features/help/components/sidebar'
import { AIChatSidebarSections } from '@/features/aichat/components/sidebar'

interface PageContentProps {
  pathname: string
}

export function PageContent({ pathname }: PageContentProps) {
  const isCalendarPage = pathname.startsWith('/calendar')
  const isBoardPage = pathname.startsWith('/board')
  const isTablePage = pathname.startsWith('/table')
  const isStatsPage = pathname.startsWith('/stats')
  const isAIChatPage = pathname.startsWith('/ai-chat')
  const isHelpPage = pathname.startsWith('/help')

  // Createボタンを表示するページを定義（calendar, table, boardのみ）
  const showCreateButton = isCalendarPage || isTablePage || isBoardPage

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Createボタン（特定ページのみ表示） */}
      {showCreateButton && <CreateButton />}
      
      {/* Common sections for all pages */}
      <CommonSidebarSections collapsed={false} />

      {/* Page-specific sections */}
      <div className="space-y-6">

        {isBoardPage && (
          <BoardSidebarSections
            collapsed={false}
            onSelectTag={() => {}}
            selectedTagIds={[]}
          />
        )}

        {isTablePage && (
          <TableSidebarSections
            collapsed={false}
            onSelectTag={() => {}}
            selectedTagIds={[]}
          />
        )}

        {isStatsPage && (
          <StatsSidebarSections
            collapsed={false}
            onSelectTag={() => {}}
            selectedTagIds={[]}
          />
        )}

        {isAIChatPage && (
          <AIChatSidebarSections collapsed={false} />
        )}

        {isHelpPage && (
          <HelpSidebarSections collapsed={false} />
        )}
      </div>
    </div>
  )
}