// TODO(#621): Events削除後、plans/Sessionsに移行予定
'use client'

// import { Event } from '@/features/events/types/events'
import { useTrashStore } from '@/features/trash/stores/useTrashStore'
import { SmartFolder } from '@/types/smart-folders'
import { DeletedItem } from '@/types/trash'
import { Task } from '@/types/unified'

// 削除可能なアイテムの共通インターフェース
interface DeletableItem {
  id: string
  title?: string
  name?: string
  path?: string
  folder?: string
  originalPath?: string
}

export const useDelete = () => {
  const { moveToTrash } = useTrashStore()

  const deleteWithTrash = async (item: DeletableItem, type: DeletedItem['type'], originalPath?: string) => {
    try {
      // 1. アイテムにパス情報を追加
      const itemWithPath = {
        ...item,
        originalPath: originalPath || item.path || item.folder || undefined,
      }

      // 2. ゴミ箱に移動
      await moveToTrash(itemWithPath, type)

      // 3. 元の場所から削除処理は各呼び出し元で実装
      // これはstoreごとに異なる削除処理が必要なため

      // 4. 成功ログ（将来的にtoast通知に変更）
      console.log(`"${item.name || item.title}" moved to trash`)

      return true
    } catch (error) {
      console.error('Failed to delete item:', error)
      throw error
    }
  }

  const deleteTask = async (task: Task, originalPath?: string) => {
    await deleteWithTrash(task, 'task', originalPath)
    // Delete implementation tracked in Issue #85
  }

  const deleteEvent = async (event: DeletableItem, originalPath?: string) => {
    await deleteWithTrash(event, 'event', originalPath)
    // Delete implementation tracked in Issue #85
  }

  const deleteTag = async (tag: DeletableItem, originalPath?: string) => {
    await deleteWithTrash(tag, 'tag', originalPath)
    // Delete implementation tracked in Issue #85
  }

  const deleteSmartFolder = async (folder: SmartFolder, originalPath?: string) => {
    await deleteWithTrash(folder, 'smart-folder', originalPath)
    // Delete implementation tracked in Issue #85
  }

  return {
    deleteWithTrash,
    deleteTask,
    deleteEvent,
    deleteTag,
    deleteSmartFolder,
  }
}
