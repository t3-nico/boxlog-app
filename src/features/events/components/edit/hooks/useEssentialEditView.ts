'use client'

import React from 'react'

import { useEssentialEditForm } from './useEssentialEditForm'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface UseEssentialEditViewProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    date?: Date
    endDate?: Date
    tags: Tag[]
    description?: string
    estimatedDuration?: number
    priority?: 'low' | 'medium' | 'high'
    status?: 'backlog' | 'scheduled'
  }) => Promise<void>
  onDelete?: () => Promise<void>
  initialData: {
    title: string
    date?: Date
    endDate?: Date
    tags: Tag[]
    description?: string
    estimatedDuration?: number
    priority?: 'low' | 'medium' | 'high'
  }
}

export const useEssentialEditView = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData
}: UseEssentialEditViewProps) => {

  // カスタムフックで状態管理とロジックを抽出
  const {
    title,
    date,
    endDate,
    tags,
    isSubmitting,
    error,
    showSuccess,
    showMemo,
    memo,
    isValid,
    setTitle,
    setDate,
    setEndDate,
    setTags,
    setShowMemo,
    setMemo,
    handleSave,
    handleSmartExtract
  } = useEssentialEditForm({
    initialData,
    isOpen,
    onSave,
    onClose
  })

  // 削除処理
  const handleDelete = React.useCallback(async () => {
    if (onDelete) {
      try {
        await onDelete()
        onClose()
      } catch (err) {
        console.error('Failed to delete:', err)
      }
    }
  }, [onDelete, onClose])

  // キーボードショートカット（ESC対応）
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid) {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isValid, onClose, handleSave])

  return {
    // State
    title,
    date,
    endDate,
    tags,
    isSubmitting,
    error,
    showSuccess,
    showMemo,
    memo,
    isValid,

    // Actions
    setTitle,
    setDate,
    setEndDate,
    setTags,
    setShowMemo,
    setMemo,
    handleSave,
    handleSmartExtract,
    handleDelete
  }
}