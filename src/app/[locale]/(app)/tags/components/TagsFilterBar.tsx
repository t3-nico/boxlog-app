'use client'

import { ChevronDown, Filter, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { TranslationFunction } from '@/features/i18n/lib/hooks'

interface TagsFilterBarProps {
  onCreateTag: () => void
  t: TranslationFunction
}

export function TagsFilterBar({ onCreateTag, t }: TagsFilterBarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-6 py-2">
      <div className="flex h-8 items-center gap-2">
        {/* フィルタータイプドロップダウン */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>{t('tags.page.filter.type')}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>{t('tags.page.filter.all')}</DropdownMenuItem>
            <DropdownMenuItem>{t('tags.page.filter.unused')}</DropdownMenuItem>
            <DropdownMenuItem>{t('tags.page.filter.frequentlyUsed')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex h-8 items-center">
        <Button onClick={onCreateTag} size="sm" className="h-8">
          <Plus className="mr-2 size-4" />
          {t('tags.page.createTag')}
        </Button>
      </div>
    </div>
  )
}
