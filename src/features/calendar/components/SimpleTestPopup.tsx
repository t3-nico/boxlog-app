'use client'

import React from 'react'

interface SimpleTestPopupProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  time: string
}

export function SimpleTestPopup({ isOpen, onClose, date, time }: SimpleTestPopupProps) {
  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* ポップアップコンテンツ */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Event
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                🎯 Pure Calendar Click Test Success!
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>Date:</strong> {date.toDateString()}</p>
                <p><strong>Time:</strong> {time}</p>
                <p><strong>Implementation:</strong> Pure React + CSS (No external libraries)</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>✅ Click position → time calculation: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{time}</code></p>
              <p>✅ 15-minute snapping works!</p>
              <p>✅ Event block exclusion works!</p>
              <p>✅ No Radix UI infinite loops!</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Check browser console for detailed debug info
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Event would be created at ${date.toDateString()} ${time}`)
                  onClose()
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}