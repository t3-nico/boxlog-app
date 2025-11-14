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
import type { CreateTagGroupInput } from '@/types/tags'

interface TagGroupCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateTagGroupInput) => Promise<void>
}

export const TagGroupCreateModal = ({ isOpen, onClose, onSave }: TagGroupCreateModalProps) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // モーダルが開いたらリセット
  useEffect(() => {
    if (isOpen) {
      setName('')
      setColor('#3B82F6')
      setError('')
    }
  }, [isOpen])

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
          slug: '', // 空文字列（将来的に削除予定）
          description: null,
          color: color || null,
        })
        onClose()
      } catch (err) {
        console.error('Tag group creation failed:', err)
        setError('グループの作成に失敗しました')
      } finally {
        setIsLoading(false)
      }
    },
    [name, color, onSave, onClose]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新規グループ作成</DialogTitle>
          <DialogDescription>新しいタググループを作成します</DialogDescription>
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
              <ColorPalettePicker selectedColor={color} onColorSelect={setColor} />
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
