'use client'

import { useState, useCallback } from 'react'
import { 
  Tag, 
  Settings,
  Search,
  Filter
} from 'lucide-react'
import { TagTreeView } from '@/components/tags/tag-tree-view'
import { TagCreateModal } from '@/components/tags/tag-create-modal'
import { TagEditModal } from '@/components/tags/tag-edit-modal'
import { 
  useTags, 
  useCreateTag, 
  useUpdateTag, 
  useDeleteTag, 
  useMoveTag, 
  useRenameTag,
  useOptimisticTagUpdate 
} from '@/hooks/use-tags'
import type { TagWithChildren, CreateTagInput, UpdateTagInput } from '@/types/tags'

export default function TagsManagePage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagWithChildren | null>(null)
  const [createParentTag, setCreateParentTag] = useState<TagWithChildren | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  
  // React Query hooks
  const { data: tags = [], isLoading, error } = useTags(true)
  const createTagMutation = useCreateTag()
  const updateTagMutation = useUpdateTag()
  const deleteTagMutation = useDeleteTag()
  const moveTagMutation = useMoveTag()
  const renameTagMutation = useRenameTag()
  
  // 楽観的更新
  const { updateTagOptimistically, addTagOptimistically, removeTagOptimistically } = useOptimisticTagUpdate()
  
  // フィルタリング
  const filteredTags = tags.filter(tag => {
    if (!showInactive && !tag.is_active) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return tag.name.toLowerCase().includes(query) ||
             tag.path.toLowerCase().includes(query) ||
             tag.description?.toLowerCase().includes(query)
    }
    return true
  })
  
  // タグ作成
  const handleCreateTag = useCallback((parentId?: string) => {
    const parentTag = parentId ? 
      tags.find(t => t.id === parentId) || 
      tags.flatMap(t => t.children || []).find(t => t.id === parentId) : 
      null
    
    setCreateParentTag(parentTag || null)
    setShowCreateModal(true)
  }, [tags])
  
  const handleSaveNewTag = useCallback(async (data: CreateTagInput) => {
    try {
      // 楽観的更新
      const tempTag: TagWithChildren = {
        id: `temp-${Date.now()}`,
        name: data.name,
        parent_id: data.parent_id || null,
        user_id: 'current-user',
        color: data.color || '#3B82F6',
        level: createParentTag ? (createParentTag.level + 1) as any : 0,
        path: createParentTag ? `${createParentTag.path}/${data.name}` : `#${data.name}`,
        description: data.description || null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        children: [],
        parent: createParentTag
      }
      
      addTagOptimistically(tempTag, data.parent_id)
      
      // 実際の作成
      await createTagMutation.mutateAsync(data)
    } catch (error) {
      console.error('Failed to create tag:', error)
      throw error
    }
  }, [createTagMutation, addTagOptimistically, createParentTag])
  
  // タグ編集
  const handleEditTag = useCallback((tag: TagWithChildren) => {
    setSelectedTag(tag)
    setShowEditModal(true)
  }, [])
  
  const handleSaveTag = useCallback(async (data: UpdateTagInput) => {
    if (!selectedTag) return
    
    try {
      // 楽観的更新
      updateTagOptimistically(selectedTag.id, data)
      
      // 実際の更新
      await updateTagMutation.mutateAsync({ 
        id: selectedTag.id, 
        data 
      })
    } catch (error) {
      console.error('Failed to update tag:', error)
      throw error
    }
  }, [selectedTag, updateTagMutation, updateTagOptimistically])
  
  // タグ削除
  const handleDeleteTag = useCallback(async (tag: TagWithChildren) => {
    const confirmDelete = window.confirm(
      `「${tag.name}」を削除しますか？この操作は取り消せません。`
    )
    
    if (!confirmDelete) return
    
    try {
      // 楽観的更新
      removeTagOptimistically(tag.id)
      
      // 実際の削除
      await deleteTagMutation.mutateAsync(tag.id)
    } catch (error) {
      console.error('Failed to delete tag:', error)
      throw error
    }
  }, [deleteTagMutation, removeTagOptimistically])
  
  const handleDeleteSelectedTag = useCallback(async () => {
    if (!selectedTag) return
    await handleDeleteTag(selectedTag)
  }, [selectedTag, handleDeleteTag])
  
  // タグ移動
  const handleMoveTag = useCallback(async (newParentId: string | null) => {
    if (!selectedTag) return
    
    try {
      await moveTagMutation.mutateAsync({
        id: selectedTag.id,
        newParentId
      })
    } catch (error) {
      console.error('Failed to move tag:', error)
      throw error
    }
  }, [selectedTag, moveTagMutation])
  
  // タグリネーム
  const handleRenameTag = useCallback(async (tag: TagWithChildren, newName: string) => {
    try {
      // 楽観的更新
      updateTagOptimistically(tag.id, { name: newName })
      
      // 実際のリネーム
      await renameTagMutation.mutateAsync({
        id: tag.id,
        name: newName
      })
    } catch (error) {
      console.error('Failed to rename tag:', error)
      throw error
    }
  }, [renameTagMutation, updateTagOptimistically])
  
  // モーダルを閉じる
  const handleCloseModals = useCallback(() => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedTag(null)
    setCreateParentTag(null)
  }, [])
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <Tag className="w-12 h-12 mx-auto mb-2" />
            <p>タグの読み込みに失敗しました</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Tag className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                タグ管理
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                階層構造でタグを整理・管理できます
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCreateTag()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Tag className="w-4 h-4" />
              新しいタグ
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 検索・フィルター */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="タグを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showInactive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              非アクティブを表示
            </button>
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <TagTreeView
          tags={filteredTags}
          onCreateTag={handleCreateTag}
          onEditTag={handleEditTag}
          onDeleteTag={handleDeleteTag}
          onRenameTag={handleRenameTag}
          isLoading={isLoading}
        />
      </div>
      
      {/* 統計情報 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tags.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            総タグ数
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tags.filter(t => t.level === 0).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ルートタグ数
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tags.filter(t => !t.is_active).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            非アクティブタグ数
          </div>
        </div>
      </div>
      
      {/* モーダル */}
      <TagCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={handleSaveNewTag}
        parentTag={createParentTag}
        allTags={tags}
      />
      
      <TagEditModal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSave={handleSaveTag}
        onDelete={handleDeleteSelectedTag}
        onMove={handleMoveTag}
        tag={selectedTag}
        allTags={tags}
      />
    </div>
  )
}