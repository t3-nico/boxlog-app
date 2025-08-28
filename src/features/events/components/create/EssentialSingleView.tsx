'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Check, FileText, Bell, Flag, MoreHorizontal, Repeat, ChevronDown, Calendar, Clock, Zap, Trash2 } from 'lucide-react'
import { TitleInput } from './TitleInput'
import { DateSelector } from './DateSelector'
import { TagInput } from './TagInput'
import { background, text, primary, semantic } from '@/config/theme/colors'
import { body, heading } from '@/config/theme/typography'
import { rounded } from '@/config/theme/rounded'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface EssentialSingleViewProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    date?: Date
    endDate?: Date
    tags: Tag[]
    description?: string
    estimatedDuration?: number // 分
    priority?: 'low' | 'medium' | 'high'
    status?: 'backlog' | 'scheduled'
  }) => Promise<void>
  onDelete?: () => Promise<void>
  isEditMode?: boolean
  initialData?: {
    title?: string
    date?: Date
    endDate?: Date
    tags?: Tag[]
    description?: string
    estimatedDuration?: number
    priority?: 'low' | 'medium' | 'high'
  }
}

export function EssentialSingleView({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  isEditMode = false,
  initialData 
}: EssentialSingleViewProps) {
  
  // 2択式シンプルモード（最速入力と詳細予定のみ）
  type ScheduleMode = 'defer' | 'schedule' // 後で決める | 今すぐ予定する
  
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(() => {
    // 初期データがある場合（編集モード）は適切なモードを選択
    if (initialData?.date) {
      // 時刻情報があるか、日付情報があれば予定モード
      return 'schedule'
    }
    
    // 新規作成の場合はlocalStorageから前回の選択を復元
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boxlog-create-mode')
      if (saved && ['defer', 'schedule'].includes(saved)) {
        return saved as ScheduleMode
      }
    }
    
    return 'defer' // デフォルトは「後で決める」
  })

  // メインフィールドの状態
  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(() => {
    if (initialData?.date) return initialData.date
    // scheduleMode が 'specify' の場合のみ時刻を設定
    if (scheduleMode === 'specify') {
      // 現在時刻から15分単位で切り上げ
      const now = new Date()
      const minutes = now.getMinutes()
      let roundedMinutes
      
      if (minutes === 0) {
        roundedMinutes = 0
      } else if (minutes <= 15) {
        roundedMinutes = 15
      } else if (minutes <= 30) {
        roundedMinutes = 30
      } else if (minutes <= 45) {
        roundedMinutes = 45
      } else {
        roundedMinutes = 60
      }
      
      if (roundedMinutes === 60) {
        now.setHours(now.getHours() + 1)
        now.setMinutes(0, 0, 0)
      } else {
        now.setMinutes(roundedMinutes, 0, 0)
      }
      return now
    }
    return new Date() // フォールバック
  })
  const [endDate, setEndDate] = useState(() => {
    // endDateが直接指定されている場合はそれを使用
    if (initialData?.endDate) {
      return initialData.endDate
    }
    
    let startTime
    if (initialData?.date) {
      startTime = new Date(initialData.date)
    } else {
      // 現在時刻から15分単位で切り上げ
      const now = new Date()
      const minutes = now.getMinutes()
      let roundedMinutes
      
      if (minutes === 0) {
        roundedMinutes = 0
      } else if (minutes <= 15) {
        roundedMinutes = 15
      } else if (minutes <= 30) {
        roundedMinutes = 30
      } else if (minutes <= 45) {
        roundedMinutes = 45
      } else {
        roundedMinutes = 60
      }
      
      if (roundedMinutes === 60) {
        now.setHours(now.getHours() + 1)
        now.setMinutes(0, 0, 0)
      } else {
        now.setMinutes(roundedMinutes, 0, 0)
      }
      startTime = now
    }
    const defaultEnd = new Date(startTime)
    defaultEnd.setTime(defaultEnd.getTime() + 60 * 60 * 1000) // 1時間後
    return defaultEnd
  })
  const [tags, setTags] = useState<Tag[]>(initialData?.tags || [])
  
  // 新しいフィールド（プログレッシブ開示用）
  const [estimatedDuration, setEstimatedDuration] = useState<number>(initialData?.estimatedDuration || 30) // デフォルト30分
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium')

  // 前回のinitialDataを保存するRef
  const prevInitialDataRef = useRef<typeof initialData | null>(null)
  
  // モーダルが開かれた時、またはinitialDataが実際に変更された時のみ更新
  useEffect(() => {
    if (isOpen && initialData) {
      // 前回と同じ値かチェック（深い比較ではなく、キー値の比較）
      const prev = prevInitialDataRef.current
      const hasChanged = !prev || 
        prev.title !== initialData.title ||
        prev.date?.getTime() !== initialData.date?.getTime() ||
        prev.endDate?.getTime() !== initialData.endDate?.getTime()
      
      if (hasChanged) {
        
        if (initialData.title !== undefined) {
          setTitle(initialData.title)
        }
        if (initialData.date) {
          setDate(initialData.date)
        }
        if (initialData.endDate) {
          setEndDate(initialData.endDate)
        } else if (initialData.date) {
          // endDateが指定されていない場合は開始時刻の1時間後
          const newEndDate = new Date(initialData.date)
          newEndDate.setTime(newEndDate.getTime() + 60 * 60 * 1000)
          setEndDate(newEndDate)
        }
        if (initialData.tags) {
          setTags(initialData.tags)
        }
        if (initialData.description) {
          setMemo(initialData.description)
          setShowMemo(true)
        }
        if (initialData.estimatedDuration) {
          setEstimatedDuration(initialData.estimatedDuration)
        }
        if (initialData.priority) {
          setTaskPriority(initialData.priority)
        }
        
        // 編集モードでのスケジュールモード更新（2択式）
        if (initialData.date) {
          setScheduleMode('schedule') // 日付があれば予定モード
        } else {
          setScheduleMode('defer') // 日付がなければ後で決めるモード
        }
        
        // 現在の値を保存
        prevInitialDataRef.current = initialData
      }
    }
  }, [isOpen, initialData])
  
  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [fastInputMode, setFastInputMode] = useState(false) // 高速入力モード
  
  // 追加オプション状態
  const [showMemo, setShowMemo] = useState(false)
  const [memo, setMemo] = useState('')
  const [reminder, setReminder] = useState<number | null>(null)
  const [priority, setPriority] = useState<'low' | 'necessary' | 'high'>('necessary')
  
  // 2択モードの変更ハンドラー（シンプル化）
  const handleScheduleModeChange = (newMode: ScheduleMode) => {
    setScheduleMode(newMode)
    // 新規作成の場合のみlocalStorageに保存（編集時は保存しない）
    if (!initialData && typeof window !== 'undefined') {
      localStorage.setItem('boxlog-create-mode', newMode)
    }
    
    // モード変更時の日付設定
    if (newMode === 'schedule') {
      // 今すぐ予定するモード: 現在時刻から15分単位で切り上げ
      const now = new Date()
      const minutes = now.getMinutes()
      let roundedMinutes
      
      if (minutes === 0) {
        roundedMinutes = 0
      } else if (minutes <= 15) {
        roundedMinutes = 15
      } else if (minutes <= 30) {
        roundedMinutes = 30
      } else if (minutes <= 45) {
        roundedMinutes = 45
      } else {
        roundedMinutes = 60
      }
      
      if (roundedMinutes === 60) {
        now.setHours(now.getHours() + 1)
        now.setMinutes(0, 0, 0)
      } else {
        now.setMinutes(roundedMinutes, 0, 0)
      }
      setDate(now)
      
      const defaultEnd = new Date(now)
      defaultEnd.setTime(defaultEnd.getTime() + 60 * 60 * 1000) // 1時間後
      setEndDate(defaultEnd)
    }
    // 'defer'モードの場合は何もしない（時刻情報は保存時にnullになる）
  }
  
  // 入力データの検証
  const isValid = title.trim().length > 0

  // プログレス計算
  const getProgress = () => {
    let progress = 0
    if (title.trim().length > 0) progress += 33.33  // タイトル入力済み
    if (date) progress += 33.33  // 日付設定済み
    if (tags.length > 0) progress += 33.34  // タグ選択済み
    return Math.min(progress, 100)
  }

  // タグの色生成
  const generateTagColor = (name: string): string => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', 
      '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1'
    ]
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  // モーダルキャンセル時の処理（ドラッグ選択をクリア）
  const handleCancel = () => {
    // カスタムイベントを発行してドラッグ選択状態をクリア
    window.dispatchEvent(new CustomEvent('calendar-drag-cancel'))
    onClose()
  }

  // 保存処理
  const handleSave = useCallback(async () => {
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      // 2択モードに応じてデータを整形
      let saveData: any = {
        title,
        tags,
        description: memo || undefined
      }
      
      if (scheduleMode === 'schedule') {
        // 今すぐ予定するモード
        saveData.date = date
        saveData.endDate = endDate
        saveData.status = 'scheduled'
      } else {
        // 後で決めるモード
        saveData.date = null
        saveData.endDate = null
        saveData.estimatedDuration = estimatedDuration
        saveData.priority = taskPriority
        saveData.status = 'backlog'
      }
      
      await onSave(saveData)
      
      // 高速入力モードの判定（後で決める + Cmd+Enter）
      const isQuickInput = scheduleMode === 'defer' && !isEditMode
      
      if (isQuickInput && fastInputMode) {
        // 高速入力モード: モーダルを閉じずにフォームをリセット
        setTitle('')
        setTags([])
        setMemo('')
        setShowMemo(false)
        setEstimatedDuration(30)
        setTaskPriority('medium')
        
        // タイトルフィールドにフォーカスを戻す
        setTimeout(() => {
          const titleInput = document.querySelector('input[placeholder*="イベント"], input[placeholder*="title"]') as HTMLInputElement
          if (titleInput) {
            titleInput.focus()
          }
        }, 100)
      } else {
        // 通常モード: 成功アニメーションしてモーダルを閉じる
        setShowSuccess(true)
        setTimeout(() => {
          onClose()
          setShowSuccess(false)
          // リセット
          setTitle('')
          setDate(new Date())
          setTags([])
          setFastInputMode(false)
        }, 1500)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSubmitting(false)
    }
  }, [isValid, onSave, title, date, endDate, tags, onClose, scheduleMode, estimatedDuration, taskPriority, memo])

  // キーボードショートカット（2択式対応）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        handleCancel()
        return
      }

      // Cmd+Enter で高速入力モードを有効化
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (isValid) {
          e.preventDefault()
          if (scheduleMode === 'defer' && !isEditMode) {
            setFastInputMode(true)
          }
          handleSave()
        }
        return
      }
      
      // Enter で通常保存（後で決めるモードのみ）
      if (e.key === 'Enter' && scheduleMode === 'defer') {
        if (isValid) {
          e.preventDefault()
          handleSave()
        }
        return
      }

      // 数字キーでモード切り替え
      if (e.key === '1') {
        e.preventDefault()
        handleScheduleModeChange('defer')
        return
      }
      
      if (e.key === '2') {
        e.preventDefault()
        handleScheduleModeChange('schedule')
        return
      }

      // Tabキーでモード切り替え（タイトル入力時以外）
      if (e.key === 'Tab' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        const newMode = scheduleMode === 'defer' ? 'schedule' : 'defer'
        handleScheduleModeChange(newMode)
        return
      }

      // Spaceキーでモード切り替え（入力フィールド以外）
      if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        const newMode = scheduleMode === 'defer' ? 'schedule' : 'defer'
        handleScheduleModeChange(newMode)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isValid, handleCancel, handleSave, scheduleMode, handleScheduleModeChange])

  // スマート抽出のハンドリング
  const handleSmartExtract = (extracted: {
    title: string
    date?: Date
    tags: string[]
  }) => {
    setTitle(extracted.title)
    if (extracted.date) {
      setDate(extracted.date)
    }
    // 抽出されたタグを既存タグに追加
    const newTags = extracted.tags
      .filter(tagName => !tags.some(tag => tag.name === tagName))
      .map(tagName => ({
        id: Date.now().toString() + Math.random(),
        name: tagName,
        color: generateTagColor(tagName)
      }))
    if (newTags.length > 0) {
      setTags(prev => [...prev, ...newTags])
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* メインカード */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`
              relative w-full max-w-2xl mx-4
              ${background.base} ${rounded.modal}
              shadow-2xl
            `}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* ヘッダー */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.h1 
                    className={`${heading.h4} ${text.primary}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {isEditMode ? 'Edit Event' : fastInputMode ? 'Quick Add Mode' : 'Create Event'}
                  </motion.h1>
                  
                  {/* 高速入力モード表示 */}
                  {fastInputMode && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-3 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium rounded-full"
                    >
                      Fast Mode
                    </motion.div>
                  )}
                  
                  {/* 控えめなプログレス指標 */}
                  <div className="flex items-center gap-4">
                    {/* タイトル指標 */}
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          transition-all duration-300
                          ${title.trim() 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                          }
                        `}
                        animate={title.trim() ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {title.trim() ? '✓' : '1'}
                      </motion.div>
                      <span className={`text-xs ${title.trim() ? text.primary : text.muted}`}>
                        Title
                      </span>
                    </div>
                    
                    {/* 日付指標 */}
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          transition-all duration-300
                          ${date 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                          }
                        `}
                        animate={date ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {date ? '✓' : '2'}
                      </motion.div>
                      <span className={`text-xs ${date ? text.primary : text.muted}`}>
                        DateTime
                      </span>
                    </div>
                    
                    {/* タグ指標 */}
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                          transition-all duration-300
                          ${tags.length > 0 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                          }
                        `}
                        animate={tags.length > 0 ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {tags.length > 0 ? '✓' : '3'}
                      </motion.div>
                      <span className={`text-xs ${tags.length > 0 ? text.primary : text.muted}`}>
                        Tags
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCancel}
                  className={`
                    p-2 rounded-lg transition-colors duration-200
                    hover:${background.surface} ${text.secondary}
                  `}
                >
                  <X size={20} />
                </button>
              </div>

            </div>

            {/* メインコンテンツ */}
            <div className="px-8 pb-8 space-y-6">
              {/* Title input */}
              <div>
                <TitleInput
                  value={title}
                  onChange={setTitle}
                  onSmartExtract={handleSmartExtract}
                  autoFocus={true}
                />
              </div>
              
              {/* 2択式スケジュール選択セクション */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${text.primary} mb-3`}>
                    いつ実行しますか？
                  </label>
                  
                  {/* ラジオボタン選択グループ */}
                  <div className="flex gap-4">
                    {/* 後で決める選択肢 */}
                    <label 
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                        border-2 ${scheduleMode === 'defer' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="scheduleMode"
                        value="defer"
                        checked={scheduleMode === 'defer'}
                        onChange={(e) => handleScheduleModeChange(e.target.value as ScheduleMode)}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${scheduleMode === 'defer' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-neutral-300 dark:border-neutral-600'
                        }
                      `}>
                        {scheduleMode === 'defer' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${text.primary}`}>
                          後で決める
                        </div>
                      </div>
                    </label>
                    
                    {/* 今すぐ予定する選択肢 */}
                    <label 
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                        border-2 ${scheduleMode === 'schedule' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="scheduleMode"
                        value="schedule"
                        checked={scheduleMode === 'schedule'}
                        onChange={(e) => handleScheduleModeChange(e.target.value as ScheduleMode)}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${scheduleMode === 'schedule' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-neutral-300 dark:border-neutral-600'
                        }
                      `}>
                        {scheduleMode === 'schedule' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${text.primary}`}>
                          今すぐ予定する
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* プログレッシブ開示: 今すぐ予定するモードのみ日時フィールドを表示 */}
                <AnimatePresence>
                  {scheduleMode === 'schedule' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-4 border-t border-neutral-200 dark:border-neutral-700"
                    >
                      <DateSelector
                        value={date}
                        endValue={endDate}
                        onChange={setDate}
                        onEndChange={setEndDate}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>

              {/* 日付セクションはスケジュール選択に統合 */}

              {/* Tags section */}
              <div className="pt-2">
                <TagInput
                  selectedTags={tags}
                  onChange={setTags}
                  contextualSuggestions={title.split(' ')}
                />
              </div>

              {/* 区切り線と追加オプション */}
              {(title.trim() || date || tags.length > 0) && (
                <div className="pt-4">
                  
                  {/* 追加オプション */}
                  <div className="flex items-center gap-4">
                    {/* 重要3つ */}
                    <div className="flex items-center gap-3">
                      {/* メモ追加 */}
                      <button
                        onClick={() => setShowMemo(!showMemo)}
                        className={`
                          p-3 rounded-lg transition-all duration-200 flex items-center gap-2
                          ${showMemo || memo 
                            ? `${primary.DEFAULT} text-white` 
                            : `${background.surface} ${text.secondary} hover:${background.elevated}`
                          }
                        `}
                        title="Add memo"
                      >
                        <FileText size={18} />
                      </button>

                      {/* リマインダー設定 */}
                      <button
                        className={`
                          p-3 rounded-lg transition-all duration-200
                          ${reminder 
                            ? `${primary.DEFAULT} text-white` 
                            : `${background.surface} ${text.secondary} hover:${background.elevated}`
                          }
                        `}
                        title="Set reminder"
                      >
                        <Bell size={18} />
                      </button>

                      {/* リピート設定 */}
                      <button
                        className={`
                          p-3 rounded-lg transition-all duration-200
                          ${background.surface} ${text.secondary} hover:${background.elevated}
                        `}
                        title="Set repeat"
                      >
                        <Repeat size={18} />
                      </button>
                    </div>

                    {/* その他すべて */}
                    <button
                      className={`
                        p-3 rounded-lg transition-all duration-200
                        ${background.surface} ${text.secondary} hover:${background.elevated}
                      `}
                      title="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* メモ入力欄 */}
                  <AnimatePresence>
                    {showMemo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <textarea
                          value={memo}
                          onChange={(e) => setMemo(e.target.value)}
                          placeholder="Enter memo or comments..."
                          className={`
                            w-full p-3 ${background.surface} ${text.primary}
                            border border-neutral-200 dark:border-neutral-700
                            rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
                          `}
                          rows={3}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* エラー表示 */}
              <AnimatePresence>
                {error && (
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
              <div className={`flex items-center pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800 ${isEditMode ? 'justify-between' : 'justify-end'}`}>
                {/* 編集モードのみ削除ボタンを左端に表示 */}
                {isEditMode && onDelete && (
                  <motion.button
                    onClick={async () => {
                      if (window.confirm('この予定を削除しますか？')) {
                        try {
                          await onDelete()
                          onClose()
                        } catch (error) {
                          setError(error instanceof Error ? error.message : '削除に失敗しました')
                        }
                      }
                    }}
                    className={`
                      px-4 py-3 rounded-lg font-medium flex items-center gap-2
                      ${semantic.error.background} ${semantic.error.text}
                      hover:opacity-80 transition-all duration-200
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 size={18} />
                    Delete
                  </motion.button>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className={`
                      px-6 py-3 rounded-lg font-medium
                      ${background.surface} ${text.secondary}
                      hover:${background.elevated} transition-all duration-200
                      border border-neutral-200 dark:border-neutral-700
                    `}
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!isValid || isSubmitting}
                    className={`
                      px-8 py-3 rounded-lg font-semibold flex items-center gap-2
                      transition-all duration-200
                      ${isValid && !isSubmitting
                        ? `${primary.DEFAULT} text-white hover:opacity-90 shadow-lg hover:shadow-xl`
                        : `${background.surface} ${text.muted} cursor-not-allowed`
                      }
                    `}
                    whileHover={isValid && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={isValid && !isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <span>{isEditMode ? 'Update' : 'Create'}</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* 成功アニメーション */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 rounded-2xl"
                >
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <Check size={24} className="text-white" />
                    </motion.div>
                    <motion.h2
                      className={`${heading.h4} ${text.primary} mb-2`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Created!
                    </motion.h2>
                    <motion.p
                      className={`${body.DEFAULT} ${text.secondary}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {title}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}