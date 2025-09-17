'use client'

import React from 'react'

import { colors, rounded, spacing, typography } from '@/config/theme'

import type { ConfirmDialog } from '../hooks/useTrashActions'

interface TrashConfirmDialogProps {
  dialog: ConfirmDialog | null
  onClose: () => void
}

export const TrashConfirmDialog: React.FC<TrashConfirmDialogProps> = ({
  dialog,
  onClose
}) => {
  if (!dialog) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${colors.background.surface} ${rounded.lg} ${spacing.cardVariants.default} max-w-md w-full mx-4`}>
        <div className="mb-4">
          <h3 className={`${typography.heading.h6} ${colors.text.primary} mb-2`}>
            確認
          </h3>
          <p className={`${typography.body.default} ${colors.text.muted}`}>
            {dialog.message}
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className={`
              ${colors.ghost.DEFAULT} ${colors.ghost.hover}
              ${spacing.button.variants.default} ${typography.body.small}
              font-medium transition-colors duration-200
            `}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.onConfirm()
              onClose()
            }}
            className={`
              ${dialog.action === 'restore' ? colors.primary.surface : colors.semantic.error.surface}
              ${dialog.action === 'restore' ? colors.primary.text : colors.semantic.error.text}
              ${spacing.button.variants.default} ${typography.body.small}
              font-medium transition-colors duration-200
            `}
          >
            {dialog.action === 'restore' ? '復元' : '削除'}
          </button>
        </div>
      </div>
    </div>
  )
}