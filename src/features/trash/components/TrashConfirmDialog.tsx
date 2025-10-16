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
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-4 dark:bg-neutral-800">
        <div className="mb-4">
          <h3 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {t('trash.actions.confirm')}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{dialog.message}</p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
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
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {dialog.action === 'restore' ? t('trash.actions.restore') : t('trash.actions.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
