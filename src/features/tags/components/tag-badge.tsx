'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tag } from '@/features/tags/types'

interface TagBadgeProps {
  tag: Tag
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  onClick?: () => void
  onRemove?: () => void
}

export const TagBadge = ({ tag, size = 'sm', showIcon = true, onClick, onRemove }: TagBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2',
  }

  return (
    <Badge
      className={`inline-flex cursor-pointer items-center gap-1 transition-all ${sizeClasses[size]} ${onClick ? 'hover:opacity-80' : ''} `}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`,
      }}
      onClick={onClick}
    >
      {showIcon && tag.icon ? <span className="text-xs">{tag.icon}</span> : null}
      <span>{tag.name}</span>
      {onRemove != null && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive ml-1 h-4 w-4 text-xs"
        >
          ×
        </Button>
      )}
    </Badge>
  )
}
