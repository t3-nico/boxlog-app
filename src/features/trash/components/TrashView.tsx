import React, { useEffect } from 'react'

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
    <div className={`min-h-screen bg-neutral-100 dark:bg-neutral-900 ${className}`}>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* ヘッダー */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                <span className="mr-3 text-3xl">🗑️</span>
                ゴミ箱
              </h1>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                削除されたアイテムを管理します。アイテムは30日後に自動削除されます。
              </p>
            </div>

            {/* リフレッシュボタン */}
            <button
              type="button"
              onClick={() => fetchItems()}
              disabled={loading}
              className="flex items-center gap-2 rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-neutral-600 dark:text-neutral-400"
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
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-md bg-neutral-50 p-4 dark:bg-neutral-700">
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalItems}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">総アイテム数</div>
            </div>

            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.deletedToday}</div>
              <div className="text-sm text-blue-700 dark:text-blue-400">今日削除</div>
            </div>

            <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.expiredItems}</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-400">期限切れ</div>
            </div>

            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.deletedThisWeek}</div>
              <div className="text-sm text-green-700 dark:text-green-400">今週削除</div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error != null && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-600 dark:text-red-400"
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  エラーが発生しました
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  onClick={clearError}
                  className="text-red-600 hover:brightness-75 dark:text-red-400"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 検索バー（シンプル版） */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-800">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
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
              className="block w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm text-neutral-900 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        </div>

        {/* アクション */}
        <TrashActions />

        {/* テーブル */}
        <TrashTable items={filteredItems} />

        {/* 空の状態での説明 */}
        {stats.totalItems === 0 && !loading && (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-800">
            <div className="mb-4 text-6xl">🌟</div>
            <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">ゴミ箱は空です</h3>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              削除されたアイテムはここに表示されます。
              <br />
              現在、削除されたアイテムはありません。
            </p>

            <div className="rounded-md bg-neutral-50 p-4 text-left dark:bg-neutral-700">
              <h4 className="mb-2 font-medium text-neutral-900 dark:text-neutral-100">ℹ️ ゴミ箱について</h4>
              <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <li>• カレンダーのイベント、タスク、ドキュメントなどを削除すると、ここに移動します</li>
                <li>• アイテムは30日間保持され、その後自動的に完全削除されます</li>
                <li>• 誤って削除したアイテムは復元することができます</li>
                <li>• 必要に応じて完全削除することも可能です</li>
              </ul>
            </div>
          </div>
        )}

        {/* フッター情報 */}
        <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-700">
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            <p>アイテムは削除から30日後に自動的に完全削除されます。 必要なアイテムは期限内に復元してください。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
