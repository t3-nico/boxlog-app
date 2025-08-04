'use client'

import { useState, useEffect } from 'react'
import { Tag } from '@/types/unified'
import { useTagStore, tagColors, colorCategories } from '@/lib/tag-store'
import { Button } from '@/components/ui/button'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog'

interface TagModalProps {
  open: boolean
  onClose: () => void
  tag?: Tag | null
  parentId?: string | null
}

export function TagModal({ open, onClose, tag, parentId }: TagModalProps) {
  const { addTag, updateTag, getAllTags, getTagById, canAddChild } = useTagStore()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])
  const [icon, setIcon] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string>('')

  useEffect(() => {
    if (tag) {
      setName(tag.name)
      setDescription(tag.description || '')
      setSelectedColor(tag.color)
      setIcon((tag as any).icon || '')
      setSelectedParentId((tag as any).parent_id || '')
    } else {
      setName('')
      setDescription('')
      setSelectedColor(tagColors[0])
      setIcon('')
      setSelectedParentId(parentId || '')
    }
  }, [tag, open, parentId])

  const handleSave = async () => {
    if (!name.trim()) return

    const parentTag = selectedParentId ? getTagById(selectedParentId) : null
    const level = parentTag ? parentTag.level + 1 : 1

    const tagData = {
      name: name.trim(),
      color: selectedColor,
      description: description.trim() || undefined,
      icon: icon.trim() || undefined,
      parent_id: selectedParentId || undefined,
      level,
    }
    
    if (tag) {
      await updateTag(tag.id, tagData)
    } else {
      await addTag(tagData)
    }
    
    onClose()
  }

  // Get available parent tags (excluding level 3 tags and descendants of current tag)
  const getAvailableParents = () => {
    const allTags = getAllTags()
    return allTags.filter(t => {
      // Can't be level 3 (max 3 levels)
      if (t.level >= 3) return false
      
      // When editing, can't select self or descendants
      if (tag && (t.id === tag.id || t.path.startsWith(tag.path + '/'))) return false
      
      return true
    })
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {tag ? 'Edit Tag' : 'Create Tag'}
          </DialogTitle>
          <DialogDescription>
            Create a tag to organize and categorize your tasks.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Field>
            <Label>Parent Tag (Optional)</Label>
            <Select value={selectedParentId} onValueChange={setSelectedParentId}>
              <SelectTrigger>
                <SelectValue placeholder="None (Root level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Root level)</SelectItem>
                {getAvailableParents().map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.path} (Level {parent.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Label>Tag Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tag name..."
              required
            />
          </Field>

          <Field>
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter tag description..."
              rows={2}
            />
          </Field>

          <Field>
            <Label>Icon (Optional)</Label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Enter emoji or icon..."
              maxLength={2}
            />
          </Field>

          <Field>
            <Label>Color</Label>
            <div className="space-y-4 mt-2">
            {Object.entries(colorCategories).map(([categoryName, colors]) => (
              <div key={categoryName}>
                <Label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {categoryName}
                </Label>
                <div className="grid grid-cols-8 gap-2 mt-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColor === color 
                          ? 'border-gray-900 dark:border-gray-100 ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${categoryName} color ${color}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedColor}
            </span>
          </div>
        </Field>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: selectedColor }}
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {name || 'Tag name'}
              </span>
              {icon && (
                <span className="text-sm">{icon}</span>
              )}
            </div>
            {selectedParentId && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Path: {getTagById(selectedParentId)?.path}/{name || 'Tag name'}
              </div>
            )}
            {!selectedParentId && name && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Path: {name}
              </div>
            )}
            {description && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {tag ? 'Update' : 'Create'} Tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}