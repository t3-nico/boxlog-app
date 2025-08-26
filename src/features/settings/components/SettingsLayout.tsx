'use client'

import React from 'react'
import { columns } from '@/config/theme/layout'
import { colors, typography, spacing } from '@/config/theme'

interface SettingsLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}

export function SettingsLayout({
  children,
  title,
  description,
  actions
}: SettingsLayoutProps) {
  return (
    <div className={`${columns.main.default} flex flex-col h-full ${colors.background.surface}`}>
      {/* ヘッダー部分 */}
      <div className={`${columns.main.padding.md} pb-4 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={typography.heading.h2}>
              {title}
            </h2>
            {description && (
              <p className={`mt-1 ${typography.body.small} ${colors.text.muted}`}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className={`flex items-center ${spacing.inlineGap.sm}`}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div 
        className={`flex-1 overflow-auto ${columns.main.padding.md} pt-0`}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
          }
          div::-webkit-scrollbar-track {
            background-color: rgb(229 229 229); /* neutral-200 - surface light */
          }
          div::-webkit-scrollbar-thumb {
            background-color: rgb(163 163 163); /* neutral-400 for visibility */
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background-color: rgb(115 115 115); /* neutral-500 */
          }
          @media (prefers-color-scheme: dark) {
            div::-webkit-scrollbar-track {
              background-color: rgb(38 38 38); /* neutral-800 - surface dark */
            }
            div::-webkit-scrollbar-thumb {
              background-color: rgb(115 115 115); /* neutral-500 */
            }
            div::-webkit-scrollbar-thumb:hover {
              background-color: rgb(163 163 163); /* neutral-400 */
            }
          }
        `}</style>
        <div className="max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  )
}