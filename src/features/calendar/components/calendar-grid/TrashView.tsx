'use client'

import { useState, useMemo } from 'react'
import { 
  Trash2, 
  RotateCcw, 
  X, 
  Info,
  Calendar,
  Clock
} from 'lucide-react'
import type { CalendarEvent } from '@/types/events'

interface TrashViewProps {
  onClose: () => void
  trashedEvents: CalendarEvent[]
  onRestore: (eventId: string) => void
  onDeletePermanently: (eventIds: string[]) => void
  isModal?: boolean // モーダル表示かページ表示かを制御
}

export function TrashView({ 
  onClose, 
  trashedEvents, 
  onRestore, 
  onDeletePermanently,
  isModal = true
}: TrashViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  const getDaysRemaining = (deletedAt: Date) => {
    const now = new Date()
    const deleted = new Date(deletedAt)
    const daysElapsed = Math.floor((now.getTime() - deleted.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, 30 - daysElapsed)
  }
  
  const sortedEvents = useMemo(() => {
    return trashedEvents
      .filter(event => event.isDeleted && event.deletedAt)
      .sort((a, b) => {
        const aDays = getDaysRemaining(a.deletedAt!)
        const bDays = getDaysRemaining(b.deletedAt!)
        return aDays - bDays // 完全削除が近い順
      })
  }, [trashedEvents])
  
  const handleRestoreSelected = () => {
    selectedIds.forEach(id => onRestore(id))
    setSelectedIds(new Set())
  }
  
  const handleDeletePermanentlySelected = () => {
    const eventIds = Array.from(selectedIds)
    if (confirm(`${eventIds.length}件の予定を完全に削除しますか？この操作は取り消せません。`)) {
      onDeletePermanently(eventIds)
      setSelectedIds(new Set())
    }
  }
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedEvents.map(e => e.id)))
    } else {
      setSelectedIds(new Set())
    }
  }
  
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const containerClasses = isModal 
    ? "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    : "w-full h-full"
  
  const contentClasses = isModal
    ? "bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl max-h-[80vh] flex flex-col shadow-xl"
    : "bg-white dark:bg-gray-800 w-full h-full flex flex-col"

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <Trash2 className="w-5 h-5" />
            ゴミ箱
          </h2>
          {isModal && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
        
        {/* ツールバー */}
        {sortedEvents.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.size === sortedEvents.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">すべて選択</span>
            </label>
            
            <div className="flex-1" />
            
            <button 
              onClick={handleRestoreSelected}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              復元 ({selectedIds.size})
            </button>
            
            <button 
              onClick={handleDeletePermanentlySelected}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              完全に削除 ({selectedIds.size})
            </button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {sortedEvents.length}件のアイテム
            </div>
          </div>
        )}
        
        {/* リスト */}
        <div className="flex-1 overflow-y-auto">
          {sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <Trash2 className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">ゴミ箱は空です</h3>
              <p className="text-sm text-center">
                削除した予定は30日間ここに保存されます
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {sortedEvents.map(event => {
                const daysRemaining = getDaysRemaining(event.deletedAt!)
                const isUrgent = daysRemaining <= 7
                
                return (
                  <div 
                    key={event.id}
                    className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(event.id)}
                      onChange={(e) => {
                        const newSet = new Set(selectedIds)
                        if (e.target.checked) {
                          newSet.add(event.id)
                        } else {
                          newSet.delete(event.id)
                        }
                        setSelectedIds(newSet)
                      }}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {event.title}
                        </div>
                        {event.priority && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            event.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            event.priority === 'important' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {event.priority}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {event.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(event.startDate)}
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="truncate">
                            📍 {event.location}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        削除日時: {event.deletedAt ? formatDateTime(event.deletedAt) : '不明'}
                      </div>
                    </div>
                    
                    <div className="text-sm text-right">
                      {daysRemaining <= 0 ? (
                        <span className="text-red-600 font-medium">
                          期限切れ
                        </span>
                      ) : isUrgent ? (
                        <span className="text-orange-500 font-medium">
                          あと{daysRemaining}日で完全削除
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          あと{daysRemaining}日
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onRestore(event.id)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="復元"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* フッター */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4" />
            削除したアイテムは30日後に完全に削除されます
          </div>
        </div>
      </div>
    </div>
  )
}