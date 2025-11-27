'use client'

import { useEffect } from 'react'

import { useTrashStore } from '../stores/useTrashStore'

import { TrashActions } from './TrashActions'
import { TrashTable } from './TrashTable'

interface TrashViewProps {
  className?: string
}

export function TrashView({ className }: TrashViewProps) {
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
    <div className={`bg-background min-h-screen ${className}`}>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* ヘッダー */}
        <div className="border-border bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground flex items-center text-3xl font-bold tracking-tight">
                <span className="mr-3 text-3xl">🗑️</span>
                ゴミ箱
              </h1>
              <p className="text-muted-foreground mt-2">
                削除されたアイテムを管理します。アイテムは30日後に自動削除されます。
              </p>
            </div>

            {/* リフレッシュボタン */}
            <button
              type="button"
              onClick={() => fetchItems()}
              disabled={loading}
              className="border-input text-foreground hover:bg-muted flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="text-muted-foreground h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
            <div className="bg-muted rounded-md p-4">
              <div className="text-foreground text-2xl font-bold">{stats.totalItems}</div>
              <div className="text-muted-foreground text-sm">総アイテム数</div>
            </div>

            <div className="bg-primary/10 rounded-md p-4">
              <div className="text-primary text-2xl font-bold">{stats.deletedToday}</div>
              <div className="text-primary text-sm">今日削除</div>
            </div>

            <div className="bg-destructive/10 rounded-md p-4">
              <div className="text-destructive text-2xl font-bold">{stats.expiredItems}</div>
              <div className="text-destructive text-sm">期限切れ</div>
            </div>

            <div className="bg-muted rounded-md p-4">
              <div className="text-foreground text-2xl font-bold">{stats.deletedThisWeek}</div>
              <div className="text-muted-foreground text-sm">今週削除</div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error != null && (
          <div className="border-destructive/30 bg-destructive/10 rounded-lg border p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="text-destructive h-5 w-5"
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
                <h3 className="text-destructive text-sm font-medium">エラーが発生しました</h3>
                <p className="text-destructive mt-1 text-sm">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  onClick={clearError}
                  className="text-destructive hover:text-destructive/80"
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
        <div className="border-border bg-card rounded-lg border p-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="text-muted-foreground h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="border-input bg-card text-foreground focus:ring-ring block w-full rounded-md border py-2 pr-3 pl-10 text-sm focus:ring-2"
            />
          </div>
        </div>

        {/* アクション */}
        <TrashActions />

        {/* テーブル */}
        <TrashTable items={filteredItems} />

        {/* 空の状態での説明 */}
        {stats.totalItems === 0 && !loading && (
          <div className="border-border bg-card rounded-lg border p-8 text-center">
            <div className="mb-4 text-6xl">🌟</div>
            <h3 className="text-foreground mb-2 text-xl font-bold">ゴミ箱は空です</h3>
            <p className="text-muted-foreground mb-6">
              削除されたアイテムはここに表示されます。
              <br />
              現在、削除されたアイテムはありません。
            </p>

            <div className="bg-muted rounded-md p-4 text-left">
              <h4 className="text-foreground mb-2 font-medium">ℹ️ ゴミ箱について</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• カレンダーのイベント、タスク、ドキュメントなどを削除すると、ここに移動します</li>
                <li>• アイテムは30日間保持され、その後自動的に完全削除されます</li>
                <li>• 誤って削除したアイテムは復元することができます</li>
                <li>• 必要に応じて完全削除することも可能です</li>
              </ul>
            </div>
          </div>
        )}

        {/* フッター情報 */}
        <div className="bg-muted rounded-lg p-4">
          <div className="text-muted-foreground text-center text-sm">
            <p>アイテムは削除から30日後に自動的に完全削除されます。 必要なアイテムは期限内に復元してください。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
