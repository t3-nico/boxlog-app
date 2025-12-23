'use client'

import { useState } from 'react'

import { Calendar, CheckSquare, FileText, History } from 'lucide-react'

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export type CreateActionType = 'plan' | 'record' | 'template' | 'history'

interface CreateActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (type: CreateActionType) => void
}

/**
 * FABタップ時に表示する作成アクションシート
 *
 * 選択肢:
 * - Plan: 予定を追加
 * - Record: 実績を記録
 * - Template: テンプレートから追加
 * - History: 履歴から作成（最近使った項目から再作成）
 *
 * Material Design 3のBottom Sheet / Action Sheetパターンに準拠
 */
export function CreateActionSheet({ open, onOpenChange, onSelect }: CreateActionSheetProps) {
  const t = useTranslations()

  const actions = [
    {
      id: 'plan' as const,
      label: t('createSheet.plan'),
      description: t('createSheet.planDescription'),
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary-container',
    },
    {
      id: 'record' as const,
      label: t('createSheet.record'),
      description: t('createSheet.recordDescription'),
      icon: CheckSquare,
      color: 'text-success',
      bgColor: 'bg-success-container',
    },
    {
      id: 'template' as const,
      label: t('createSheet.template'),
      description: t('createSheet.templateDescription'),
      icon: FileText,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      id: 'history' as const,
      label: t('createSheet.history'),
      description: t('createSheet.historyDescription'),
      icon: History,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ]

  const handleSelect = (type: CreateActionType) => {
    onSelect(type)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-safe-area-inset-bottom">
        <DrawerHeader className="text-center">
          <DrawerTitle>{t('createSheet.title')}</DrawerTitle>
          <DrawerDescription>{t('createSheet.description')}</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-2 px-4 pb-6">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleSelect(action.id)}
                className={cn(
                  'flex items-center gap-4 rounded-xl p-4',
                  'bg-card hover:bg-state-hover',
                  'border-border border',
                  'text-left transition-colors',
                  'active:scale-[0.98]'
                )}
              >
                <div className={cn('flex size-12 items-center justify-center rounded-full', action.bgColor)}>
                  <Icon className={cn('size-6', action.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{action.label}</p>
                  <p className="text-muted-foreground text-sm">{action.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/**
 * CreateActionSheetの状態管理用hook
 */
export function useCreateActionSheet() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  }
}
