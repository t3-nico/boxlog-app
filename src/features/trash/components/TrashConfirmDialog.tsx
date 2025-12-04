'use client'

import { useTranslations } from 'next-intl'

import type { ConfirmDialog } from '../hooks/useTrashActions'

interface TrashConfirmDialogProps {
  dialog: ConfirmDialog | null
  onClose: () => void
}

export function TrashConfirmDialog({ dialog, onClose }: TrashConfirmDialogProps) {
  const t = useTranslations()
  if (!dialog) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="bg-card mx-4 w-full max-w-md rounded-xl p-4">
        <div className="mb-4">
          <h3 className="text-foreground mb-2 text-base font-semibold">{t('trash.actions.confirm')}</h3>
          <p className="text-muted-foreground text-sm">{dialog.message}</p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="text-foreground hover:bg-foreground/8 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200"
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
                ? 'bg-primary text-primary-foreground hover:bg-primary/92'
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/92'
            }`}
          >
            {dialog.action === 'restore' ? t('trash.actions.restore') : t('trash.actions.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
