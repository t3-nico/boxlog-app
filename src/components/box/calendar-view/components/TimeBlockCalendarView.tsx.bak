'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { 
  PlusIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { format, startOfDay, addMinutes } from 'date-fns'
import { ja } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { RefinedTimeGrid } from './RefinedTimeGrid'
import { TimeBlockComponent } from './TimeBlock'
import { TimeBlockDropZone, TimeBlockSuggestions, CalendarDropOverlay } from './TimeBlockDropZone'
import { useTimeBlockStore, useBlocksForDate } from '@/stores/useTimeBlockStore'
import { timeBlockTemplates, createBlockFromTemplate } from '../templates/timeBlockTemplates'
import { snapToGrid, calculateBlockPosition } from '../utils/timeBlockHelpers'
import type { TimeBlock, TimeSuggestion } from '../types/timeBlock'
import type { Task } from '../types'

interface TimeBlockCalendarViewProps {
  date: Date
  hourHeight?: number
  showTimeBlocks?: boolean
  onTaskClick?: (task: Task) => void
  onTimeSlotClick?: (date: Date, time: string) => void
  className?: string
}

// テンプレート選択パネル
function TemplateSelectionPanel({ 
  onTemplateSelect, 
  isVisible,
  onClose 
}: {
  onTemplateSelect: (templateId: string, startTime: Date) => void
  isVisible: boolean
  onClose: () => void
}) {
  const [selectedTime, setSelectedTime] = useState<Date>(new Date())
  
  if (!isVisible) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute top-full left-0 right-0 mt-2 z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">テンプレートを選択</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {timeBlockTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onTemplateSelect(template.id, selectedTime)
                onClose()
              }}
              className={cn(
                "p-3 text-left border rounded-lg hover:shadow-md transition-all",
                template.type === 'focus' && "border-purple-200 hover:border-purple-300 bg-purple-50 dark:bg-purple-900/20",
                template.type === 'meeting' && "border-blue-200 hover:border-blue-300 bg-blue-50 dark:bg-blue-900/20",
                template.type === 'break' && "border-green-200 hover:border-green-300 bg-green-50 dark:bg-green-900/20",
                template.type === 'routine' && "border-gray-200 hover:border-gray-300 bg-gray-50 dark:bg-gray-900/20"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {template.icon && <template.icon className="w-4 h-4" />}
                <span className="font-medium text-sm">{template.name}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {template.duration}分
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            開始時間:
          </label>
          <input
            type="time"
            value={format(selectedTime, 'HH:mm')}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':').map(Number)
              const newTime = new Date(selectedTime)
              newTime.setHours(hours, minutes, 0, 0)
              setSelectedTime(newTime)
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </motion.div>
  )
}

