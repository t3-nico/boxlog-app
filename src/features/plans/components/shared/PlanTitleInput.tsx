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
      className={cn('bg-card dark:bg-card border-0 px-0 font-bold shadow-none focus-visible:ring-0', className)}
      style={{ fontSize: 'var(--font-size-xl)' }}
    />
  )
})

PlanTitleInput.displayName = 'PlanTitleInput'
