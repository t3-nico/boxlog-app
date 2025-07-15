'use client'

import { useState, useEffect } from 'react'
import { SmartFolder, FolderCondition, FilterField, FilterOperator, FilterLogic } from '@/types/box'
import { useSmartFolderStore } from '@/lib/smart-folder-store'
import { useBoxStore } from '@/lib/box-store'
import { useTagStore } from '@/lib/tag-store'
import { Button } from '@/components/ui/button'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogActions, 
  DialogBody, 
  DialogDescription, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Select } from '@/components/select'
import { Plus, X } from 'lucide-react'

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

interface SmartFolderModalProps {
  open: boolean
  onClose: () => void
  folder?: SmartFolder | null
  parentId?: string | null
}

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

export function SmartFolderModal({ open, onClose, folder, parentId }: SmartFolderModalProps) {
  const { 
    addSmartFolder, 
    updateSmartFolder, 
    getMatchingTasks, 
    smartFolders,
    getSmartFolder,
    canAddChild 
  } = useSmartFolderStore()
  const { getSortedTasks } = useBoxStore()
  const { getAllTags } = useTagStore()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [selectedIcon, setSelectedIcon] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [conditions, setConditions] = useState<FolderCondition[]>([])
  const [previewCount, setPreviewCount] = useState(0)
  
  const tasks = getSortedTasks()
  const tags = getAllTags()

  useEffect(() => {
    if (folder) {
      setName(folder.name)
      setDescription(folder.description || '')
      setSelectedColor(folder.color || '#3b82f6')
      setSelectedIcon(folder.icon || '')
      setSelectedParentId(folder.parentId || '')
      setConditions(folder.conditions)
    } else {
      setName('')
      setDescription('')
      setSelectedColor('#3b82f6')
      setSelectedIcon('')
      setSelectedParentId(parentId || '')
      setConditions([createEmptyCondition()])
    }
  }, [folder, open, parentId])

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

  function createEmptyCondition(): FolderCondition {
    return {
      id: generateConditionId(),
      field: 'status',
      operator: 'is',
      value: '',
    }
  }

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

  const handleSave = () => {
    if (!name.trim()) return

    const validConditions = conditions.filter(c => c.field && c.operator && c.value)
    const parentFolder = selectedParentId ? getSmartFolder(selectedParentId) : null
    const level = parentFolder ? parentFolder.level + 1 : 1

    const folderData = {
      name: name.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
      icon: selectedIcon || undefined,
      parentId: selectedParentId || undefined,
      level,
      order: folder?.order ?? 0,
      conditions: validConditions,
    }
    
    if (folder) {
      updateSmartFolder(folder.id, folderData)
    } else {
      addSmartFolder(folderData)
    }
    
    onClose()
  }

  // Get available parent folders (excluding level 3 folders and descendants of current folder)
  const getAvailableParents = () => {
    return smartFolders.filter(f => {
      // Can't be level 3 (max 3 levels)
      if (f.level >= 3) return false
      
      // When editing, can't select self or descendants
      if (folder && (f.id === folder.id || f.path.startsWith(folder.path + '/'))) return false
      
      return true
    })
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} size="2xl">
      <DialogTitle>
        {folder ? 'Edit Smart Folder' : 'Create Smart Folder'}
      </DialogTitle>
      <DialogDescription>
        Create a dynamic folder that automatically shows tasks matching your conditions.
      </DialogDescription>
      
      <DialogBody className="space-y-6">
        <Field>
          <Label>Parent Folder (Optional)</Label>
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
            <Label>Folder Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name..."
            />
          </Field>
          
          <Field>
            <Label>Icon (Optional)</Label>
            <Select
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
            >
              <option value="">Select icon...</option>
              {folderIcons.map((icon) => (
                <option key={icon} value={icon}>
                  {icon} {icon}
                </option>
              ))}
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
                className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
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
              plain
              onClick={handleAddCondition}
              className="flex items-center space-x-1 text-sm"
            >
              <Plus className="h-4 w-4" />
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
                      onChange={(e) => handleConditionChange(condition.id, { logic: e.target.value as FilterLogic })}
                      className="w-20"
                    >
                      {logicOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}
                  
                  <Select
                    value={condition.field}
                    onChange={(e) => handleConditionChange(condition.id, { 
                      field: e.target.value as FilterField,
                      value: '' // Reset value when field changes
                    })}
                    className="flex-1"
                  >
                    {filterFields.map(field => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </Select>
                  
                  <Select
                    value={condition.operator}
                    onChange={(e) => handleConditionChange(condition.id, { operator: e.target.value as FilterOperator })}
                    className="flex-1"
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </Select>
                  
                  {condition.field === 'tags' ? (
                    <Select
                      value={condition.value as string}
                      onChange={(e) => handleConditionChange(condition.id, { value: e.target.value })}
                      className="flex-1"
                    >
                      <option value="">Select tag...</option>
                      {getValueOptions(condition.field).map((tag: any) => (
                        <option key={tag.value} value={tag.value}>
                          {tag.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      value={condition.value as string}
                      onChange={(e) => handleConditionChange(condition.id, { value: e.target.value })}
                      className="flex-1"
                    >
                      <option value="">Select value...</option>
                      {getValueOptions(condition.field).map((option: any) => (
                        <option key={option.value || option} value={option.value || option}>
                          {option.label || option}
                        </option>
                      ))}
                    </Select>
                  )}
                  
                  {conditions.length > 1 && (
                    <Button
                      type="button"
                      plain
                      onClick={() => handleRemoveCondition(condition.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
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
      </DialogBody>
      
      <DialogActions>
        <Button plain onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!name.trim() || conditions.length === 0}
        >
          {folder ? 'Update' : 'Create'} Folder
        </Button>
      </DialogActions>
    </Dialog>
  )
}