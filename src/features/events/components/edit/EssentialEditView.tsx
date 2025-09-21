'use client'

import React from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import { semantic, colors } from '@/config/theme/colors'
import { rounded } from '@/config/theme/rounded'
import { body } from '@/config/theme/typography'

import { DateSelector } from '../create/DateSelector'
import { TagInput } from '../create/TagInput'
import { TitleInput } from '../create/TitleInput'

import { EditFooter } from './components/EditFooter'
import { EditHeader } from './components/EditHeader'
import { EditOptions } from './components/EditOptions'
import { EditSuccessAnimation } from './components/EditSuccessAnimation'
import { useEssentialEditView } from './hooks/useEssentialEditView'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialEditViewProps {
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

export const EssentialEditView = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData
}: EssentialEditViewProps) => {

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
    handleSmartExtract,
    handleDelete
  } = useEssentialEditView({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialData
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen === true && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* メインカード */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`
              relative w-full max-w-2xl mx-4
              ${colors.background.base} ${rounded.modal}
              shadow-2xl
            `}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* ヘッダー */}
            <EditHeader
              title={title}
              date={date}
              tags={tags}
              onClose={onClose}
            />

            {/* メインコンテンツ */}
            <div className="px-8 pb-8 space-y-6">
              {/* Title input */}
              <div>
                <TitleInput
                  value={title}
                  onChange={setTitle}
                  onSmartExtract={handleSmartExtract}
                />
              </div>

              {/* 日付セクション */}
              <div>
                <DateSelector
                  value={date}
                  endValue={endDate}
                  onChange={setDate}
                  onEndChange={setEndDate}
                />
              </div>

              {/* Tags section */}
              <div className="pt-2">
                <TagInput
                  selectedTags={tags}
                  onChange={setTags}
                  contextualSuggestions={title.split(' ')}
                />
              </div>

              {/* 追加オプション */}
              <EditOptions
                title={title}
                date={date}
                tags={tags}
                showMemo={showMemo}
                memo={memo}
                onToggleMemo={() => setShowMemo(!showMemo)}
                onMemoChange={setMemo}
              />

              {/* エラー表示 */}
              <AnimatePresence>
                {error != null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`
                      p-4 rounded-lg
                      ${semantic.error.background} ${semantic.error.text}
                      flex items-center gap-3
                    `}
                  >
                    <div className="flex-shrink-0">⚠️</div>
                    <div>
                      <div className={`${body.small} font-medium`}>An error occurred</div>
                      <div className={`${body.small} opacity-90`}>{error}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* フッター */}
              <EditFooter
                isValid={isValid}
                isSubmitting={isSubmitting}
                onClose={onClose}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>

            {/* 成功アニメーション */}
            <EditSuccessAnimation
              showSuccess={showSuccess}
              title={title}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}