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
import type { CreateTagInput, TagGroup, TagLevel } from '@/features/tags/types'
import { useTranslations } from 'next-intl'

interface TagCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateTagInput) => Promise<void>
}

export const TagCreateModal = ({ isOpen, onClose, onSave }: TagCreateModalProps) => {
  const t = useTranslations()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [description, setDescription] = useState('')
  const [groupId, setGroupId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // タググループ取得 - モーダルが開いている時だけフェッチ（未認証ページでの401エラー防止）
  const { data: groups = [] as TagGroup[] } = useTagGroups({ enabled: isOpen })

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
        setError(t('tag.validation.nameEmpty'))
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
          setError(t('tag.form.duplicateName'))
        } else {
          setError(t('tag.errors.createFailed'))
        }
      } finally {
        setIsLoading(false)
      }
    },
    [name, color, description, groupId, onSave, onClose, t]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('tag.modal.createTitle')}</DialogTitle>
          <DialogDescription>{t('tag.modal.createDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* タグ名 */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('tag.form.tagNameRequired')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('tag.form.examplePlaceholder')}
                required
              />
            </div>

            {/* カラー */}
            <div className="grid gap-2">
              <Label htmlFor="color">{t('tag.form.color')}</Label>
              <ColorPalettePicker selectedColor={color} onColorSelect={setColor} />
            </div>

            {/* グループ */}
            <div className="grid gap-2">
              <Label htmlFor="group">{t('tag.form.group')}</Label>
              <Select value={groupId ?? undefined} onValueChange={(value) => setGroupId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tag.form.selectGroupPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('tag.sidebar.uncategorized')}</SelectItem>
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
              <Label htmlFor="description">{t('tag.form.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('tag.form.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            {/* エラー表示 */}
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('tag.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? t('tag.actions.creating') : t('tag.actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
