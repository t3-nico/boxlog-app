import { useCallback } from 'react'

import { useTagStore } from '@/features/tags/stores/tag-store'

interface Tag {
  id: string
  name: string
  color: string
  frequency?: number
}

interface UseTagInputProps {
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void
  onInputClear: () => void
  onSuggestionsHide: () => void
}

/**
 * タグカラー生成ユーティリティ
 */
const generateTagColor = (name: string): string => {
  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#06b6d4',
    '#f97316',
    '#ec4899',
    '#14b8a6',
    '#6366f1',
  ]
  const hash = name.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

/**
 * タグ入力ロジックを提供するフック
 * - タグ追加処理（既存タグ確認、新規作成）
 * - タグ削除処理
 * - 最大5個制限
 */
export const useTagInput = ({ selectedTags, onChange, onInputClear, onSuggestionsHide }: UseTagInputProps) => {
  const { addTag: addTagToStore, getAllTags } = useTagStore()

  // タグ追加処理
  const addTag = useCallback(
    async (tagName: string) => {
      // 最大5個制限
      if (selectedTags.length >= 5) return

      // 重複チェック
      if (selectedTags.some((tag) => tag.name === tagName)) {
        onInputClear()
        onSuggestionsHide()
        return
      }

      // 既存のタグを確認
      const existingTags = getAllTags()
      let tagToAdd = existingTags.find((t) => t.name === tagName)

      // タグが存在しない場合は新規作成
      if (!tagToAdd) {
        const color = generateTagColor(tagName)

        // タグストアに追加
        const success = await addTagToStore({
          name: tagName,
          color,
          level: 1, // デフォルトレベル
          icon: '🏷️', // デフォルトアイコン
        })

        if (success) {
          // 追加されたタグを取得
          const updatedTags = getAllTags()
          tagToAdd = updatedTags.find((t) => t.name === tagName)
        }
      }

      if (tagToAdd) {
        // 入力値をクリアして提案を非表示
        onInputClear()
        onSuggestionsHide()

        // コンポーネント用のTag型に変換
        const newTag: Tag = {
          id: tagToAdd.id,
          name: tagToAdd.name,
          color: tagToAdd.color,
        }

        // 短いアニメーション遅延でタグを追加
        setTimeout(() => {
          onChange([...selectedTags, newTag])
        }, 50)
      }
    },
    [selectedTags, onChange, onInputClear, onSuggestionsHide, addTagToStore, getAllTags]
  )

  // タグ削除処理
  const removeTag = useCallback(
    (tagId: string) => {
      onChange(selectedTags.filter((tag) => tag.id !== tagId))
    },
    [onChange, selectedTags]
  )

  return {
    addTag,
    removeTag,
  }
}
