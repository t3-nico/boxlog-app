'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { 
  Printer, 
  Download, 
  Upload, 
  Settings, 
  Palette, 
  Trash2, 
  HelpCircle 
} from 'lucide-react'

interface CalendarSettingsMenuProps {
  isOpen: boolean
  onClose: () => void
  anchorEl: HTMLElement | null
  onPrintClick?: () => void
  onTrashClick?: () => void
  trashedCount?: number
}

interface PrintSettingsModalProps {
  onClose: () => void
}

function PrintSettingsModal({ onClose }: PrintSettingsModalProps) {
  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          印刷設定
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              印刷範囲
            </label>
            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>表示中の期間</option>
              <option>今週</option>
              <option>今月</option>
              <option>カスタム期間</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              レイアウト
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" name="layout" value="portrait" className="mr-2" defaultChecked />
                縦向き
              </label>
              <label className="flex items-center">
                <input type="radio" name="layout" value="landscape" className="mr-2" />
                横向き
              </label>
            </div>
          </div>
          
          <div className="flex items-center">
            <input type="checkbox" id="showWeekends" className="mr-2" defaultChecked />
            <label htmlFor="showWeekends" className="text-sm text-gray-700 dark:text-gray-300">
              週末を含める
            </label>
          </div>
          
          <div className="flex items-center">
            <input type="checkbox" id="showColors" className="mr-2" defaultChecked />
            <label htmlFor="showColors" className="text-sm text-gray-700 dark:text-gray-300">
              カラー印刷
            </label>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              // TODO: 実際の印刷処理
              onClose()
            }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            印刷
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

export function CalendarSettingsMenu({ 
  isOpen, 
  onClose, 
  anchorEl, 
  onPrintClick,
  onTrashClick,
  trashedCount = 0
}: CalendarSettingsMenuProps) {
  const [showPrintModal, setShowPrintModal] = useState(false)
  
  if (!isOpen || !anchorEl) {
    return null
  }
  
  const rect = anchorEl.getBoundingClientRect()
  
  const handlePrintClick = () => {
    onClose()
    if (onPrintClick) {
      onPrintClick()
    } else {
      setShowPrintModal(true)
    }
  }
  
  const handleExport = () => {
    // TODO: エクスポート機能の実装
    onClose()
  }
  
  const handleImport = () => {
    // TODO: インポート機能の実装
    onClose()
  }
  
  const handleSettings = () => {
    onClose()
    window.location.href = '/settings'
  }
  
  const handleDisplayOptions = () => {
    onClose()
  }
  
  const handleTrash = () => {
    onClose()
    if (onTrashClick) {
      onTrashClick()
    } else {
      window.location.href = '/settings/trash'
    }
  }
  
  const handleHelp = () => {
    onClose()
  }
  
  return (
    <div 
      className="fixed inset-0 z-[9999]" 
      onClick={onClose}
    >
      <div
        className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]"
        style={{
          top: rect.bottom + 4,
          left: Math.min(rect.left, window.innerWidth - 220),
        }}
        onClick={(e) => e.stopPropagation()}
      >
            <button 
              onClick={handlePrintClick}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Printer className="w-4 h-4" />
              この期間を印刷...
            </button>
            
            <button 
              onClick={handleExport}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Download className="w-4 h-4" />
              カレンダーをエクスポート
            </button>
            
            <button 
              onClick={handleImport}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Upload className="w-4 h-4" />
              インポート
            </button>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            
            <button 
              onClick={handleSettings}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Settings className="w-4 h-4" />
              設定
            </button>
            
            <button 
              onClick={handleDisplayOptions}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Palette className="w-4 h-4" />
              表示オプション
            </button>
            
            <button 
              onClick={handleTrash}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="flex-1">ゴミ箱</span>
              {trashedCount > 0 && (
                <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  {trashedCount}
                </span>
              )}
            </button>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            
            <button 
              onClick={handleHelp}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              ヘルプ
            </button>
      </div>
      
      {showPrintModal && (
        <PrintSettingsModal onClose={() => setShowPrintModal(false)} />
      )}
    </div>
  )
}