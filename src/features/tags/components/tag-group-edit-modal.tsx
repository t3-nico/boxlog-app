'use client'

import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import type { TagGroup, UpdateTagGroupInput } from '@/types/tags'

// プリセットカラー（10色）
const PRESET_COLORS = [
  { name: '青', value: '#3B82F6' },
  { name: '緑', value: '#10B981' },
  { name: '赤', value: '#EF4444' },
  { name: '黄', value: '#F59E0B' },
  { name: '紫', value: '#8B5CF6' },
  { name: 'ピンク', value: '#EC4899' },
  { name: 'シアン', value: '#06B6D4' },
  { name: 'オレンジ', value: '#F97316' },
  { name: 'グレー', value: '#6B7280' },
  { name: 'インディゴ', value: '#6366F1' },
]

interface TagGroupEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: UpdateTagGroupInput) => Promise<void>
  group: TagGroup | null
}

export const TagGroupEditModal = ({ isOpen, onClose, onSave, group }: TagGroupEditModalProps) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // グループデータで初期化
  useEffect(() => {
    if (isOpen && group) {
      setName(group.name)
      setColor(group.color || '#3B82F6')
      setDescription(group.description || '')
      setError('')
    }
  }, [isOpen, group])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      if (!name.trim()) {
        setError('グループ名を入力してください')
        return
      }

      setIsLoading(true)
      try {
        await onSave({
          name: name.trim(),
          description: description.trim() || null,
          color: color || null,
        })
        onClose()
      } catch (err) {
        console.error('Tag group update failed:', err)
        setError('グループの更新に失敗しました')
      } finally {
        setIsLoading(false)
      }
    },
    [name, color, description, onSave, onClose]
  )

  if (!group) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>グループ編集</DialogTitle>
          <DialogDescription>タググループを編集します</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* グループ名 */}
            <div className="grid gap-2">
              <Label htmlFor="name">グループ名 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: プロジェクト"
                required
              />
            </div>

            {/* カラー */}
            <div className="grid gap-2">
              <Label htmlFor="color">カラー</Label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor.value}
                    type="button"
                    onClick={() => setColor(presetColor.value)}
                    className={`h-10 w-full rounded-md border-2 transition-all ${
                      color === presetColor.value ? 'border-foreground ring-2 ring-offset-2' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: presetColor.value }}
                    title={presetColor.name}
                    aria-label={presetColor.name}
                  />
                ))}
              </div>
            </div>

            {/* 説明 */}
            <div className="grid gap-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="グループの説明（任意）"
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
              {isLoading ? '更新中...' : '更新'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
