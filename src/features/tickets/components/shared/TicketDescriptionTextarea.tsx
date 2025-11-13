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
          isCompact ? 'max-h-[6rem] min-h-[1.5rem]' : 'h-32 max-h-32 overflow-y-auto',
          className
        )}
        style={{
          scrollbarColor: 'var(--color-muted-foreground) var(--color-card)',
          ...(isCompact && {
            height: 'auto',
            overflowY: 'auto',
          }),
        }}
        onInput={
          isCompact
            ? (e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                const newHeight = Math.min(target.scrollHeight, 96) // 96px = 6rem (4行分)
                target.style.height = `${newHeight}px`
              }
            : undefined
        }
      />
    )
  }
)

TicketDescriptionTextarea.displayName = 'TicketDescriptionTextarea'
