'use client'

import { useTagsPageContext } from '../contexts/TagsPageContext'
import { TagsSidebar } from './TagsSidebar'

/**
 * TagsSidebarWrapper - Contextから状態を取得してTagsSidebarに渡す
 *
 * DesktopLayoutから呼び出され、TagsPageContextのデータを使用する
 */
export function TagsSidebarWrapper() {
  const { tags, selectedGroupId, setSelectedGroupId, isLoading, onCreateGroup } = useTagsPageContext()

  // グループ（Level 0）のみ抽出
  const groups = tags.filter((tag) => tag.level === 0)

  const handleCreateGroup = () => {
    if (onCreateGroup) {
      onCreateGroup()
    }
  }

  return (
    <TagsSidebar
      groups={groups}
      activeGroupId={selectedGroupId}
      onGroupSelect={setSelectedGroupId}
      onCreateGroup={handleCreateGroup}
      isLoading={isLoading}
    />
  )
}
