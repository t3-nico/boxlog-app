'use client'

import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface TicketDescriptionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isCompact?: boolean
}

export const TicketDescriptionTextarea = forwardRef<HTMLTextAreaElement, TicketDescriptionTextareaProps>(
  ({ className, isCompact = false, ...props }, ref) => {
    return (
      <Textarea
        {...props}
        ref={ref}
        className={cn(
          'bg-card text-muted-foreground dark:bg-card resize-none border-0 px-0 text-sm shadow-none focus-visible:ring-0',
          isCompact ? 'min-h-[60px]' : 'h-32 max-h-32 overflow-y-auto',
          className
        )}
        style={{
          scrollbarColor: 'var(--color-muted-foreground) var(--color-card)',
        }}
      />
    )
  }
)

TicketDescriptionTextarea.displayName = 'TicketDescriptionTextarea'