export function TimeBlockCalendarView({
  date,
  hourHeight = 60,
  showTimeBlocks = true,
  onTaskClick,
  onTimeSlotClick,
  className
}: TimeBlockCalendarViewProps) {
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [draggedTemplateId, setDraggedTemplateId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedBlockForSuggestion, setSelectedBlockForSuggestion] = useState<TimeBlock | null>(null)
  
  // Store hooks
  const timeBlocks = useBlocksForDate(date)
  const {
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    duplicateTimeBlock,
    addTaskToBlock,
    removeTaskFromBlock,
    moveBlock,
    getSuggestionsForBlock,
    createBlockFromTemplate: createFromTemplate,
    selectBlock,
    selectedBlockId
  } = useTimeBlockStore()
  
  // Smart suggestions
  const suggestions = useMemo(() => {
    if (!selectedBlockForSuggestion) return []
    return getSuggestionsForBlock(selectedBlockForSuggestion, date)
  }, [selectedBlockForSuggestion, getSuggestionsForBlock, date])
  
  // Template creation
  const handleTemplateSelect = useCallback((templateId: string, startTime: Date) => {
    const snappedTime = snapToGrid(startTime, 15)
    createFromTemplate(templateId, snappedTime)
  }, [createFromTemplate])
  
  // Block drag and drop
  const handleBlockDragEnd = useCallback((result: DropResult) => {
    const { draggableId, destination } = result
    
    if (!destination) return
    
    // Handle time slot drops
    if (destination.droppableId.startsWith('timeslot-')) {
      const timeString = destination.droppableId.replace('timeslot-', '')
      const [hours, minutes] = timeString.split('-').map(Number)
      const newStartTime = new Date(date)
      newStartTime.setHours(hours, minutes, 0, 0)
      
      const success = moveBlock(draggableId, newStartTime)
      if (!success) {
        // Show conflict message
        console.warn('Cannot move block due to time conflict')
      }
    }
  }, [date, moveBlock])
  
  // Time slot click handler
  const handleTimeSlotClick = useCallback((clickDate: Date, time: string, x: number, y: number) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(clickDate, time)
    } else {
      // Show template selection for quick block creation
      setShowTemplatePanel(true)
    }
  }, [onTimeSlotClick])
  
  // Block actions
  const handleBlockUpdate = useCallback((block: TimeBlock) => {
    updateTimeBlock(block.id, block)
  }, [updateTimeBlock])
  
  const handleBlockDelete = useCallback((blockId: string) => {
    deleteTimeBlock(blockId)
  }, [deleteTimeBlock])
  
  const handleBlockDuplicate = useCallback((block: TimeBlock) => {
    duplicateTimeBlock(block.id)
  }, [duplicateTimeBlock])
  
  const handleTaskStatusChange = useCallback((taskId: string, status: Task['status']) => {
    // Find which block contains this task
    const blockWithTask = timeBlocks.find(block => 
      block.tasks.some(task => task.id === taskId)
    )
    
    if (blockWithTask) {
      const updatedTasks = blockWithTask.tasks.map(task =>
        task.id === taskId ? { ...task, status } : task
      )
      updateTimeBlock(blockWithTask.id, { tasks: updatedTasks })
    }
  }, [timeBlocks, updateTimeBlock])
  
  // Smart suggestions
  const handleShowSuggestions = useCallback((block: TimeBlock) => {
    setSelectedBlockForSuggestion(block)
    setShowSuggestions(true)
    selectBlock(block.id)
  }, [selectBlock])
  
  const handleSuggestionDrop = useCallback((time: Date) => {
    if (selectedBlockForSuggestion) {
      const success = moveBlock(selectedBlockForSuggestion.id, time)
      if (success) {
        setShowSuggestions(false)
        setSelectedBlockForSuggestion(null)
      }
    }
  }, [selectedBlockForSuggestion, moveBlock])
  
  return (
    <div className={cn("relative h-full", className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(date, 'M月d日(E)', { locale: ja })}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {timeBlocks.length} ブロック
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Smart suggestions toggle */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showSuggestions 
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            title="スマート提案"
          >
            <SparklesIcon className="w-4 h-4" />
          </button>
          
          {/* Template selection */}
          <div className="relative">
            <button
              onClick={() => setShowTemplatePanel(!showTemplatePanel)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">ブロック作成</span>
            </button>
            
            <TemplateSelectionPanel
              isVisible={showTemplatePanel}
              onTemplateSelect={handleTemplateSelect}
              onClose={() => setShowTemplatePanel(false)}
            />
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <DragDropContext onDragEnd={handleBlockDragEnd}>
        <CalendarDropOverlay
          isVisible={draggedTemplateId !== null}
          onDrop={handleSuggestionDrop}
        >
          <RefinedTimeGrid
            dates={[date]}
            hourHeight={hourHeight}
            showCurrentTime={true}
            showBusinessHours={true}
            onTimeSlotClick={handleTimeSlotClick}
            className="h-full"
          >
            {/* Time Blocks Layer */}
            {showTimeBlocks && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative h-full pointer-events-auto">
                  {timeBlocks.map((block) => (
                    <TimeBlockComponent
                      key={block.id}
                      block={block}
                      onUpdate={handleBlockUpdate}
                      onDelete={handleBlockDelete}
                      onDuplicate={handleBlockDuplicate}
                      onTaskStatusChange={handleTaskStatusChange}
                      hourHeight={hourHeight}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Smart Suggestions Layer */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <TimeBlockSuggestions
                    suggestions={suggestions}
                    onDrop={handleSuggestionDrop}
                    hourHeight={hourHeight}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </RefinedTimeGrid>
        </CalendarDropOverlay>
      </DragDropContext>
      
      {/* Block Management Panel */}
      <AnimatePresence>
        {selectedBlockId && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-30 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  ブロック詳細
                </h3>
                <button
                  onClick={() => selectBlock(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  ✕
                </button>
              </div>
              
              {/* Block details and management UI here */}
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const selectedBlock = timeBlocks.find(b => b.id === selectedBlockId)
                    if (selectedBlock) {
                      handleShowSuggestions(selectedBlock)
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">最適な時間を提案</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Standalone component for quick time block creation
export function QuickTimeBlockCreator({ 
  onCreateBlock 
}: { 
  onCreateBlock: (block: Omit<TimeBlock, 'id'>) => void 
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [startTime, setStartTime] = useState(new Date())
  
  const handleCreate = () => {
    if (!selectedTemplate) return
    
    const template = timeBlockTemplates.find(t => t.id === selectedTemplate)
    if (!template) return
    
    const block = createBlockFromTemplate(template, startTime)
    onCreateBlock(block)
  }
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        クイックブロック作成
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            テンプレート
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">選択してください</option>
            {timeBlockTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.duration}分)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            開始時間
          </label>
          <input
            type="datetime-local"
            value={format(startTime, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => setStartTime(new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <button
          onClick={handleCreate}
          disabled={!selectedTemplate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ClockIcon className="w-4 h-4" />
          ブロックを作成
        </button>
      </div>
    </div>
  )
}