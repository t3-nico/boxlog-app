'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTagStore, tagColors, colorCategories } from '@/lib/tag-store'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { Select } from '@/components/select'
import { ArrowLeft } from 'lucide-react'

export default function AddTagPage() {
  const router = useRouter()
  const { addTag, getAllTags, getTagById } = useTagStore()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])
  const [selectedIcon, setSelectedIcon] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allTags = getAllTags()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const parentTag = selectedParentId ? getTagById(selectedParentId) : null
      const level = parentTag ? parentTag.level + 1 : 1

      const success = await addTag({
        name: name.trim(),
        color: selectedColor,
        description: description.trim() || undefined,
        icon: selectedIcon.trim() || undefined,
        parentId: selectedParentId || undefined,
        level,
        order: 0,
      })

      if (success) {
        router.push('/add?success=tag')
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get available parent tags (excluding level 3 tags)
  const getAvailableParents = () => {
    return allTags.filter(t => t.level < 3)
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-4">
        <Button
          plain
          onClick={() => router.push('/add')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" data-slot="icon" />
          <span>Back to Add</span>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Create New Tag</h2>
        <p className="text-muted-foreground">
          Create a new tag to organize and categorize your tasks
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            
            <Field>
              <Label>Parent Tag (Optional)</Label>
              <Select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
              >
                <option value="">None (Root level)</option>
                {getAvailableParents().map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.path} (Level {parent.level})
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label>Tag Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter tag name..."
                  required
                />
              </Field>
              
              <Field>
                <Label>Icon (Optional)</Label>
                <Input
                  value={selectedIcon}
                  onChange={(e) => setSelectedIcon(e.target.value)}
                  placeholder="Enter emoji or icon..."
                  maxLength={2}
                />
              </Field>
            </div>

            <Field>
              <Label>Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter tag description..."
                rows={3}
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
                          className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                            selectedColor === color 
                              ? 'border-gray-900 dark:border-gray-100 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' 
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

            {/* Preview Section */}
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
                    {selectedIcon && <span className="mr-1">{selectedIcon}</span>}
                    {name || 'Tag name'}
                  </span>
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
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              plain
              onClick={() => router.push('/add')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Tag'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}