'use client'

import React, { useCallback } from 'react'

import { AIChatSidebarSections } from '@/features/aichat/components/sidebar'
import { BoardSidebarSections } from '@/features/board/components/sidebar'

import { HelpSidebarSections } from '@/features/help/components/sidebar'
import { StatsSidebarSections } from '@/features/stats/components/sidebar'
import { TableSidebarSections } from '@/features/table/components/sidebar'

import { CreateButton } from './create-button'
import { CommonSidebarSections } from './shared'

interface PageContentProps {
  pathname: string
}

export const PageContent = ({ pathname }: PageContentProps) => {
  const isCalendarPage = pathname.startsWith('/calendar')
  const isBoardPage = pathname.startsWith('/board')
  const isTablePage = pathname.startsWith('/table')
  const isStatsPage = pathname.startsWith('/stats')
  const isAIChatPage = pathname.startsWith('/ai-chat')
  const isHelpPage = pathname.startsWith('/help')

  // Createボタンを表示するページを定義（calendar, table, boardのみ）
  const showCreateButton = isCalendarPage || isTablePage || isBoardPage

  const handleSelectTag = useCallback(() => {}, [])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Createボタン（特定ページのみ表示） */}
      {showCreateButton && <CreateButton />}
      
      {/* Common sections for non-calendar pages */}
      {!isCalendarPage && <CommonSidebarSections collapsed={false} />}

      {/* Page-specific sections */}
      <div className="space-y-6">

        {isBoardPage === true && (
          <BoardSidebarSections
            collapsed={false}
            onSelectTag={handleSelectTag}
            selectedTagIds={[]}
          />
        )}

        {isTablePage === true && (
          <TableSidebarSections
            collapsed={false}
            onSelectTag={handleSelectTag}
            selectedTagIds={[]}
          />
        )}

        {isStatsPage === true && (
          <StatsSidebarSections
            collapsed={false}
            onSelectTag={handleSelectTag}
            selectedTagIds={[]}
          />
        )}

        {isAIChatPage === true && (
          <AIChatSidebarSections collapsed={false} />
        )}

        {isHelpPage === true && (
          <HelpSidebarSections collapsed={false} />
        )}
      </div>
    </div>
  )
}