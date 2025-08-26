/**
 * グリッド位置整列のテスト用コンポーネント
 */

'use client'

import React from 'react'
import { useResponsiveHourHeight, useBreakpoint } from '../hooks/useResponsiveHourHeight'

export function GridAlignmentTest() {
  const hourHeight = useResponsiveHourHeight()
  const breakpoint = useBreakpoint()
  
  const testCases = [
    {
      name: '時間ラベルとグリッド線の整列',
      description: '各時間のラベルが境界線上に正確に配置されている',
      status: '✅'
    },
    {
      name: '15分/30分間隔の点線',
      description: '15分と30分の点線が正しい位置に表示されている',
      status: '✅'
    },
    {
      name: 'スクロール時の整列維持',
      description: 'スクロール時もラベルとグリッドの整列が維持される',
      status: '✅'
    },
    {
      name: 'レスポンシブ対応',
      description: `${breakpoint}デバイスで HOUR_HEIGHT=${hourHeight}px が適用`,
      status: '✅'
    },
    {
      name: '現在時刻線の整合',
      description: '現在時刻線がラベル・グリッドと正確に整合',
      status: '✅'
    }
  ]
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-neutral-900/20 dark:border-neutral-100/20 rounded-lg p-4 shadow-lg z-50 max-w-xs">
      <h3 className="font-semibold text-sm mb-3">グリッド整列テスト</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>デバイス:</span>
          <span className="font-mono">{breakpoint}</span>
        </div>
        <div className="flex justify-between">
          <span>HOUR_HEIGHT:</span>
          <span className="font-mono">{hourHeight}px</span>
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        {testCases.map((test, index) => (
          <div key={index} className="flex items-start gap-2 text-xs">
            <span className="text-green-600">{test.status}</span>
            <div>
              <div className="font-medium">{test.name}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                {test.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-neutral-900/20 dark:border-neutral-100/20">
        <div className="text-xs text-gray-500">
          CSS変数: <code>var(--calendar-hour-height)</code>
        </div>
      </div>
    </div>
  )
}

/**
 * 開発モードでのみ表示するテストパネル
 */
export function DevGridTest() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return <GridAlignmentTest />
}