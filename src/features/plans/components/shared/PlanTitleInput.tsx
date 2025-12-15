'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface PlanTitleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const PlanTitleInput = forwardRef<HTMLInputElement, PlanTitleInputProps>(({ className, ...props }, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      className={cn(
        'bg-popover focus-visible:ring-ring/50 border-0 px-0 text-2xl font-bold shadow-none focus-visible:ring-2',
        className
      )}
    />
  )
})

PlanTitleInput.displayName = 'PlanTitleInput'
