import clsx from 'clsx'

import { typography, colors } from '@/config/theme'

export const DescriptionList = ({ className, ...props }: React.ComponentPropsWithoutRef<'dl'>) => {
  return (
    <dl
      {...props}
      className={clsx(
        className,
        `grid grid-cols-1 ${typography.body.large} sm:grid-cols-[min(50%,--spacing(80))_auto] sm:${typography.body.small}`
      )}
    />
  )
}

export const DescriptionTerm = ({ className, ...props }: React.ComponentPropsWithoutRef<'dt'>) => {
  return (
    <dt
      {...props}
      className={clsx(
        className,
        `col-start-1 border-t ${colors.border.DEFAULT} pt-3 ${colors.text.secondary} first:border-none sm:border-t sm:${colors.border.DEFAULT} sm:py-3`
      )}
    />
  )
}

export const DescriptionDetails = ({ className, ...props }: React.ComponentPropsWithoutRef<'dd'>) => {
  return (
    <dd
      {...props}
      className={clsx(
        className,
        `pt-1 pb-3 ${colors.text.primary} sm:border-t sm:${colors.border.DEFAULT} sm:py-3 sm:nth-2:border-none`
      )}
    />
  )
}
