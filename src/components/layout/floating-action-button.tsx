'use client'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useCreateEventInspector } from '@/features/inspector/hooks/useCreateEventInspector'
import { Plus } from 'lucide-react'
import { useCallback } from 'react'

interface FloatingActionButtonProps {
  locale: 'ja' | 'en'
}

/**
 * Floating Action Button（FAB）
 *
 * モバイル・タブレット表示で、新規イベント作成を開始する
 */
export function FloatingActionButton({ locale }: FloatingActionButtonProps) {
  const { t } = useI18n(locale)
  const { openCreateInspector } = useCreateEventInspector()

  // jsx-no-bind optimization: Create event handler
  const handleCreateEventClick = useCallback(() => {
    openCreateInspector({
      context: {
        source: 'fab',
      },
    })
  }, [openCreateInspector])

  return (
    <Button
      onClick={handleCreateEventClick}
      size="icon"
      aria-label={t('common.createNewEvent')}
      className="fixed right-4 bottom-20 z-50 h-14 w-14 rounded-2xl shadow-lg md:right-6 md:bottom-6 md:h-16 md:w-16 lg:hidden"
    >
      <Plus className="h-6 w-6 md:h-7 md:w-7" />
    </Button>
  )
}
