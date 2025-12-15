'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AlertDialogConfirmProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string | undefined
  cancelText?: string | undefined
  isLoading?: boolean | undefined
  className?: string | undefined
  variant?: 'default' | 'destructive'
}

/**
 * 汎用確認ダイアログ
 *
 * shadcn/ui AlertDialogをベースにした共通コンポーネント
 * プラン削除、タグ削除など、確認が必要な操作で使用
 */
export function AlertDialogConfirm({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'OK',
  cancelText = 'Cancel',
  isLoading = false,
  className,
  variant = 'default',
}: AlertDialogConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
