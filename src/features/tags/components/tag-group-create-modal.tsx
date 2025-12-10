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
import type { CreateTagGroupInput } from '@/features/tags/types'
import { useTranslations } from 'next-intl'

interface TagGroupCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateTagGroupInput) => Promise<void>
}

export const TagGroupCreateModal = ({ isOpen, onClose, onSave }: TagGroupCreateModalProps) => {
  const t = useTranslations()
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
        setError(t('tag.toast.groupNameRequired'))
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
        setError(t('tag.toast.groupCreateFailed'))
      } finally {
        setIsLoading(false)
      }
    },
    [name, color, onSave, onClose, t]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('tag.group.createTitle')}</DialogTitle>
          <DialogDescription>{t('tag.group.createDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* グループ名 */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('tag.group.nameRequired')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('tag.group.namePlaceholder')}
                required
              />
            </div>

            {/* カラー */}
            <div className="grid gap-2">
              <Label htmlFor="color">{t('tag.form.color')}</Label>
              <ColorPalettePicker selectedColor={color} onColorSelect={setColor} />
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
