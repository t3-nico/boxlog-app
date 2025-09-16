import React, { useEffect } from 'react'

import { colors, icons, rounded, typography } from '@/config/theme'

import { useTrashStore } from '../stores/useTrashStore'

import { TrashActions } from './TrashActions'
import { TrashTable } from './TrashTable'

interface TrashViewProps {
  className?: string
}

export const TrashView: React.FC<TrashViewProps> = ({ className }) => {
  const { loading, error, filters, setFilters, fetchItems, getFilteredItems, getStats, clearError } = useTrashStore()

  const filteredItems = getFilteredItems()
  const stats = getStats()

  // 初期データの読み込み
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // エラーの自動クリア（10秒後）
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  return (
    <div className={`min-h-screen ${colors.background.base} ${className}`}>
      <div className="${spacing.stackGap.lg} mx-auto max-w-7xl p-6">
        {/* ヘッダー */}
        <div className="${colors.background.surface} ${rounded.lg} ${spacing.cardVariants.comfortable} border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="${typography.heading.h2} ${colors.text.primary} flex items-center">
                <span className="mr-3 text-3xl">🗑️</span>
                ゴミ箱
              </h1>
              <p className="${colors.text.muted} mt-2">
                削除されたアイテムを管理します。アイテムは30日後に自動削除されます。
              </p>
            </div>

            {/* リフレッシュボタン */}
            <button
              type="button"
              onClick={() => fetchItems()}
              disabled={loading}
              className={`${icons.patterns.button.withTextLeft} px-4 py-2 ${typography.body.small} ${colors.button.outline} ${colors.state.disabled.opacity}`}
            >
              {loading ? (
                <>
                  <svg
                    className={`${icons.animation.spin} ${icons.size.sm} ${colors.text.muted}`}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  読み込み中...
                </>
              ) : (
                <>
                  <svg className={icons.size.sm} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  更新
                </>
              )}
            </button>
          </div>

          {/* 統計情報 */}
          <div className="${spacing.gridGap.default} mt-6 grid grid-cols-2 md:grid-cols-4">
            <div className="${colors.background.elevated} ${spacing.cardVariants.default} ${rounded.md}">
              <div className="${typography.heading.h3} ${colors.text.primary}">{stats.totalItems}</div>
              <div className="${typography.body.small} ${colors.text.muted}">総アイテム数</div>
            </div>

            <div className="${colors.semantic.info.light} ${spacing.cardVariants.default} ${rounded.md}">
              <div className="${typography.heading.h3} ${colors.semantic.info.text}">{stats.deletedToday}</div>
              <div className="${typography.body.small} ${colors.semantic.info.text}">今日削除</div>
            </div>

            <div className="${colors.semantic.warning.light} ${spacing.cardVariants.default} ${rounded.md}">
              <div className="${typography.heading.h3} ${colors.semantic.warning.text}">{stats.expiredItems}</div>
              <div className="${typography.body.small} ${colors.semantic.warning.text}">期限切れ</div>
            </div>

            <div className="${colors.semantic.success.light} ${spacing.cardVariants.default} ${rounded.md}">
              <div className="${typography.heading.h3} ${colors.semantic.success.text}">{stats.deletedThisWeek}</div>
              <div className="${typography.body.small} ${colors.semantic.success.text}">今週削除</div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="${colors.semantic.error.light} ${colors.semantic.error.border} ${rounded.lg} ${spacing.cardVariants.default}">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className={`${icons.size.md} ${colors.semantic.error.text}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="${typography.body.small} ${colors.semantic.error.text} font-medium">
                  エラーが発生しました
                </h3>
                <p className="${typography.body.small} ${colors.semantic.error.text} mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  onClick={clearError}
                  className={`${colors.semantic.error.text} hover:brightness-75`}
                >
                  <svg className={icons.size.md} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 検索バー（シンプル版） */}
        <div className="${colors.background.surface} ${rounded.lg} ${spacing.cardVariants.default} border border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <div className={icons.patterns.input.left}>
              <svg
                className={`${icons.size.sm} ${colors.text.muted}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="アイテムを検索..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className={`block w-full ${icons.patterns.input.fieldWithLeftIcon} border py-2 pl-10 pr-3 ${colors.border.alpha} ${rounded.md} ${colors.background.surface} ${typography.body.small} focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* アクション */}
        <TrashActions />

        {/* テーブル */}
        <TrashTable items={filteredItems} />

        {/* 空の状態での説明 */}
        {stats.totalItems === 0 && !loading && (
          <div className="${colors.background.surface} ${rounded.lg} border border-neutral-200 p-8 text-center dark:border-neutral-800">
            <div className="mb-4 text-6xl">🌟</div>
            <h3 className="${typography.heading.h4} ${colors.text.primary} mb-2">ゴミ箱は空です</h3>
            <p className="${colors.text.muted} mb-6">
              削除されたアイテムはここに表示されます。
              <br />
              現在、削除されたアイテムはありません。
            </p>

            <div className="${colors.background.elevated} ${rounded.md} ${spacing.cardVariants.default} text-left">
              <h4 className="${colors.text.primary} mb-2 font-medium">ℹ️ ゴミ箱について</h4>
              <ul className="${typography.body.small} ${colors.text.muted} space-y-1">
                <li>• カレンダーのイベント、タスク、ドキュメントなどを削除すると、ここに移動します</li>
                <li>• アイテムは30日間保持され、その後自動的に完全削除されます</li>
                <li>• 誤って削除したアイテムは復元することができます</li>
                <li>• 必要に応じて完全削除することも可能です</li>
              </ul>
            </div>
          </div>
        )}

        {/* フッター情報 */}
        <div className="${colors.background.elevated} ${rounded.lg} ${spacing.cardVariants.default}">
          <div className="${typography.body.small} ${colors.text.muted} text-center">
            <p>アイテムは削除から30日後に自動的に完全削除されます。 必要なアイテムは期限内に復元してください。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
