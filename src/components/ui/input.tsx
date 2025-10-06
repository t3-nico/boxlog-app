import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = ({ className, type, ...props }: React.ComponentProps<'input'>) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-md border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 shadow-sm outline-none transition-[color,box-shadow,border-color]',
        'placeholder:text-neutral-400',
        'selection:bg-blue-600 selection:text-white',
        'focus-visible:border-blue-500 focus-visible:ring-[3px] focus-visible:ring-blue-500/50',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-red-600 aria-invalid:ring-red-600/20',
        'file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-900',
        'dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100',
        'dark:placeholder:text-neutral-500',
        'dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-400/50',
        'dark:aria-invalid:border-red-500 dark:aria-invalid:ring-red-500/40',
        'dark:file:text-neutral-100',
        'md:text-sm',
        className
      )}
      {...props}
    />
  )
}

export { Input }
