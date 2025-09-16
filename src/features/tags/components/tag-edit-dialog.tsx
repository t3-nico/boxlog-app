'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/shadcn-ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn-ui/dialog'
import { Input } from '@/components/shadcn-ui/input'
import { tagIconMapping, tagIconCategories, TagIconName } from '@/config/ui/tagIcons'

interface Tag {
  id: string
  name: string
  color?: string
  icon?: string
  count: number
  parentId?: string | null
}

interface TagEditDialogProps {
  tag: Tag | null
  open: boolean
  onClose: () => void
  onSave: (tag: Tag) => void
}

export const TagEditDialog = ({ tag, open, onClose, onSave }: TagEditDialogProps) => {
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
      icon
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
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>タグを編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
          <div>
            <label htmlFor="tag-name-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              タグ名
            </label>
            <Input
              id="tag-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="タグ名を入力"
              required 
            />
          </div>
          <div>
            <div id="color-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              色
            </div>

            {/* プリセットカラー */}
            <div className="grid grid-cols-8 gap-2" role="radiogroup" aria-labelledby="color-label">
              {[
                '#ef4444', '#f97316', '#f59e0b', '#eab308',
                '#84cc16', '#22c55e', '#10b981', '#14b8a6',
                '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
                '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
              ].map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-md border-2 transition-all ${
                    color === presetColor 
                      ? 'border-gray-400 scale-110' 
                      : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
          </div>
          
          <div>
            <div id="icon-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              アイコン
            </div>
            
            {/* 現在選択されているアイコンのプレビュー */}
            <div 
              className="flex items-center gap-3 mb-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
              style={{ '--tag-color': color } as React.CSSProperties}
            >
              {(() => {
                const IconComponent = tagIconMapping[icon]
                return <IconComponent className="w-5 h-5 tag-icon" style={{ color, '--tag-color': color } as React.CSSProperties} />
              })()}
              <span className="text-sm font-medium text-gray-900 dark:text-white">{icon}</span>
            </div>
            
            {/* アイコン選択 */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg" aria-labelledby="icon-label">
              {Object.entries(tagIconCategories).map(([category, icons]) => (
                <div key={category} className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{category}</p>
                  <div className="grid grid-cols-6 gap-2">
                    {icons.map((iconName) => {
                      const IconComponent = tagIconMapping[iconName as TagIconName]
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setIcon(iconName as TagIconName)}
                          className={`p-2 rounded-md transition-all ${
                            icon === iconName
                              ? 'bg-blue-100 border-2 border-blue-300 dark:bg-blue-900/30 dark:border-blue-600'
                              : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                          title={iconName}
                        >
                          <IconComponent className="w-5 h-5 mx-auto text-gray-600 dark:text-gray-400 tag-icon" />
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
              キャンセル
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}