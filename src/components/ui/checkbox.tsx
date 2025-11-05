'use client'

import * as React from 'react'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-blue-600',
      'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none',
      'dark:border-blue-500 dark:focus-visible:ring-offset-neutral-900',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-blue-600 data-[state=checked]:text-white',
      'data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:text-white',
      'dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:text-white',
      'dark:data-[state=indeterminate]:bg-blue-500 dark:data-[state=indeterminate]:text-white',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      {props.checked === 'indeterminate' ? (
        <Minus className="h-4 w-4" data-slot="icon" />
      ) : (
        <Check className="h-4 w-4" data-slot="icon" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
