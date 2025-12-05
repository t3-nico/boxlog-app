'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tag } from '@/types/tags'
import { useTranslations } from 'next-intl'
import { tagIconCategories, tagIconMapping, TagIconName } from '../constants/icons'

interface TagEditDialogProps {
  tag: Tag | null
  open: boolean
  onClose: () => void
  onSave: (tag: Partial<Tag>) => void
}

export const TagEditDialog = ({ tag, open, onClose, onSave }: TagEditDialogProps) => {
  const t = useTranslations()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6b7280')
  const [icon, setIcon] = useState<TagIconName>('TagIcon')

  useEffect(() => {
    if (tag) {
      setName(tag.name)

      setColor(tag.color || '#6b7280')

      setIcon((tag.icon as TagIconName) || 'TagIcon')
    }
  }, [tag])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tag) return

    onSave({
      ...tag,
      name,
      color,
      icon,
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setName('')
    setColor('#6b7280')
    setIcon('TagIcon')
  }

  if (!tag) return null

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('tag.actions.editTag')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="tag-name-input" className="text-foreground mb-2 block text-sm font-medium">
                {t('tag.form.tagName')}
              </label>
              <Input
                id="tag-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('tag.form.namePlaceholder')}
                required
              />
            </div>
            <div>
              <div id="color-label" className="text-foreground mb-2 block text-sm font-medium">
                {t('tag.form.color')}
              </div>

              {/* プリセットカラー */}
              <div className="grid grid-cols-8 gap-2" role="radiogroup" aria-labelledby="color-label">
                {[
                  '#ef4444',
                  '#f97316',
                  '#f59e0b',
                  '#eab308',
                  '#84cc16',
                  '#22c55e',
                  '#10b981',
                  '#14b8a6',
                  '#06b6d4',
                  '#0ea5e9',
                  '#3b82f6',
                  '#6366f1',
                  '#8b5cf6',
                  '#a855f7',
                  '#d946ef',
                  '#ec4899',
                ].map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`h-8 w-8 rounded-md border-2 transition-all ${
                      color === presetColor ? 'border-border scale-110' : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div id="icon-label" className="text-foreground mb-2 block text-sm font-medium">
                {t('tag.labels.icon')}
              </div>

              {/* 現在選択されているアイコンのプレビュー */}
              <div
                className="border-border bg-muted mb-3 flex items-center gap-3 rounded-lg border p-3"
                style={{ '--tag-color': color } as React.CSSProperties}
              >
                {(() => {
                  const IconComponent = tagIconMapping[icon]
                  return (
                    <IconComponent
                      className="tag-icon h-5 w-5"
                      style={{ color, '--tag-color': color } as React.CSSProperties}
                    />
                  )
                })()}
                <span className="text-foreground text-sm font-medium">{icon}</span>
              </div>

              {/* アイコン選択 */}
              <div className="border-border max-h-64 overflow-y-auto rounded-lg border" aria-labelledby="icon-label">
                {Object.entries(tagIconCategories).map(([category, icons]) => (
                  <div key={category} className="border-border border-b p-3 last:border-b-0">
                    <p className="text-muted-foreground mb-2 text-xs font-medium">{category}</p>
                    <div className="grid grid-cols-6 gap-2">
                      {icons.map((iconName) => {
                        const IconComponent = tagIconMapping[iconName as TagIconName]
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setIcon(iconName as TagIconName)}
                            className={`rounded-md p-2 transition-all ${
                              icon === iconName
                                ? 'border-primary bg-primary/12 border-2'
                                : 'border-border bg-secondary text-secondary-foreground hover:bg-state-hover border'
                            }`}
                            title={iconName}
                          >
                            <IconComponent className="text-muted-foreground tag-icon mx-auto h-5 w-5" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('tag.actions.cancel')}
            </Button>
            <Button type="submit">{t('tag.actions.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
