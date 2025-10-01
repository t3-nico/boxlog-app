import { cn } from '@/lib/utils'

import { Link } from './link'

export const Text = ({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) => {
  return (
    <p
      data-slot="text"
      {...props}
      className={cn(className, 'text-base text-neutral-800 dark:text-neutral-200 sm:text-sm')}
    />
  )
}

export const TextLink = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Link>) => {
  return (
    <Link
      {...props}
      className={cn(
        className,
        'text-neutral-900 dark:text-neutral-100 underline decoration-current/50 data-hover:decoration-current'
      )}
    />
  )
}

export const Strong = ({ className, ...props }: React.ComponentPropsWithoutRef<'strong'>) => {
  return <strong {...props} className={cn(className, 'font-medium text-neutral-900 dark:text-neutral-100')} />
}

export const Code = ({ className, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
  return (
    <code
      {...props}
      className={cn(
        className,
        'rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 sm:text-[0.8125rem]'
      )}
    />
  )
}
