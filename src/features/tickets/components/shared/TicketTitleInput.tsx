'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface TicketTitleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const TicketTitleInput = forwardRef<HTMLInputElement, TicketTitleInputProps>(({ className, ...props }, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      className={cn(
        'bg-card dark:bg-card border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0',
        className
      )}
    />
  )
})

TicketTitleInput.displayName = 'TicketTitleInput'
