'use client'

import { useEffect, useState } from 'react'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { useTrashStore } from '@/stores/trashStore'
import { TrashItemCard } from '@/components/settings/TrashItemCard'
import { EmptyTrashModal } from '@/components/settings/EmptyTrashModal'
import { EmptyTrashState } from '@/components/settings/EmptyTrashState'
import { Button } from '@/components/button'

// ローディングスケルトンコンポーネント
function TrashLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TrashPage() {
  const { 
    deletedItems, 
    loading, 
    loadTrashItems, 
    emptyTrash, 
    getTrashStats 
  } = useTrashStore()
  
  const [showEmptyModal, setShowEmptyModal] = useState(false)
  const stats = getTrashStats()

  useEffect(() => {
    loadTrashItems()
  }, [loadTrashItems])

  const handleEmptyTrash = async () => {
    await emptyTrash()
    setShowEmptyModal(false)
  }

  if (loading) {
    return <TrashLoadingSkeleton />
  }

  return (
    <div className="space-y-6 p-10">
      {/* ページヘッダー */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Trash
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Deleted items are kept for 30 days before being permanently removed
            </p>
          </div>
          
          {deletedItems.length > 0 && (
            <Button 
              color="red"
              onClick={() => setShowEmptyModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" data-slot="icon" />
              Empty Trash
            </Button>
          )}
        </div>
        
        {/* 統計情報 */}
        {stats.totalItems > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Items</div>
              <div className="text-lg font-semibold">{stats.totalItems}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Tasks</div>
              <div className="text-lg font-semibold">{stats.itemsByType.task || 0}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Events</div>
              <div className="text-lg font-semibold">{stats.itemsByType.event || 0}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Tags</div>
              <div className="text-lg font-semibold">{stats.itemsByType.tag || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* ゴミ箱アイテムリスト */}
      {deletedItems.length > 0 ? (
        <div className="space-y-4">
          {deletedItems.map(item => (
            <TrashItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyTrashState />
      )}

      {/* 空にする確認モーダル */}
      <EmptyTrashModal
        open={showEmptyModal}
        onClose={() => setShowEmptyModal(false)}
        onConfirm={handleEmptyTrash}
        itemCount={stats.totalItems}
      />
    </div>
  )
}