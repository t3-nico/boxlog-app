'use client'

import { createPortal } from 'react-dom'
import { Settings, Copy, Printer, Mail, Download, Trash2 } from 'lucide-react'
import type { CalendarEvent } from '@/types/events'

interface EventActionMenuProps {
  event: CalendarEvent
  isOpen: boolean
  onClose: () => void
  anchorEl: HTMLElement | null
}

export function EventActionMenu({ event, isOpen, onClose, anchorEl }: EventActionMenuProps) {
  if (!isOpen || !anchorEl) return null
  
  const rect = anchorEl.getBoundingClientRect()
  
  const handleEdit = () => {
    console.log('Edit event:', event.title)
    // TODO: 編集機能の実装
    onClose()
  }
  
  const handleCopy = () => {
    console.log('Copy event:', event.title)
    // TODO: 複製機能の実装
    onClose()
  }
  
  const handlePrint = () => {
    console.log('Print event:', event.title)
    // TODO: 印刷機能の実装
    onClose()
  }
  
  const handleEmail = () => {
    console.log('Email event:', event.title)
    // TODO: メール送信機能の実装
    onClose()
  }
  
  const handleExport = () => {
    console.log('Export event:', event.title)
    // TODO: エクスポート機能の実装
    onClose()
  }
  
  const handleDelete = () => {
    if (confirm(`"${event.title}" を削除しますか？`)) {
      console.log('Delete event:', event.title)
      // TODO: 削除機能の実装
    }
    onClose()
  }
  
  return createPortal(
    <>
      {/* 背景クリックで閉じる */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose} 
      />
      
      {/* メニュー本体 */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
        style={{
          top: rect.bottom + 4,
          left: Math.min(rect.left, window.innerWidth - 180), // 画面右端を超えないように調整
        }}
      >
        <button 
          onClick={handleEdit}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
        >
          <Settings className="w-4 h-4" />
          編集
        </button>
        
        <button 
          onClick={handleCopy}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
        >
          <Copy className="w-4 h-4" />
          複製
        </button>
        
        <button 
          onClick={handlePrint}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
        >
          <Printer className="w-4 h-4" />
          印刷
        </button>
        
        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
        
        <button 
          onClick={handleEmail}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
        >
          <Mail className="w-4 h-4" />
          メールで送信
        </button>
        
        <button 
          onClick={handleExport}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
        >
          <Download className="w-4 h-4" />
          エクスポート
        </button>
        
        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
        
        <button 
          onClick={handleDelete}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          削除
        </button>
      </div>
    </>,
    document.body
  )
}