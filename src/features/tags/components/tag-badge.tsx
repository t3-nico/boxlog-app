'use client'

import { Tag } from '@/types/tags'
import { Badge } from '@/components/shadcn-ui/badge'

interface TagBadgeProps {
  tag: Tag
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showPath?: boolean
  onClick?: () => void
  onRemove?: () => void
}

export function TagBadge({ 
  tag, 
  size = 'sm', 
  showIcon = true, 
  showPath = false,
  onClick, 
  onRemove 
}: TagBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2'
  }

  return (
    <Badge
      className={`
        inline-flex items-center gap-1 cursor-pointer transition-all
        ${sizeClasses[size]}
        ${onClick ? 'hover:opacity-80' : ''}
      `}
      style={{ 
        backgroundColor: tag.color + '20', 
        color: tag.color,
        border: `1px solid ${tag.color}40`
      }}
      onClick={onClick}
    >
      {showIcon && tag.icon && (
        <span className="text-xs">{tag.icon}</span>
      )}
      <span>{showPath ? tag.path : tag.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:bg-red-100 hover:text-red-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
        >
          ×
        </button>
      )}
    </Badge>
  )
}