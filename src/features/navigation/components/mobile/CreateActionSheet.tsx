'use client'

import { useState } from 'react'

import { Calendar, CheckSquare, FileText } from 'lucide-react'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export type CreateActionType = 'plan' | 'record' | 'template'

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
 *
 * Material Design 3のBottom Sheet / Action Sheetパターンに準拠
 */
export function CreateActionSheet({ open, onOpenChange, onSelect }: CreateActionSheetProps) {
  const t = useTranslations()

  const actions = [
    {
      id: 'plan' as const,
      label: t('create.action.plan'),
      description: t('create.action.planDescription'),
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'record' as const,
      label: t('create.action.record'),
      description: t('create.action.recordDescription'),
      icon: CheckSquare,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      id: 'template' as const,
      label: t('create.action.template'),
      description: t('create.action.templateDescription'),
      icon: FileText,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
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
          <DrawerTitle>{t('create.action.title')}</DrawerTitle>
          <DrawerDescription>{t('create.action.description')}</DrawerDescription>
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

        <DrawerClose asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mx-4 mb-4 rounded-xl py-3 text-center text-sm transition-colors"
          >
            {t('common.cancel')}
          </button>
        </DrawerClose>
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
