import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium transition-[color,box-shadow] w-fit shrink-0 [&>svg]:size-4 [&>svg]:pointer-events-none focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-blue-600 text-white [a&]:hover:bg-blue-600/90 dark:bg-blue-500 dark:[a&]:hover:bg-blue-500/90 focus-visible:border-blue-500 focus-visible:ring-blue-500/50',
        secondary:
          'border-transparent bg-neutral-300 text-neutral-900 [a&]:hover:bg-neutral-300/90 dark:bg-neutral-700 dark:text-neutral-100 dark:[a&]:hover:bg-neutral-700/90 focus-visible:border-neutral-400 focus-visible:ring-neutral-400/50',
        destructive:
          'border-transparent bg-red-600 text-white [a&]:hover:bg-red-600/90 dark:bg-red-500/60 dark:[a&]:hover:bg-red-500/50 focus-visible:border-red-500 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40',
        outline:
          'border-neutral-200 text-neutral-900 [a&]:hover:bg-neutral-100 [a&]:hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:[a&]:hover:bg-neutral-800 dark:[a&]:hover:text-neutral-100 focus-visible:border-neutral-400 focus-visible:ring-neutral-400/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Badge = ({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
