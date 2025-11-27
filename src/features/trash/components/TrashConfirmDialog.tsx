'use client'

import { useI18n } from '@/features/i18n/lib/hooks'

import type { ConfirmDialog } from '../hooks/useTrashActions'

interface TrashConfirmDialogProps {
  dialog: ConfirmDialog | null
  onClose: () => void
}

export function TrashConfirmDialog({ dialog, onClose }: TrashConfirmDialogProps) {
  const { t } = useI18n()
  if (!dialog) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="bg-card mx-4 w-full max-w-md rounded-lg p-4">
        <div className="mb-4">
          <h3 className="text-foreground mb-2 text-base font-semibold">{t('trash.actions.confirm')}</h3>
          <p className="text-muted-foreground text-sm">{dialog.message}</p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="text-foreground hover:bg-muted rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
          >
            {t('trash.actions.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.onConfirm()
              onClose()
            }}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              dialog.action === 'restore'
                ? 'bg-primary text-primary-foreground hover:bg-primary/92 active:bg-primary/88'
                : 'bg-destructive text-white hover:bg-destructive/92 active:bg-destructive/88'
            }`}
          >
            {dialog.action === 'restore' ? t('trash.actions.restore') : t('trash.actions.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
