'use client'

import { useState } from 'react'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { tagIconMapping, tagIconCategories, TagIconName } from '@/config/tagIcons'
import { useSidebarStore } from '@/stores/sidebarStore'

interface CreateTagModalProps {
  open: boolean
  onClose: () => void
}

export const CreateTagModal = ({ open, onClose }: CreateTagModalProps) => {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [icon, setIcon] = useState<TagIconName>('TagIcon')
  const { addTag } = useSidebarStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    
    // 新しいタグを作成
    const newTag = {
      id: Date.now().toString(),
      name,
      color,
      icon,
      count: 0,
      parentId: null,
      level: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    addTag(newTag)
    
    // フォームリセット
    setName('')
    setColor('#3b82f6')
    setIcon('TagIcon')
    onClose()
  }

  const handleClose = () => {
    // フォームリセット
    setName('')
    setColor('#3b82f6')
    setIcon('TagIcon')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Tag</DialogTitle>
        <DialogBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tag Name
            </label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter tag name..."
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            
            {/* プリセットカラー */}
            <div className="grid grid-cols-8 gap-2">
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
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            
            {/* 現在選択されているアイコンのプレビュー */}
            <div className="flex items-center gap-3 mb-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
              {(() => {
                const IconComponent = tagIconMapping[icon]
                return <IconComponent className="w-5 h-5" style={{ color }} />
              })()}
              <span className="text-sm font-medium">{icon}</span>
            </div>
            
            {/* アイコン選択 */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
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
                          <IconComponent className="w-5 h-5 mx-auto text-gray-600 dark:text-gray-400" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Create Tag</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}