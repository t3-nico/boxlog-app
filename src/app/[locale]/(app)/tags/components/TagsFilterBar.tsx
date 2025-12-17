'use client'

import { ChevronDown, Filter, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { useTranslations } from 'next-intl'

interface TagsFilterBarProps {
  onCreateTag: () => void
  t: ReturnType<typeof useTranslations>
}

export function TagsFilterBar({ onCreateTag, t }: TagsFilterBarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-6 py-2">
      <div className="flex h-8 items-center gap-2">
        {/* フィルタータイプドロップダウン */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="size-4" />
              <span>{t('tag.page.filter.type')}</span>
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>{t('tag.page.filter.all')}</DropdownMenuItem>
            <DropdownMenuItem>{t('tag.page.filter.unused')}</DropdownMenuItem>
            <DropdownMenuItem>{t('tag.page.filter.frequentlyUsed')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex h-8 items-center">
        <Button onClick={onCreateTag} size="sm">
          <Plus className="size-4" />
          {t('tag.page.createTag')}
        </Button>
      </div>
    </div>
  )
}
