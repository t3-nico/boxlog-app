'use client'

import * as React from 'react'

import { Check, ChevronDown, Plus, Tag, X } from 'lucide-react'

import { Badge } from '@/components/shadcn-ui/badge'
import { Button } from '@/components/shadcn-ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/shadcn-ui/command'
import { cn } from '@/lib/utils'

export interface TagOption {
  id: string
  name: string
  color?: string
  count?: number
}

interface TagsContextType {
  value: string[]
  onValueChange: (value: string[]) => void
  options: TagOption[]
  open: boolean
  setOpen: (open: boolean) => void
  onCreateTag?: (tagName: string) => void
  searchValue: string
  setSearchValue: (value: string) => void
}

const TagsContext = React.createContext<TagsContextType | undefined>(undefined)

function useTagsContext() {
  const context = React.useContext(TagsContext)
  if (!context) {
    throw new Error('Tags components must be used within Tags provider')
  }
  return context
}

interface TagsProps {
  value?: string[]
  onValueChange?: (value: string[]) => void
  options: TagOption[]
  children: React.ReactNode
  onCreateTag?: (tagName: string) => void
}

export const Tags = ({ value = [], onValueChange, options, children, onCreateTag }: TagsProps) => {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [open])

  const contextValue = {
    value,
    onValueChange: onValueChange || (() => {}),
    options,
    open,
    setOpen,
    onCreateTag,
    searchValue,
    setSearchValue,
  }

  return (
    <TagsContext.Provider value={contextValue}>
      <div className="relative" ref={containerRef}>
        {children}
      </div>
    </TagsContext.Provider>
  )
}

interface TagsTriggerProps {
  className?: string
  placeholder?: string
}

export const TagsTrigger = ({ className, placeholder = 'Select tags...' }: TagsTriggerProps) => {
  const { value, options, open, setOpen } = useTagsContext()
  const selectedOptions = options.filter((option) => value.includes(option.id))

  return (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn('h-auto min-h-10 min-w-48 items-start justify-between', className)}
      onClick={() => setOpen(!open)}
    >
      <div className="flex flex-1 flex-wrap gap-1">
        {selectedOptions.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          selectedOptions.map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className="flex items-center gap-1 border-0 text-xs"
              style={{
                backgroundColor: option.color ? `${option.color}20` : undefined,
                color: option.color || undefined,
              }}
            >
              <Tag className="h-3 w-3" />
              {option.name}
            </Badge>
          ))
        )}
      </div>
      <ChevronDown className="ml-2 mt-1 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  )
}

interface TagsValueProps {
  className?: string
}

export const TagsValue = ({ className }: TagsValueProps) => {
  const { value, onValueChange, options } = useTagsContext()
  const selectedOptions = options.filter((option) => value.includes(option.id))

  const handleRemove = (optionId: string) => {
    const newValue = value.filter((id) => id !== optionId)
    onValueChange(newValue)
  }

  if (selectedOptions.length === 0) return null

  return (
    <div className={cn('mb-2 flex flex-wrap gap-2', className)}>
      {selectedOptions.map((option) => (
        <Badge
          key={option.id}
          variant="secondary"
          className="cursor-pointer"
          style={{
            backgroundColor: option.color ? `${option.color}20` : undefined,
            color: option.color || undefined,
          }}
        >
          {option.name}
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove(option.id)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  )
}

interface TagsContentProps {
  children: React.ReactNode
  className?: string
}

export const TagsContent = ({ children, className }: TagsContentProps) => {
  const { open, setOpen: _setOpen } = useTagsContext()

  if (!open) return null

  return (
    <div
      className={cn(
        'bg-popover text-popover-foreground absolute left-0 top-full z-50 mt-1 max-h-60 min-w-48 overflow-hidden rounded-md border shadow-md',
        className
      )}
    >
      <Command>{children}</Command>
    </div>
  )
}

interface TagsInputProps {
  placeholder?: string
}

export const TagsInput = ({ placeholder = 'Search tags...' }: TagsInputProps) => {
  const { searchValue, setSearchValue } = useTagsContext()

  return <CommandInput placeholder={placeholder} value={searchValue} onValueChange={setSearchValue} />
}

export const TagsList = ({ children }: { children: React.ReactNode }) => {
  const { onCreateTag, searchValue, setSearchValue, options } = useTagsContext()

  // Check if searchValue doesn't match any existing tag
  const hasExactMatch = options.some((option) => option.name.toLowerCase() === searchValue.toLowerCase())

  return (
    <CommandList>
      {children}
      {onCreateTag && searchValue.trim() && !hasExactMatch && (
        <CommandGroup>
          <CommandItem
            onSelect={() => {
              onCreateTag(searchValue.trim())
              setSearchValue('')
            }}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create &quot;{searchValue.trim()}&quot;</span>
            </div>
          </CommandItem>
        </CommandGroup>
      )}
    </CommandList>
  )
}

export const TagsEmpty = ({ children }: { children: React.ReactNode }) => {
  return <CommandEmpty>{children}</CommandEmpty>
}

interface TagsGroupProps {
  children: React.ReactNode
  heading?: string
}

export const TagsGroup = ({ children, heading }: TagsGroupProps) => {
  return <CommandGroup heading={heading}>{children}</CommandGroup>
}

interface TagsItemProps {
  value: string
  children: React.ReactNode
}

export const TagsItem = ({ value, children }: TagsItemProps) => {
  const { value: selectedValues, onValueChange, setOpen: _setOpen } = useTagsContext()
  const isSelected = selectedValues.includes(value)

  const handleSelect = () => {
    const newValue = isSelected ? selectedValues.filter((id) => id !== value) : [...selectedValues, value]
    onValueChange(newValue)
  }

  return (
    <CommandItem onSelect={handleSelect}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">{children}</div>
        <Check className={cn('ml-auto h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
      </div>
    </CommandItem>
  )
}

// Convenience component that combines all the pieces
interface SimpleTagsProps {
  value?: string[]
  onValueChange?: (value: string[]) => void
  options: TagOption[]
  placeholder?: string
  className?: string
  onCreateTag?: (tagName: string) => void
}

export const SimpleTags = ({ value, onValueChange, options, placeholder, className, onCreateTag }: SimpleTagsProps) => {
  return (
    <Tags value={value} onValueChange={onValueChange} options={options} onCreateTag={onCreateTag}>
      <div className={cn('', className)}>
        <TagsTrigger placeholder={placeholder} />
        <TagsContent>
          <TagsInput />
          <TagsList>
            <TagsEmpty>No tags found.</TagsEmpty>
            <TagsGroup>
              {options.map((option) => (
                <TagsItem key={option.id} value={option.id}>
                  {option.color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />}
                  <span>{option.name}</span>
                  {option.count && <span className="text-muted-foreground ml-auto text-xs">({option.count})</span>}
                </TagsItem>
              ))}
            </TagsGroup>
          </TagsList>
        </TagsContent>
      </div>
    </Tags>
  )
}
