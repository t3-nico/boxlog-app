'use client'

import React from 'react'

interface SettingsLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}

export const SettingsLayout = ({ children, title, description, actions }: SettingsLayoutProps) => {
  return (
    <div className="flex h-full flex-1 flex-col">
      {/* ヘッダー部分 */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h2>
            {description != null && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
            )}
          </div>
          {actions != null && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto px-6 pt-0">
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
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}
