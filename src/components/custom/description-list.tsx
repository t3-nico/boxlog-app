import { cn } from '@/lib/utils'

export const DescriptionList = ({ className, ...props }: React.ComponentPropsWithoutRef<'dl'>) => {
  return (
    <dl
      {...props}
      className={cn(
        className,
        'grid grid-cols-1 text-base sm:grid-cols-[min(50%,--spacing(80))_auto] sm:text-sm'
      )}
    />
  )
}

export const DescriptionTerm = ({ className, ...props }: React.ComponentPropsWithoutRef<'dt'>) => {
  return (
    <dt
      {...props}
      className={cn(
        className,
        'col-start-1 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-neutral-800 dark:text-neutral-200 first:border-none sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3'
      )}
    />
  )
}

export const DescriptionDetails = ({ className, ...props }: React.ComponentPropsWithoutRef<'dd'>) => {
  return (
    <dd
      {...props}
      className={cn(
        className,
        'pt-1 pb-3 text-neutral-900 dark:text-neutral-100 sm:border-t sm:border-neutral-200 sm:dark:border-neutral-800 sm:py-3 sm:nth-2:border-none'
      )}
    />
  )
}
