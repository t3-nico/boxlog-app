'use client'

import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ColorPalettePicker } from '@/components/ui/color-palette-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTagGroups } from '@/features/tags/hooks/use-tag-groups'
import type { CreateTagInput, TagGroup, TagLevel } from '@/types/tags'

interface TagCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateTagInput) => Promise<void>
}

export const TagCreateModal = ({ isOpen, onClose, onSave }: TagCreateModalProps) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [description, setDescription] = useState('')
  const [groupId, setGroupId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // タググループ取得
  const { data: groups = [] as TagGroup[] } = useTagGroups()

  // モーダルが開いたらリセット
  useEffect(() => {
    if (isOpen) {
      setName('')
      setColor('#3B82F6')
      setDescription('')
      setGroupId('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      if (!name.trim()) {
        setError('タグ名を入力してください')
        return
      }

      setIsLoading(true)
      try {
        // シンプルにLevel 0のタグとして作成（parent_idはnull）
        const level: TagLevel = 0
        const parent_id = null

        await onSave({
          name: name.trim(),
          color,
          description: description.trim() || null,
          parent_id,
          level,
          group_id: groupId && groupId !== '__none__' ? groupId : null,
        })
        onClose()
      } catch (err) {
        console.error('Tag creation failed:', err)
        // エラーメッセージから重複エラーを検出
        const errorMessage = err instanceof Error ? err.message : String(err)
        if (
          errorMessage.includes('duplicate') ||
          errorMessage.includes('unique') ||
          errorMessage.includes('重複') ||
          errorMessage.includes('既に存在')
        ) {
          setError(`タグ名「${name.trim()}」は既に使用されています`)
        } else {
          setError('タグの作成に失敗しました')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [name, color, description, groupId, onSave, onClose]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新規タグ作成</DialogTitle>
          <DialogDescription>新しいタグを作成します</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* タグ名 */}
            <div className="grid gap-2">
              <Label htmlFor="name">タグ名 *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 開発" required />
            </div>

            {/* カラー */}
            <div className="grid gap-2">
              <Label htmlFor="color">カラー</Label>
              <ColorPalettePicker selectedColor={color} onColorSelect={setColor} />
            </div>

            {/* グループ */}
            <div className="grid gap-2">
              <Label htmlFor="group">グループ</Label>
              <Select value={groupId ?? undefined} onValueChange={(value) => setGroupId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="グループを選択（任意）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">未分類</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 説明 */}
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="タグの説明（任意）"
                rows={3}
              />
            </div>

            {/* エラー表示 */}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
