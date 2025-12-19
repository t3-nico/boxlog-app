'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface PlanTitleInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export const PlanTitleInput = forwardRef<HTMLInputElement, PlanTitleInputProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        size={size}
        className={cn(
          'bg-popover focus-visible:ring-ring/50 border-0 px-0 text-2xl font-bold shadow-none focus-visible:ring-2',
          className
        )}
      />
    )
  }
)

PlanTitleInput.displayName = 'PlanTitleInput'
