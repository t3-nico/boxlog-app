'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSmartFolderStore } from '@/lib/smart-folder-store'
import { useBoxStore } from '@/lib/box-store'
import { useTagStore } from '@/lib/tag-store'
import { SmartFolder, FolderCondition, FilterField, FilterOperator, FilterLogic } from '@/types/box'
import { Button } from '@/components/ui/button'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { ArrowLeft, Plus, X } from 'lucide-react'

// Color options for SmartFolders
const folderColors = [
  '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#eab308', '#64748b', '#991b1b',
  '#7c2d12', '#166534', '#155e75', '#1e40af', '#5b21b6'
]

// Icon options for SmartFolders
const folderIcons = [
  '📁', '📂', '🗂️', '📋', '📊', '📈', '📉', '🎯', 
  '🔥', '⚡', '🚀', '💻', '🛠️', '🔧', '⚙️', '🎨',
  '🧩', '🔍', '📝', '✅', '❌', '⏰', '🚨', '💡'
]

const generateConditionId = (): string => {
  return 'cond_' + Math.random().toString(36).substring(2)
}

const filterFields: { value: FilterField; label: string }[] = [
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'type', label: 'Type' },
  { value: 'tags', label: 'Tags' },
]

const operators: { value: FilterOperator; label: string }[] = [
  { value: 'is', label: 'is' },
  { value: 'is_not', label: 'is not' },
  { value: 'contains', label: 'contains' },
]

const logicOptions: { value: FilterLogic; label: string }[] = [
  { value: 'and', label: 'AND' },
  { value: 'or', label: 'OR' },
]

export default function AddSmartFolderPage() {
  const router = useRouter()
  const { addSmartFolder, smartFolders, getSmartFolder, getMatchingTasks } = useSmartFolderStore()
  const { getSortedTasks } = useBoxStore()
  const { getAllTags } = useTagStore()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [selectedIcon, setSelectedIcon] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [conditions, setConditions] = useState<FolderCondition[]>([createEmptyCondition()])
  const [previewCount, setPreviewCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const tasks = getSortedTasks()
  const tags = getAllTags()

  function createEmptyCondition(): FolderCondition {
    return {
      id: generateConditionId(),
      field: 'status',
      operator: 'is',
      value: '',
    }
  }

  useEffect(() => {
    // Update preview count when conditions change
    if (conditions.length > 0 && conditions.some(c => c.field && c.operator && c.value)) {
      const tempFolder = { conditions } as SmartFolder
      const matchingTasks = getMatchingTasks(tasks, tempFolder.id)
      setPreviewCount(matchingTasks.length)
    } else {
      setPreviewCount(0)
    }
  }, [conditions, tasks, getMatchingTasks])

  const handleAddCondition = () => {
    setConditions([...conditions, createEmptyCondition()])
  }

  const handleRemoveCondition = (conditionId: string) => {
    setConditions(conditions.filter(c => c.id !== conditionId))
  }

  const handleConditionChange = (conditionId: string, updates: Partial<FolderCondition>) => {
    setConditions(conditions.map(c => 
      c.id === conditionId ? { ...c, ...updates } : c
    ))
  }

  const getValueOptions = (field: FilterField) => {
    switch (field) {
      case 'status':
        return ['Todo', 'In Progress', 'Done', 'Cancelled', 'Backlog']
      case 'priority':
        return ['Low', 'Medium', 'High']
      case 'type':
        return ['Bug', 'Feature', 'Documentation']
      case 'tags':
        return tags.map(tag => ({ value: tag.id, label: tag.name }))
      default:
        return []
    }
  }

  // Get available parent folders (excluding level 3 folders)
  const getAvailableParents = () => {
    return smartFolders.filter(f => f.level < 3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const validConditions = conditions.filter(c => c.field && c.operator && c.value)
      const parentFolder = selectedParentId ? getSmartFolder(selectedParentId) : null
      const level = parentFolder ? parentFolder.level + 1 : 1

      addSmartFolder({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        icon: selectedIcon || undefined,
        parentId: selectedParentId || undefined,
        level,
        order: 0,
        conditions: validConditions,
      })

      router.push('/add?success=smart-folder')
    } catch (error) {
      console.error('Failed to create smart folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/add')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" data-slot="icon" />
          <span>Back to Add</span>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Create Smart Folder</h2>
        <p className="text-muted-foreground">
          Create a dynamic folder that automatically shows tasks matching your conditions
        </p>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            
            <Field>
              <Label>Parent Folder (Optional)</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label>Folder Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter folder name..."
                  required
                />
              </Field>
              
              <Field>
                <Label>Icon (Optional)</Label>
                <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select icon...</SelectItem>
                    {folderIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon} {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <Label>Description (Optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter folder description..."
              />
            </Field>

            <Field>
              <Label>Color</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {folderColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedColor === color 
                        ? 'border-gray-900 dark:border-gray-100 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </Field>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Conditions</Label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddCondition}
                  className="flex items-center space-x-1 text-sm"
                >
                  <Plus className="h-4 w-4" data-slot="icon" />
                  <span>Add Condition</span>
                </Button>
              </div>
              
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={condition.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      {index > 0 && (
                        <Select 
                          value={condition.logic || 'and'} 
                          onValueChange={(value) => handleConditionChange(condition.id, { logic: value as FilterLogic })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {logicOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      <Select
                        value={condition.field}
                        onValueChange={(value) => handleConditionChange(condition.id, { 
                          field: value as FilterField,
                          value: '' // Reset value when field changes
                        })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filterFields.map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => handleConditionChange(condition.id, { operator: value as FilterOperator })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {condition.field === 'tags' ? (
                        <Select
                          value={condition.value as string}
                          onValueChange={(value) => handleConditionChange(condition.id, { value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select tag..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Select tag...</SelectItem>
                            {getValueOptions(condition.field).map((tag: any) => (
                              <SelectItem key={tag.value} value={tag.value}>
                                {tag.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select
                          value={condition.value as string}
                          onValueChange={(value) => handleConditionChange(condition.id, { value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select value..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Select value...</SelectItem>
                            {getValueOptions(condition.field).map((option: any) => (
                              <SelectItem key={option.value || option} value={option.value || option}>
                                {option.label || option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveCondition(condition.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" data-slot="icon" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Preview
              </Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  {selectedIcon && (
                    <span className="text-lg">{selectedIcon}</span>
                  )}
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0" 
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {name || 'Folder name'}
                  </span>
                </div>
                {selectedParentId && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Path: {getSmartFolder(selectedParentId)?.path}/{name || 'Folder name'}
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
                {conditions.length > 0 && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Preview: {previewCount} task{previewCount !== 1 ? 's' : ''} match{previewCount === 1 ? 'es' : ''} these conditions
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/add')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Smart Folder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}