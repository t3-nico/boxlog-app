'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Tag,
  Pencil,
  Trash2,
  BarChart3,
  Calendar,
  Folder,
  MoreHorizontal
} from 'lucide-react'
import { useTag, useDeleteTag } from '@/hooks/use-tags'
import { useItemsByTags } from '@/hooks/use-item-tags'
import { TagEditModal } from '@/components/tags/tag-edit-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { TagWithChildren } from '@/types/tags'

interface TagDetailClientProps {
  tagId: string
}

interface TagStatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color?: string
}

function TagStatsCard({ title, value, icon, color = 'blue' }: TagStatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
  }

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
    </div>
  )
}

interface TagBreadcrumbProps {
  tag: TagWithChildren
}

function TagBreadcrumb({ tag }: TagBreadcrumbProps) {
  const breadcrumbs = tag.path.split('/').filter(Boolean)
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <span>/</span>}
          <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-gray-100 font-medium' : ''}>
            {crumb.replace('#', '')}
          </span>
        </div>
      ))}
    </nav>
  )
}

interface AssociatedItemsProps {
  tagId: string
}

function AssociatedItems({ tagId }: AssociatedItemsProps) {
  const { data: itemTags = [], isLoading } = useItemsByTags([tagId])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (itemTags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Folder className="h-12 w-12 mx-auto mb-4" />
        <p>No items associated with this tag yet.</p>
      </div>
    )
  }

  // グループ化
  const groupedItems = itemTags.reduce((acc, item) => {
    if (!acc[item.item_type]) {
      acc[item.item_type] = []
    }
    acc[item.item_type].push(item)
    return acc
  }, {} as Record<string, typeof itemTags>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([itemType, items]) => (
        <div key={itemType}>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 capitalize">
            {itemType}s ({items.length})
          </h4>
          <div className="grid gap-3">
            {items.map(item => (
              <div
                key={item.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.item_id}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tagged {new Date(item.tagged_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="capitalize">
                    {item.item_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TagDetailClient({ tagId }: TagDetailClientProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  
  const { data: tag, isLoading, error } = useTag(tagId)
  const { data: itemTags = [] } = useItemsByTags([tagId])
  const deleteMutation = useDeleteTag()

  const handleDelete = async () => {
    if (!tag) return
    
    try {
      await deleteMutation.mutateAsync(tag.id)
      router.push('/tags/manage')
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !tag) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Tag Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The tag you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Button onClick={() => router.push('/tags/manage')}>
          <ArrowLeft className="h-4 w-4 mr-2" data-slot="icon" />
          Back to Tags
        </Button>
      </div>
    )
  }

  // 統計計算
  const totalItems = itemTags.length
  const taskCount = itemTags.filter(item => item.item_type === 'task').length
  const eventCount = itemTags.filter(item => item.item_type === 'event').length
  const recordCount = itemTags.filter(item => item.item_type === 'record').length

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/tags/manage')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" data-slot="icon" />
            Back to Tags
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" data-slot="icon" />
              Delete
            </Button>
          </div>
        </div>

        {/* パンくずリスト */}
        <TagBreadcrumb tag={tag} />
        
        {/* タグ情報 */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            <Tag 
              className="h-8 w-8" 
              style={{ color: tag.color }}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {tag.name}
              </h1>
              {tag.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {tag.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <TagStatsCard
          title="Total Items"
          value={totalItems}
          icon={<BarChart3 className="h-5 w-5" />}
          color="blue"
        />
        <TagStatsCard
          title="Tasks"
          value={taskCount}
          icon={<Folder className="h-5 w-5" />}
          color="green"
        />
        <TagStatsCard
          title="Events"
          value={eventCount}
          icon={<Calendar className="h-5 w-5" data-slot="icon" />}
          color="yellow"
        />
        <TagStatsCard
          title="Records"
          value={recordCount}
          icon={<MoreHorizontal className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* タグ詳細情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メイン情報 */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Associated Items
            </h2>
            <AssociatedItems tagId={tagId} />
          </div>
        </div>

        {/* サイドバー情報 */}
        <div className="space-y-6">
          {/* タグ詳細 */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tag Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Level
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {tag.level + 1} / 3
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Path
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {tag.path}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {tag.color}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Created
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(tag.created_at).toLocaleDateString()}
                </p>
              </div>
              {tag.updated_at !== tag.created_at && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Updated
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(tag.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 子タグ */}
          {tag.children && tag.children.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Child Tags
              </h3>
              <div className="space-y-2">
                {tag.children.map(child => (
                  <Button
                    key={child.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/tags/${child.id}`)}
                  >
                    <Tag 
                      className="h-4 w-4 mr-2" 
                      style={{ color: child.color }}
                    />
                    {child.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 編集モーダル */}
      <TagEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={async (data) => {
          // TODO: Implement tag update
          console.log('Update tag:', data)
          setShowEditModal(false)
        }}
        tag={tag}
      />

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Delete Tag
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete &quot;{tag.name}&quot;? This action cannot be undone.
              {totalItems > 0 && (
                <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                  Warning: This tag is associated with {totalItems} item{totalItems !== 1 ? 's' : ''}.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}